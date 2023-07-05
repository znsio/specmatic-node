import execSh from 'exec-sh';
import path from 'path';
import { specmaticJarName, specmaticKafkaJarName } from '../config';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';

const callSpecmatic = (args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void): ChildProcess => {
    const rootPath = path.resolve(__dirname, '..', '..');
    const specmaticJarPath = path.resolve(rootPath, specmaticJarName);
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
    let java = 'java';
    if (process.env['endpointsAPI']) {
        java = `${java} -DendpointsAPI="${process.env['endpointsAPI']}"`;
    }
    const javaProcess = execSh(`${java} -jar ${jarPath} ${args}`, { stdio: 'pipe', stderr: 'pipe' }, done);
    javaProcess.stdout?.on('data', function (data: String) {
        onOutput(`${data}`, false);
    });
    javaProcess.stderr?.on('data', function (data: String) {
        onOutput(`${data}`, true);
    });
    return javaProcess;
}

export { callSpecmatic, callKafka };
