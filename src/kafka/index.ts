import { callKafka } from '../common/runner';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';
import fetch from 'node-fetch';

export class KafkaStub {
    port: number;
    apiPort: number;
    process: ChildProcess;
    constructor(port: number, apiPort: number, process: ChildProcess) {
        this.port = port;
        this.apiPort = apiPort;
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
        let port: number, apiPort: number;
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
                        else port = parseInt(stubInfo[1].trim());
                    } else if (message.indexOf('Starting api server on port') > -1) {
                        logger.info(`Kafka Stub: ${message}`);
                        const stubInfo = message.split(':');
                        if (stubInfo.length < 2) reject();
                        else apiPort = parseInt(stubInfo[1].trim());
                    } else if (message.indexOf('Listening on topic') > -1) {
                        logger.info(`Kafka Stub: ${message}`);
                        if (port && apiPort) resolve(new KafkaStub(port, apiPort, javaProcess));
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
    logger.debug(`Kafka Stub: Stopping at port=${stub.port}, apiPort=${stub.apiPort}`);
    const javaProcess = stub.process;
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    javaProcess.kill();
    logger.info(`Kafka Stub: Stopped at port=${stub.port}, apiPort=${stub.apiPort}`);
};

const verifyKafkaStub = (stub: KafkaStub, topic: string, key: string, value: string) => {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:${stub.apiPort}/_verifications`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic, key: key, value: value }),
        })
            .then(response => {
                if (response.status != 200) {
                    logger.error(`Kafka Verification: Failed with status code ${response.status}`);
                    reject();
                } else {
                    return response.json();
                }
            })
            .then(data => {
                logger.debug(`Kafka Verification: Finished ${JSON.stringify(data)}`);
                resolve(data.received);
            })
            .catch(err => {
                logger.error(`Kafka Verification: Failed with error ${err}`);
                reject();
            });
    });
};

export { startKafkaStub, stopKafkaStub, verifyKafkaStub };
