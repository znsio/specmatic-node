import { ChildProcess } from 'child_process';
import nodeProcess from 'node:process';
import terminate from 'terminate/promise';
import logger from '../common/logger'
const kill = require('tree-kill');

export const gracefulShutdown = async function (javaProcess: ChildProcess): Promise<void> {
    return new Promise((resolve, reject) => {
        logger.info('Sending SIGTERM to stop stub process')
        kill(javaProcess.pid, 'SIGTERM', (err:Error) => {
            if(err) {
                logger.debug('Failed to send SIGTERM to stub process tree:', err);
                resolve();
            } else {
                logger.debug('SIGTERM sent successfully to stub process tree');
                resolve();
            }
        });
    });
}

