import fetch from 'node-fetch';
import path from 'path';
import { ChildProcess } from 'child_process';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import logger from '../common/logger';
import callSpecmatic from '../common/runner';

const startStub = (host?: string, port?: string, stubDir?: string): Promise<ChildProcess> => {
    const stubs = path.resolve(stubDir + '');

    var cmd = `stub`;
    if (stubDir) cmd += ` --data=${stubs}`;
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;

    logger.info('Stub: Starting server');
    logger.debug(`Stub: Executing "${cmd}"`);

    return new Promise((resolve, reject) => {
        const javaProcess = callSpecmatic(
            cmd,
            (err: any) => {
                if (err) {
                    logger.error(`Stub: Exited with error ${err}`);
                }
            },
            (message, error) => {
                if (!error) {
                    if (message.indexOf('Stub server is running') > -1) {
                        logger.info(`Stub: ${message}`);
                        resolve(javaProcess);
                    } else if (message.indexOf('Address already in use') > -1) {
                        logger.error(`Stub: ${message}`);
                        reject();
                    } else {
                        logger.debug(`Stub: ${message}`);
                    }
                } else {
                    logger.error(`Stub: ${message}`);
                }
            }
        );
    });
};

const stopStub = (javaProcess: ChildProcess) => {
    logger.debug('Stopping stub server');
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    javaProcess.kill();
    logger.info('Stopped stub server');
};

const test = (host?: string, port?: string, specs?: string): Promise<{ [k: string]: number } | undefined> => {
    const specsPath = path.resolve(specs + '');

    var cmd = `test`;
    if (specs) cmd += ` ${specsPath}`;
    cmd += ' --junitReportDir=dist/test-report';
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;

    logger.info('Test: Running');
    logger.debug(`Test: Executing "${cmd}"`);

    const reportDir = path.resolve('dist/test-report');
    fs.rmSync(reportDir, { recursive: true, force: true });

    return new Promise((resolve, _reject) => {
        callSpecmatic(
            cmd,
            (err: any) => {
                if (err) logger.error(`Test: Failed with error ${err}`);
                var testCases = parseJunitXML();
                const total = testCases.length;
                const success = testCases.filter((testcase: { [id: string]: any }) => testcase['system-out'] && !testcase['failure']).length;
                const failure = testCases.filter((testcase: { [id: string]: any }) => testcase['failure']).length;
                var result = { total, success, failure };
                resolve(result);
            },
            (message, error) => {
                logger[error ? 'error' : 'debug'](`Test: ${message}`);
            }
        );
    });
};

const showTestResults = (testFn: (name: string, cb: () => void) => void) => {
    var testCases = parseJunitXML();
    testCases.map(function (testcase: { [id: string]: any }) {
        var name = 'No Name';
        if (testcase['system-out']) {
            const nameTempArr = testcase['system-out']
                .trim()
                .replace(/\n/g, '')
                .split(/display-name:.*Scenario: /);
            if (nameTempArr.length > 1) name = nameTempArr[1].trim();
        }
        testFn(name, () => {
            if (testcase.failure || testcase.skipped) throw new Error('Did not pass');
        });
    });
};

const setExpectations = (stubPath: string, stubServerBaseUrl?: string): Promise<void> => {
    const stubResponse = require(path.resolve(stubPath));

    logger.info('Set Expectations: Running');

    return new Promise((resolve, reject) => {
        fetch(`${stubServerBaseUrl ? stubServerBaseUrl : `http://localhost:9000/`}_specmatic/expectations`, {
            method: 'POST',
            body: JSON.stringify(stubResponse),
        })
            .then(response => {
                if (response.status != 200) {
                    logger.error(`Set Expectations: Failed with status code ${response.status}`);
                    reject();
                } else {
                    logger.info('Set Expectations: Finished');
                    resolve();
                }
            })
            .catch(err => {
                logger.error(`Set Expectations: Failed with error ${err}`);
                reject();
            });
    });
};

const printJarVersion = () => {
    const cmd = `--version`;
    logger.info('Print Jar Version: Running');
    logger.debug(`Print Jar Version: Executing "${cmd}"`);

    callSpecmatic(
        cmd,
        (err: any) => {
            if (err) logger.error(`Print Jar Version: Failed with error ${err}`);
        },
        (message, error) => {
            if (error) logger.error(`Print Jar Version: ${message}`);
            else console.log(`${message}`);
        }
    );
};

const parseJunitXML = () => {
    const reportPath = path.resolve('dist/test-report/TEST-junit-jupiter.xml');
    var data = fs.readFileSync(reportPath);
    const parser = new XMLParser();
    var resultXml = parser.parse(data);
    resultXml.testsuite.testcase = Array.isArray(resultXml.testsuite.testcase) ? resultXml.testsuite.testcase : [resultXml.testsuite.testcase];
    return resultXml.testsuite.testcase;
};

export { startStub, stopStub, test, setExpectations, printJarVersion, showTestResults };
