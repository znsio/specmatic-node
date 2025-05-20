import logger from '../common/logger'
import { callKafka, callCore, callGraphQl } from '../common/runner'
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const callSpecmaticCli = (args?: string[]) => {
    args = args || process.argv
    const argv = yargs(hideBin(args)).parserConfiguration({
        'camel-case-expansion': false,
        'boolean-negation': false,
        'parse-numbers': false,
        'dot-notation': false,
        'short-option-groups': false
    }).parseSync();
    const { _, $0, ...namedArgs } = argv;
    const fn = getJarFunction(_);
    const command = (_.join(' ') + ' ' + Object.entries(namedArgs).map(([key, value]) => `--${key}="${String(value)}"`).join(' ')).trim();
    logger.info(`CLI: Running with args "${command}"`);
    fn(
        command,
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

function getJarFunction(operation: any[]) {
    if(operation.length > 0) {
        switch (String(operation[0])) {
            case 'kafka':
                operation.splice(0,1);
                return callKafka
            case 'graphql':
                operation.splice(0,1);
                return callGraphQl
            default:
                return callCore
        }
    }
    return callCore
}

export default callSpecmaticCli
