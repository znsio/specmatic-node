import { ChildProcess } from 'child_process';
import nodeProcess from 'node:process';
import terminate from 'terminate/promise';
import logger from '../common/logger'

function isProcessRunning(pid: number): boolean {
    try {
        // Sending signal 0 doesn't kill the process, but will throw an error if the process doesn't exist
        nodeProcess.kill(pid, 0);
        logger.debug('Stub process is still running and needs to be terminated')
        return true;
    } catch (err: any) {
        logger.debug('Stub process has shut down due to the SIGTERM signal')
        // If process doesn't exist, ESRCH will be the error code
        return err.code !== 'ESRCH';
    }
}

export const gracefulShutdown = async function (javaProcess: ChildProcess): Promise<void> {

    logger.info('Sending SIGTERM to stop stub process')
    javaProcess.kill('SIGTERM')

    return new Promise((resolve) => {
        setTimeout(async () => {
            if (isProcessRunning(javaProcess.pid!)) {
                logger.debug('Terminating stub process...')
                await terminate(javaProcess.pid!) // Assuming terminate is a known function
            }
            resolve()
        }, 1000)
    })
}

