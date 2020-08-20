const init = async () => {
    const download = require('download');
    const { qontractJarPathRemote } = require('./config');

    console.log('Starting qontract jar download..')
    await (async () => {
        await download(qontractJarPathRemote, '.');
    })();
    console.log('Finished qontract jar download!!')
}

init();