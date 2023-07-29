import { callKafka } from '../common/runner';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';
import axios from 'axios';
import terminate from 'terminate/promise';

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
                        if (stubInfo.length < 2) reject('Cannot determine port from kafka stub output');
                        else port = parseInt(stubInfo[1].trim());
                    } else if (message.indexOf('Starting api server on port') > -1) {
                        logger.info(`Kafka Stub: ${message}`);
                        const stubInfo = message.split(':');
                        if (stubInfo.length < 2) reject('Cannot determine api port from kafka stub output');
                        else apiPort = parseInt(stubInfo[1].trim());
                    } else if (message.indexOf('Listening on topic') > -1) {
                        logger.info(`Kafka Stub: ${message}`);
                        if (port && apiPort) resolve(new KafkaStub(port, apiPort, javaProcess));
                        else reject('No port or api port information available but kafka stub listening on topic already');
                    } else if (message.indexOf('Address already in use') > -1) {
                        logger.error(`Kafka Stub: ${message}`);
                        reject('Address already in use');
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

const stopKafkaStub = async (stub: KafkaStub) => {
    logger.debug(`Kafka Stub: Stopping at port=${stub.port}, apiPort=${stub.apiPort}`);
    const javaProcess = stub.process;
    javaProcess.stdout?.removeAllListeners();
    javaProcess.stderr?.removeAllListeners();
    javaProcess.removeAllListeners('close');
    await terminate(javaProcess.pid!);
    logger.info(`Kafka Stub: Stopped at port=${stub.port}, apiPort=${stub.apiPort}`);
};

const setKafkaStubExpectations = (stub: KafkaStub, expecations: any): Promise<void> => {
    const exectationsUrl = `http://localhost:${stub.apiPort}/_expectations`;
    logger.info(`Kafka Set Expectations: Url is ${exectationsUrl}`);
    return new Promise((resolve, reject) => {
        axios
            .post(`${exectationsUrl}`, expecations, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                logger.debug(`Kafka Set Expectations: Finished ${JSON.stringify(response.data)}`)
                resolve()
            })
            .catch(err => {
                logger.error(`Kafka Set Expectations: Failed with error ${err}`)
                reject(`Set expectation failed with error ${err}`)
            })
    });
};

const verifyKafkaStub = (stub: KafkaStub): Promise<Boolean> => {
    const verificationUrl = `http://localhost:${stub.apiPort}/_expectations/verifications`;
    logger.info(`Kafka Verification: Url is ${verificationUrl}`);
    return new Promise((resolve, reject) => {
        axios.post(`${verificationUrl}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                    logger.debug(`Kafka Verification: Finished ${JSON.stringify(response.data)}`);
                    if (!response.data.success) logger.info(`Kafka Verification: Errors\n${JSON.stringify(response.data)}`);
                    resolve(response.data.success);
            })
            .catch(err => {
                logger.error(`Kafka Verification: Failed with error ${err}`);
                reject(`Kafka verification failed with error ${err}`);
            });
    });
};

const verifyKafkaStubMessage = (stub: KafkaStub, topic: string, value: string): Promise<Boolean> => {
    const verificationUrl = `http://localhost:${stub.apiPort}/_verifications`;
    logger.info(`Kafka Verify Message: Url is ${verificationUrl}`);
    return new Promise((resolve, reject) => {
        axios.post(`${verificationUrl}`, { topic: topic, value: value }, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                logger.debug(`Kafka Verify Message: Finished ${JSON.stringify(response.data)}`);
                resolve(response.data.received);
            })
            .catch(err => {
                logger.error(`Kafka Verify Message: Failed with error ${err}`);
                reject(`Kafka message verification failed with error ${err}`);
            });
    });
};

export { startKafkaStub, stopKafkaStub, verifyKafkaStubMessage, verifyKafkaStub, setKafkaStubExpectations };
