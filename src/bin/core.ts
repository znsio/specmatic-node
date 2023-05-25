import execSh from 'exec-sh';
import path from 'path';
import { specmaticJarPathLocal } from '../config';

const callSpecmaticCli = (args?: string[]) => {
    const specmaticJarPath = path.resolve(specmaticJarPathLocal);
    const cliArgs = (args || process.argv).slice(2).join(' ');

    console.log('Running specmatic ', cliArgs);
    execSh(`java -jar ${specmaticJarPath} ${cliArgs}`, {}, (err: any) => {
        if (err) {
            console.log('Specmatic finished with non zero exit code: ', err.code);
            process.exitCode = err.code;
        } else {
            console.log('Specmatic finished');
            process.exitCode = 0;
        }
    });
};

export default callSpecmaticCli;
