import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { specmaticJarPathLocal, specmatic } from '../config';
import { ChildProcess } from 'child_process';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import logger from '../logger';

const specmaticJarPath = path.resolve(specmaticJarPathLocal);

const startStub = (host?: string, port?: string, stubDir?: string): Promise<ChildProcess> => {
    const stubs = path.resolve(stubDir + '');

    var cmd = `java -jar ${specmaticJarPath} stub`;
    if (stubDir) cmd += ` --data=${stubs}`;
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;

    logger.info('Stub: Starting server');
    logger.debug(`Stub: Executing "${cmd}"`);

    return new Promise((resolve, reject) => {
        const javaProcess = execSh(cmd, { stdio: 'pipe', stderr: 'pipe' }, (err: any) => {
            if (err) {
                logger.error(`Stub: Exited with error ${err}`);
            }
        });
        javaProcess.stdout.on('data', function (data: String) {
            if (data.indexOf('Stub server is running') > -1) {
                logger.info(`Stub: ${data}`);
                resolve(javaProcess);
            } else {
                logger.debug(`Stub: ${data}`);
            }
        });
        javaProcess.stderr.on('data', function (data: String) {
            logger.error(`Stub: ${data}`);
        });
    });
};

const stopStub = (javaProcess: ChildProcess) => {
    logger.info('Stopping stub server');
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    javaProcess.kill();
};

const test = (host?: string, port?: string, specs?: string): Promise<{ [k: string]: number } | undefined> => {
    const specsPath = path.resolve(specs + '');

    var cmd = `java -jar ${specmaticJarPath} test`;
    if (specs) cmd += ` ${specsPath}`;
    cmd += ' --junitReportDir=dist/test-report';
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;

    logger.info('Test: Running');
    logger.debug(`Test: Executing "${cmd}"`);

    const reportDir = path.resolve('dist/test-report');
    fs.rmSync(reportDir, { recursive: true, force: true });

    return new Promise((resolve, _reject) => {
        const javaProcess = execSh(cmd, { stdio: 'pipe', stderr: 'pipe' }, (err: any) => {
            if (err) {
                logger.error(`Test: Failed with error ${err}`);
            }
            var testCases = parseJunitXML();
            const total = testCases.length;
            const success = testCases.filter((testcase: { [id: string]: any }) => testcase['system-out'] && !testcase['failure']).length;
            const failure = testCases.filter((testcase: { [id: string]: any }) => testcase['failure']).length;
            var result = { total, success, failure };
            resolve(result);
        });
        javaProcess.stdout.on('data', function (data: String) {
            logger.debug(`Test: ${data}`);
        });
        javaProcess.stderr.on('data', function (data: String) {
            logger.error(`Test: ${data}`);
        });
    });
};

const showTestResults = (testFn: (name: string, cb: () => void) => void) => {
    var testCases = parseJunitXML();
    testCases.map(function (testcase: { [id: string]: any }) {
        var name = testcase['system-out'].trim().replace(/\n/g, '').split('display-name:  Scenario: ')[1].trim();
        testFn(name, () => {
            if (testcase.failure) throw new Error('Did not pass');
        });
    });
};

const setExpectations = (stubPath: string, stubServerBaseUrl?: string): Promise<boolean> => {
    const stubResponse = require(path.resolve(stubPath));

    logger.info('Set Expectations: Running');

    return new Promise((resolve, _reject) => {
        fetch(`${stubServerBaseUrl ? stubServerBaseUrl : `http://localhost:9000/`}_specmatic/expectations`, {
            method: 'POST',
            body: JSON.stringify(stubResponse),
        }).then(() => {
            logger.info('Set Expectations: Finished');
            resolve(true);
        });
    });
};

const printJarVersion = () => {
    const cmd = `java -jar ${specmaticJarPath} --version`;
    logger.info('Print Jar Version: Running');
    logger.debug(`Print Jar Version: Executing "${cmd}"`);

    execSh(cmd, {}, (err: any) => {
        if (err) {
            logger.error(`Print Jar Version: Failed with error ${err}`);
        }
    });
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
