import download from 'download';
import { qontractJarPathRemote } from './config';
export { loadDynamicStub } from './lib';

const init = async () => {
    console.log('Starting qontract jar download..')
    await (async () => {
        await download(qontractJarPathRemote, '.');
    })();
    console.log('Finished qontract jar download!!')
}

init();