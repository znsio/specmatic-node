import { ChildProcess } from 'child_process';
import nodeProcess from 'node:process';
import terminate from 'terminate/promise';

function isProcessRunning(pid: number): boolean {
    try {
        // Sending signal 0 doesn't kill the process, but will throw an error if the process doesn't exist
        nodeProcess.kill(pid, 0);
        return true;
    } catch (err: any) {
        // If process doesn't exist, ESRCH will be the error code
        return err.code !== 'ESRCH';
    }
}

export const gracefulShutdown = async function (javaProcess: ChildProcess): Promise<void> {
    javaProcess.kill('SIGTERM')

    return new Promise((resolve) => {
        setTimeout(async () => {
            if (isProcessRunning(javaProcess.pid!)) {
                await terminate(javaProcess.pid!) // Assuming terminate is a known function
            }
            resolve()
        }, 5000)
    })
}

