import logger from '../common/logger'
import { callCore} from '../common/runner'

const callSpecmaticCli = (argsv?: string[]) => {
    const args = argsv || process.argv.slice(2);
    callCore(
        args,
        (err?: any) => {
            if (err) {
                logger.info('CLI: Finished with non zero exit code: ', err.code)
                process.exitCode = err.code
            } else {
                logger.info('CLI: Finished')
                process.exitCode = 0
            }
        },
        message => {
            console.log(`${message}`)
        }
    );
}

export default callSpecmaticCli
