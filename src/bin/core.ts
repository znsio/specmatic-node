import execSh from 'exec-sh';
import path from 'path';
import { specmaticJarPathLocal } from '../config';
import logger from '../common/logger';

const callSpecmaticCli = (args?: string[]) => {
    const specmaticJarPath = path.resolve(specmaticJarPathLocal);
    const cliArgs = (args || process.argv).slice(2).join(' ');
    logger.info(`CLI: Running with args "${cliArgs}"`);
    execSh(`java -jar ${specmaticJarPath} ${cliArgs}`, {}, (err: any) => {
        if (err) {
            logger.info('CLI: Finished with non zero exit code: ', err.code);
            process.exitCode = err.code;
        } else {
            logger.info('CLI: Finished');
            process.exitCode = 0;
        }
    });
};

export default callSpecmaticCli;
