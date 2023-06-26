import { callKafka } from '../common/runner';
import logger from '../common/logger';
import { ChildProcess } from 'child_process';
import fetch from 'node-fetch';
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
        fetch(`${exectationsUrl}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expecations),
        })
            .then(response => {
                if (response.status != 200) {
                    logger.error(`Kafka Set Expectations: Failed with status code ${response.status}`);
                    reject();
                } else {
                    return response.text();
                }
            })
            .then(data => {
                logger.debug(`Kafka Set Expectations: Finished ${JSON.stringify(data)}`);
                resolve();
            })
            .catch(err => {
                logger.error(`Kafka Set Expectations: Failed with error ${err}`);
                reject();
            });
    });
};

const verifyKafkaStub = (stub: KafkaStub): Promise<Boolean> => {
    const verificationUrl = `http://localhost:${stub.apiPort}/_expectations/verifications`;
    logger.info(`Kafka Verification: Url is ${verificationUrl}`);
    return new Promise((resolve, reject) => {
        fetch(`${verificationUrl}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
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
                if (!data.success) logger.info(`Kafka Verification: Errors\n${JSON.stringify(data)}`);
                resolve(data.success);
            })
            .catch(err => {
                logger.error(`Kafka Verification: Failed with error ${err}`);
                reject();
            });
    });
};

const verifyKafkaStubMessage = (stub: KafkaStub, topic: string, value: string): Promise<Boolean> => {
    const verificationUrl = `http://localhost:${stub.apiPort}/_verifications`;
    logger.info(`Kafka Verify Message: Url is ${verificationUrl}`);
    return new Promise((resolve, reject) => {
        fetch(`${verificationUrl}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic, value: value }),
        })
            .then(response => {
                if (response.status != 200) {
                    logger.error(`Kafka Verify Message: Failed with status code ${response.status}`);
                    reject();
                } else {
                    return response.json();
                }
            })
            .then(data => {
                logger.debug(`Kafka Verify Message: Finished ${JSON.stringify(data)}`);
                resolve(data.received);
            })
            .catch(err => {
                logger.error(`Kafka Verify Message: Failed with error ${err}`);
                reject();
            });
    });
};

export { startKafkaStub, stopKafkaStub, verifyKafkaStubMessage, verifyKafkaStub, setKafkaStubExpectations };
