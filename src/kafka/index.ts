import { callKafka } from '../common/runner';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';

export class KafkaStub {
    port: number;
    process: ChildProcess;
    constructor(port: number, process: ChildProcess) {
        this.port = port;
        this.process = process;
    }
}

const startKafkaStub = (port?: number, args?: (string | number)[]): Promise<KafkaStub> => {
    var cmd = ``;
    if (port) cmd += ` --port=${port}`;
    if (args) cmd += ' ' + args.join(' ');

    logger.info('Kafka Stub: Starting server');
    logger.debug(`Kafka Stub: Executing "${cmd}"`);

    return new Promise((resolve, reject) => {
        let stub: KafkaStub;
        const javaProcess = callKafka(
            cmd,
            (err: any) => {
                if (err) {
                    logger.error(`Kafka Stub: Exited with error ${err}`);
                }
            },
            (message, error) => {
                if (!error) {
                    if (message.indexOf('Kafka started on port') > -1) {
                        logger.info(`Kafka Stub: ${message}`);
                        const stubInfo = message.split('on port');
                        if (stubInfo.length < 2) reject();
                        else {
                            const port = stubInfo[1].trim();
                            if ((port?.length ?? 0) == 0) reject();
                            else {
                                stub = new KafkaStub(parseInt(port), javaProcess);
                            }
                        }
                    } else if (message.indexOf('Kafka is now running') > -1) {
                        logger.info(`Kafka Stub: ${message}`);
                        if (stub) resolve(stub);
                        else reject();
                    } else if (message.indexOf('Address already in use') > -1) {
                        logger.error(`Kafka Stub: ${message}`);
                        reject();
                    } else {
                        logger.debug(`Kafka Stub: ${message}`);
                    }
                } else {
                    logger.error(`Kafka Stub: ${message}`);
                }
            }
        );
    });
};

const stopKafkaStub = (stub: KafkaStub) => {
    logger.debug(`Kafka Stub: Stopping at ${stub.port}`);
    const javaProcess = stub.process;
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    javaProcess.kill();
    logger.info(`Kafka Stub: Stopped at ${stub.port}`);
};

export { startKafkaStub, stopKafkaStub };
