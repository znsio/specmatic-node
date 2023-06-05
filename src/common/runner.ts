import execSh from 'exec-sh';
import path from 'path';
import { specmaticJarName } from '../config';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';

const callSpecmatic = (args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void): ChildProcess => {
    const rootPath = path.resolve(__dirname, '..', '..');
    const specmaticJarPath = path.resolve(rootPath, specmaticJarName);
    logger.debug(`CLI: Specmatic jar path: ${specmaticJarPath}`);
    const javaProcess = execSh(`java -jar ${specmaticJarPath} ${args}`, { stdio: 'pipe', stderr: 'pipe' }, done);
    javaProcess.stdout?.on('data', function (data: String) {
        onOutput(`${data}`, false);
    });
    javaProcess.stderr?.on('data', function (data: String) {
        onOutput(`${data}`, true);
    });
    return javaProcess;
};

export default callSpecmatic;
