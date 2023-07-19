import logger from '../common/logger'
import { callKafka, callCore } from '../common/runner'

const callSpecmaticCli = (args?: string[]) => {
    args = args || process.argv
    let cliArgs = extractArgsForJar(args)
    let fn = getJarFunction(args)
    logger.info(`CLI: Running with args "${cliArgs}"`)
    fn(
        cliArgs,
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
    )
}

function getJarFunction(args: string[]) {
    return args.length >= 3 && args[2] == 'kafka' ? callKafka : callCore
}

function extractArgsForJar(args: string[]) {
    const argsToRemove = args.length >= 3 && args[2] == 'kafka' ? 3 : 2
    return args.slice(argsToRemove).join(' ')
}

export default callSpecmaticCli
