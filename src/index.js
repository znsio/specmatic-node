const init = async () => {
    const download = require('download');

    console .log('Starting qontract jar download....')
    await (async () => {
        await download('https://github.com/qontract/qontract/releases/download/0.13.1/qontract.jar');
    })();
    console .log('Finished qontract jar download !')
}

init();