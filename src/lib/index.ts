import fetch from 'node-fetch';
import path from 'path';
import execSh from 'exec-sh';
import { specmaticJarPathLocal, specmatic } from '../config';
import { ChildProcess } from 'child_process';

const specmaticJarPath = path.resolve(specmaticJarPathLocal);

const startStub = (host?: string, port?: string, stubDir?: string) : Promise<ChildProcess> => {
    const stubs = path.resolve(stubDir + '');

    var cmd = `java -jar ${specmaticJarPath} stub`;
    if (stubDir) cmd += ` --data=${stubs}`;
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;
    console.log(cmd);

    console.log('Starting specmatic stub server');
    return new Promise((resolve, _reject) => {
        const javaProcess = execSh(cmd, { stdio: 'pipe', stderr: 'pipe' }, (err: any) => {
            if (err) {
                console.error('Specmatic stub server exited with error', err);
            }
        });
        javaProcess.stdout.on('data', function (data: String) {
            console.log('STDOUT: ' + data);
            if (data.indexOf('Stub server is running') > -1) {
              resolve(javaProcess);
            }
        });
        javaProcess.stderr.on('data', function (data: String) {
            console.log('STDERR: ' + data);
        });
    });
};

const stopStub = (javaProcess: ChildProcess) => {
    console.log(`Stopping specmatic server`);
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    javaProcess.kill();
};

const test = (specs?: string, host?: string, port?: string): Promise<boolean> => {
    const specsPath = path.resolve(specs + '');

    var cmd = `java -jar ${specmaticJarPath} test`;
    if (specs) cmd += ` ${specsPath}`;
    if (host) cmd += ` --host=${host}`;
    if (port) cmd += ` --port=${port}`;
    console.log(cmd);

    console.log('Running specmatic tests');

    return new Promise((resolve, _reject) => {
        execSh(cmd, {}, (err: any) => {
            if (err) {
                console.error('Specmatic test run failed with error', err);
            }
            resolve(err == null);
        });
    });
};

const setExpectations = (stubPath: string, stubServerBaseUrl?: string):Promise<boolean> => {
    const stubResponse = require(path.resolve(stubPath));

    console.log('Setting expectations');

    return new Promise((resolve, _reject) => {
        fetch(`${stubServerBaseUrl ? stubServerBaseUrl : `http://localhost:9000/`}_specmatic/expectations`, {
            method: 'POST',
            body: JSON.stringify(stubResponse),
        }).then(json => {
            console.log(json);
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

export { startStub, stopStub, test, setExpectations, printJarVersion };
