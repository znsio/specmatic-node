import logger from '../common/logger'
import { callKafka, callCore, callGraphQl } from '../common/runner'

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
    if(args.length >= 3) {
        switch (args[2]) {
            case 'kafka':
                return callKafka
            case 'graphql':
                return callGraphQl
            default:
                return callCore
        }
    }
    return callCore
}

function extractArgsForJar(args: string[]) {
    if(args.length >= 3) {
        switch (args[2]) {
            case 'kafka':
            case 'graphql':
                return args.slice(3).join(' ')
            default:
                return args.slice(2).join(' ')
        }
    }
    return args.slice(2).join(' ')
}

export default callSpecmaticCli
