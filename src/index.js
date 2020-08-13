const init = () => {
    const download = require('download');

    (async () => {
        await download('https://github.com/qontract/qontract/releases/download/0.13.1/qontract.jar', 'qontract/lib');
    })();
}

init();