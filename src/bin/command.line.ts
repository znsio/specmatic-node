import logger from '../common/logger';
import { callSpecmatic } from '../common/runner';

const callSpecmaticCli = (args?: string[]) => {
    const cliArgs = (args || process.argv).slice(2).join(' ');
    logger.info(`CLI: Running with args "${cliArgs}"`);
    callSpecmatic(
        cliArgs,
        (err?: any) => {
            if (err) {
                logger.info('CLI: Finished with non zero exit code: ', err.code);
                process.exitCode = err.code;
            } else {
                logger.info('CLI: Finished');
                process.exitCode = 0;
            }
        },
        message => {
            console.log(`${message}`);
        }
    );
};

export default callSpecmaticCli;
