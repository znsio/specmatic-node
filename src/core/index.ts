import axios from 'axios'
import path from 'path'
import { ChildProcess } from 'child_process'
import { XMLParser } from 'fast-xml-parser'
import fs from 'fs'
import logger from '../common/logger'
import { callCore } from '../common/runner'
import listExpressEndpoints from '../lib/express-list-endpoints';
import http from 'http'
import { AddressInfo } from 'net'
import { gracefulShutdown } from './shutdownUtils'

const freePortMessage = 'Free port found'
const stubServingMessage = 'serving endpoints from specs'

export class Stub {
    host: string
    port: number
    url: string
    process: ChildProcess
    constructor(host: string, port: number, url: string, process: ChildProcess) {
        this.host = host
        this.port = port
        this.url = url
        this.process = process
    }
}

const startStub = (host?: string, port?: number, args?: (string | number)[]): Promise<Stub> => {
    var cmd = `stub`
    if (host) cmd += ` --host=${host}`
    if (port) cmd += ` --port=${port}`
    if (args) cmd += ' ' + args.join(' ')

    logger.info('Stub: Starting server')
    logger.debug(`Stub: Executing "${cmd}"`)
    let parsedPort: string | null = port == null || port === 0 ? null : String(port);

    return new Promise((resolve, reject) => {
        const javaProcess = callCore(
            cmd,
            (err: any) => {
                if (err) {
                    logger.error(`Stub: Exited with error ${err}`)
                }
            },
            (message, error) => {
                if (!error) {
                    if (message.indexOf(freePortMessage) > -1) {
                        logger.info(`Stub: ${message}`)
                        parsedPort = parsedPort ?? message.split(`${freePortMessage}:`)[1].trim()
                    }
                    else if (message.indexOf(stubServingMessage) > -1) {
                        logger.info(`Stub: ${message}`)
                        const stubInfo = message.split(stubServingMessage)
                        if (stubInfo.length < 2) reject('Cannot determine url from stub output')
                        else try {
                            const stub = parseStubOutput(stubInfo, parsedPort, javaProcess);
                            resolve(stub);
                        } catch (e) { reject(extractErrorMessage(e)); }
                    } else if (message.indexOf('Address already in use') > -1) {
                        logger.error(`Stub: ${message}`)
                        reject('Address already in use')
                    } else {
                        logger.debug(`Stub: ${message}`)
                    }
                } else {
                    logger.error(`Stub: ${message}`)
                }
            }
        )
    })
}

function extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
}

function parseStubOutput(
    stubInfo: string[],
    parsedPort: string | null,
    javaProcess: ChildProcess
): Stub {
    const url = stubInfo[0].trim();
    const urlInfo = /\b(.*?):\/\/(.*?):([0-9]+)/.exec(url);
    
    if (urlInfo === null || (urlInfo?.length ?? 0) < 4) {
      throw new Error('Cannot determine host and port from stub output');
    }
  
    const regexPort = urlInfo[3];
    const finalPort = parsedPort ?? regexPort;
    let finalUrl: string;
  
    if (parsedPort && parsedPort !== regexPort) {
      finalUrl = `${urlInfo[1]}://${urlInfo[2]}:${parsedPort}`;
    } else {
      finalUrl = urlInfo[0];
    }
  
    return new Stub(urlInfo[2], Number.parseInt(finalPort), finalUrl, javaProcess);
}

const stopStub = async (stub: Stub) => {
    logger.debug(`Stub: Stopping server at ${stub.url}`)
    const javaProcess = stub.process
    javaProcess.stdout?.removeAllListeners()
    javaProcess.stderr?.removeAllListeners()
    javaProcess.removeAllListeners('close')
    logger.debug('Trying to stop stub process gracefully ...')
    await gracefulShutdown(javaProcess)
    logger.debug('Completed graceful termination of the stub process')
    logger.info(`Stub: Stopped server at ${stub.url}`)
}

const testWithApiCoverage = async (
    expressApp: any,
    host?: string,
    port?: number,
    contractPath?: string,
    args?: (string | number)[]
): Promise<{ [k: string]: number } | undefined> => {
    return new Promise(async (resolve, _reject) => {
        let apiCoverageServer = await startApiCoverageServer(expressApp)
        const results = await test(host, port, contractPath, args)
        apiCoverageServer.close(() => {
            resolve(results)
        })
    })
}

const test = (host?: string, port?: number, contractPath?: string, args?: (string | number)[]): Promise<{ [k: string]: number } | undefined> => {
    const specsPath = path.resolve(contractPath + '')

    var cmd = `test`
    if (contractPath) cmd += ` ${specsPath}`
    cmd += ' --junitReportDir=dist/test-report'
    if (host) cmd += ` --host=${host}`
    if (port) cmd += ` --port=${port}`
    if (args) cmd += ' ' + args.join(' ')

    logger.info('Test: Running')
    logger.debug(`Test: Executing "${cmd}"`)

    const reportDir = path.resolve('dist/test-report')
    fs.rmSync(reportDir, { recursive: true, force: true })

    return new Promise((resolve, _reject) => {
        callCore(
            cmd,
            (err: any) => {
                if (err) logger.error(`Test: Failed with error ${err}`)
                var testCases = parseJunitXML()
                const total = testCases.length
                const failure = testCases.filter((testcase: { [id: string]: any }) => testcase['failure'] || testcase['skipped']).length
                const success = total - failure
                var result = { total, success, failure }
                resolve(result)
            },
            (message, error) => {
                if (message.indexOf('API COVERAGE SUMMARY') > -1) {
                    console.log(message) //Log always for all log levels
                } else {
                    logger[error ? 'error' : 'debug'](`Test: ${message}`)
                }
            }
        )
    })
}

