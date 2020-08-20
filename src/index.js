const init = async () => {
    const download = require('download');
    const { qontractJarRemotePath } = require('./config');

    console .log('Starting qontract jar download..')
    await (async () => {
        await download(qontractJarRemotePath, '.');
    })();
    console .log('Finished qontract jar download!!')
}

init();