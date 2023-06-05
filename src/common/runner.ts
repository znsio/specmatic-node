import execSh from 'exec-sh';
import path from 'path';
import { specmaticJarName } from '../config';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';

const callSpecmatic = (args: string, callback: (err: any) => void): ChildProcess => {
    const rootPath = path.resolve(__dirname, '..', '..');
    const specmaticJarPath = path.resolve(rootPath, specmaticJarName);
    logger.debug(`CLI: Specmatic jar path: ${specmaticJarPath}`);
    return execSh(`java -jar ${specmaticJarPath} ${args}`, { stdio: 'pipe', stderr: 'pipe' }, callback);
};

export default callSpecmatic;