const showTestResults = (testFn: (name: string, cb: () => void) => void) => {
    var testCases = parseJunitXML()
    testCases.map(function (testcase: { [id: string]: any }) {
        var name = 'No Name'
        if (testcase['system-out']) {
            const nameTempArr = testcase['system-out']
                .trim()
                .replace(/\n/g, '')
                .split(/display-name:.*Scenario: /)
            if (nameTempArr.length > 1) name = nameTempArr[1].trim()
        }
        testFn(name, () => {
            if (testcase.failure || testcase.skipped) throw new Error('Did not pass')
        })
    })
}

const setExpectations = (stubPath: string, stubServerBaseUrl?: string): Promise<void> => {
    const stubResponse = require(path.resolve(stubPath))
    return setExpectationJson(stubResponse, stubServerBaseUrl)
}

const setExpectationJson = (stubResponse: any, stubServerBaseUrl?: string): Promise<void> => {
    stubServerBaseUrl = stubServerBaseUrl || 'http://localhost:9000'
    
    logger.info(`Set Expectations: Stub url is ${stubServerBaseUrl}`)

    return new Promise((resolve, reject) => {
        axios
            .post(`${stubServerBaseUrl}/_specmatic/expectations`, stubResponse)
            .then(response => {
                logger.debug(`Set Expectations: ${response.data}`)
                logger.info('Set Expectations: Finished')
                resolve()
            })
            .catch(err => {
                var setExpectationsErrorMessage = `Set Expectations: Failed with error ${err}`
                // Check if the response data is in text format
                if (err && err.response?.headers['content-type'] === 'text/plain') {
                    try {
                        // Use a check to handle text content
                        const errorText = typeof err.response.data === 'string' ? err.response.data : "Error text not available";
                        setExpectationsErrorMessage += ` - ${errorText}`;
                    } catch (e) {
                        logger.error("Failed to retrieve text error message.");
                    }
                }
                logger.error(setExpectationsErrorMessage)
                reject(setExpectationsErrorMessage)
            })
    })
}

const printJarVersion = () => {
    const cmd = `--version`
    logger.info('Print Jar Version: Running')
    logger.debug(`Print Jar Version: Executing "${cmd}"`)

    callCore(
        cmd,
        (err: any) => {
            if (err) logger.error(`Print Jar Version: Failed with error ${err}`)
        },
        (message, error) => {
            if (error) logger.error(`Print Jar Version: ${message}`)
            else console.log(`${message}`)
        }
    )
}

const startApiCoverageServer = (expressApp: any): Promise<http.Server> => {
    logger.debug(`Registering API endpoint for coverage`)
    let app = http.createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const endPoints = JSON.stringify(extractEndPoints(expressApp))
        logger.debug(`Endpoints: ${endPoints}`)
        res.end(endPoints)
    })
    return new Promise<http.Server>((resolve, reject) => {
        app.on('error', err => {
            logger.error('Error while starting end points server for api coverage', err)
            reject('Error while starting end points server for api coverage')
        })
        app.listen({ host: '127.0.0.1', port: 0 }, () => {
            const address = app.address() as AddressInfo | null
            process.env['endpointsAPI'] = `http://${address?.address}:${address?.port}`
            logger.info(`Endpoints API registered at ${process.env['endpointsAPI']}`)
            resolve(app)
        })
    })
}

const parseJunitXML = () => {
    const reportPath = path.resolve('dist/test-report/TEST-junit-jupiter.xml')
    var data = fs.readFileSync(reportPath)
    const parser = new XMLParser()
    var resultXml = parser.parse(data)
    resultXml.testsuite.testcase = Array.isArray(resultXml.testsuite.testcase) ? resultXml.testsuite.testcase : [resultXml.testsuite.testcase]
    return resultXml.testsuite.testcase
}

const listEndPoints = (expressApp: any): { [key: string]: string[] } => {
    const details = listExpressEndpoints(expressApp)
    let endPoints: { [key: string]: string[] } = {}
    details.map(apiDetail => {
        endPoints[apiDetail.path] = apiDetail.methods
    })
    delete endPoints['*']
    return endPoints
}

function extractEndPoints(expressApp: any) {
    let endPoints = listEndPoints(expressApp)
    let springActuatorPayload = {
        contexts: {
            application: {
                mappings: {
                    dispatcherServlets: {
                        dispatcherServlet: [],
                    },
                },
            },
        },
    }
    Object.keys(endPoints)
        .sort()
        .map(path => {
            springActuatorPayload.contexts.application.mappings.dispatcherServlets.dispatcherServlet.push({
                details: {
                    requestMappingConditions: {
                        methods: endPoints[path].sort(),
                        patterns: [convertEndpointToSpringSyntax(path)].map(removeRegexFromPath)
                    },
                },
            } as never)
        })
    return springActuatorPayload
}

const convertEndpointToSpringSyntax = (path: string) => {
    return path.replace(/:([^/]+)/g, '{$1}').replace(/\\/g, '')
}

const removeRegexFromPath = (path: string) => {
    return path.replace(/\([^()]*\)/g, '')
}

export { startStub, stopStub, test, testWithApiCoverage, setExpectations, setExpectationJson, printJarVersion, showTestResults }
export { startApiCoverageServer }
