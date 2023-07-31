import execSh from 'exec-sh';
import path from 'path';
import { specmaticCoreJarName, specmaticKafkaJarName } from '../config';
import logger from '../common/logger';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';

const callCore = (args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void): ChildProcess => {
    const rootPath = path.resolve(__dirname, '..', '..');
    const specmaticJarPath = path.resolve(rootPath, specmaticCoreJarName);
    logger.debug(`CLI: Specmatic jar path: ${specmaticJarPath}`);
    return callJar(specmaticJarPath, args, done, onOutput);
};

const callKafka = (args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void): ChildProcess => {
    const rootPath = path.resolve(__dirname, '..', '..', '..', 'specmatic-beta', 'kafka');
    const specmaticJarPath = path.resolve(rootPath, specmaticKafkaJarName);
    logger.debug(`CLI: Specmatic jar path: ${specmaticJarPath}`);
    return callJar(specmaticJarPath, args, done, onOutput);
};

function callJar(jarPath: string, args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void) {
    let argsList = [];
    if (process.env['endpointsAPI']) {
        argsList.push(`-DendpointsAPI="${process.env['endpointsAPI']}"`);
    }
    argsList = argsList.concat(['-jar', `"${jarPath}"`, args]);
    const javaProcess: ChildProcess = spawn('java', argsList, { stdio: 'pipe', stderr: 'pipe', shell: true } as SpawnOptions);
    javaProcess.stdout?.on('data', function (data: String) {
        onOutput(`${data}`, false);
    });
    javaProcess.stderr?.on('data', function (data: String) {
        onOutput(`${data}`, true);
    });
    javaProcess.on('close', function (code:number) {
        if (code) {
            done(new Error('Command exited with non zero code: ' + code))
        } else {
            done(null);
        }
    });
    return javaProcess;
}

export { callCore, callKafka };
