import execSh from 'exec-sh';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';
import { specmaticJarPathLocal, specmaticJarName } from '../config';
import logger from '../common/logger';

const callSpecmaticCli = async (args?: string[]) => {
    const rootPath = path.resolve(__dirname, '..', '..');
    const specmaticJarPath = path.resolve(rootPath, specmaticJarName);
    logger.debug(`CLI: Specmatic jar path: ${specmaticJarPath}`);
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

function getSpecmaticJarPath() {
    return new Promise<string>((resolve, _reject) => {
        let specmaticJarPath = path.resolve(specmaticJarPathLocal);
        resolve(specmaticJarPath);
    }).then(specmaticJarPath => {
        //Get current directory
        console.log(`Script basename: ${__dirname}`);
        const rootPath = path.resolve(__dirname, '..', '..');
        const specmaticJarPath2 = path.resolve(rootPath, specmaticJarName);
        console.log(`Script jar path: ${specmaticJarPath2}`);
        console.log(`Script jar path exists? ${fs.existsSync(specmaticJarPath2)}`);
        if (!fs.existsSync(specmaticJarPath)) {
            return getGlobalSpecmaticJarPath();
        } else {
            return specmaticJarPath;
        }
    });
}

function getGlobalSpecmaticJarPath() {
    return new Promise((resolve, _reject) => {
        exec('npm root -g', (_err, stdout) => {
            const npmGlobalModuleInstallPath = stdout.replace(/\n/g, '');
            const jarPath = path.join(npmGlobalModuleInstallPath, 'specmatic', specmaticJarName);
            resolve(jarPath);
        });
    });
}

export default callSpecmaticCli;
