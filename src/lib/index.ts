import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { specmaticJarPathLocal, specmatic } from '../config';
import { ChildProcess } from 'child_process';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

const specmaticJarPath = path.resolve(specmaticJarPathLocal);

const startStub = (host?: string, port?: string, stubDir?: string): Promise<ChildProcess> => {
    const stubs = path.resolve(stubDir + '');

    var cmd = `java -jar ${specmaticJarPath} stub`;
    if (stubDir) cmd += ` --data=${stubs}`;
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;
    // console.log(cmd);

    console.log('Starting specmatic stub server');
    return new Promise((resolve, _reject) => {
        const javaProcess = execSh(cmd, { stdio: 'pipe', stderr: 'pipe' }, (err: any) => {
            if (err) {
                console.error('Specmatic stub server exited with error', err);
            }
        });
        javaProcess.stdout.on('data', function (data: String) {
            // console.log('STDOUT: ' + data);
            if (data.indexOf('Stub server is running') > -1) {
                console.log('STDOUT: ' + data);
                resolve(javaProcess);
            }
        });
        javaProcess.stderr.on('data', function (data: String) {
            console.log('STDERR: ' + data);
        });
    });
};

const stopStub = (javaProcess: ChildProcess) => {
    console.log(`Stopping specmatic stub server`);
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    javaProcess.kill();
};

const test = (host?: string, port?: string, specs?: string): Promise<TestResult | undefined> => {
    const specsPath = path.resolve(specs + '');

    var cmd = `java -jar ${specmaticJarPath} test`;
    if (specs) cmd += ` ${specsPath}`;
    cmd += ' --junitReportDir=dist/test-report';
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;
    // console.log(cmd);

    console.log('Running specmatic tests');

    const reportDir = path.resolve('dist/test-report');
    fs.rmSync(reportDir, { recursive: true, force: true });

    return new Promise((resolve, _reject) => {
        execSh(cmd, { stdio: 'pipe', stderr: 'pipe' }, (err: any) => {
            // if (err) {
            //     console.error('Specmatic test run failed with error', err);
            // }
            var testCases = parseJunitXML();
            const total = testCases.length;
            const success = testCases.filter((testcase: { [id: string]: any }) => testcase['system-out'] && !testcase['failure']).length;
            const failure = testCases.filter((testcase: { [id: string]: any }) => testcase['failure']).length;
            var result = new TestResult(total, success, failure);
            resolve(result);
        });
    });
};

const showTestResults = (cb: (name: string, result: boolean) => {}) => {
    var testCases = parseJunitXML();
    testCases.map(function (testcase: { [id: string]: any }) {
        var name = testcase['system-out'].trim().replaceAll('\n', '').split('display-name:  Scenario: ')[1].trim();
        cb(name, !testcase.failure);
    });
};

const setExpectations = (stubPath: string, stubServerBaseUrl?: string): Promise<boolean> => {
    const stubResponse = require(path.resolve(stubPath));

    console.log('Setting expectations');

    return new Promise((resolve, _reject) => {
        fetch(`${stubServerBaseUrl ? stubServerBaseUrl : `http://localhost:9000/`}_specmatic/expectations`, {
            method: 'POST',
            body: JSON.stringify(stubResponse),
        }).then(json => {
            console.log('Setting expectations complete');
            resolve(true);
        });
    });
};

const printJarVersion = () => {
    execSh(`java -jar ${specmaticJarPath} --version`, {}, (err: any) => {
        if (err) {
            console.error('Could not print specmatic version', err);
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

class TestResult {
    count: number;
    success: number;
    failure: number;

    constructor(count: number, success: number, failure: number) {
        this.count = count;
        this.success = success;
        this.failure = failure;
    }
}

export { startStub, stopStub, test, setExpectations, printJarVersion, showTestResults };
