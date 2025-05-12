import path from 'path';
import { specmaticKafkaJarName } from '../../config';
import { ChildProcess, spawn } from 'child_process';
import { Readable } from 'stream';
import { mock as jestMock } from 'jest-mock-extended';
import * as specmatic from '../..';
import { KafkaStub } from '..';

jest.mock('child_process');
jest.mock('terminate');

const SPECMATIC_JAR_PATH = path.resolve(__dirname, '..', '..', '..', '..','specmatic-commercial', 'kafka', specmaticKafkaJarName);
const javaProcessMock = jestMock<ChildProcess>();
const readableMock = jestMock<Readable>();
javaProcessMock.stdout = readableMock;
javaProcessMock.stderr = readableMock;

beforeEach(() => {
    jest.resetAllMocks();
});

test('starts the specmatic kafka stub server', async () => {
    spawn.mockReturnValue(javaProcessMock);

    setTimeout(() => {
        const messageCallback = readableMock.on.mock.calls[0][1];
        messageCallback("[Specmatic::Mock] Starting api server on port:29092");
        messageCallback("[Specmatic::Mock] Kafka started on localhost:9092");
        messageCallback("[Specmatic::Mock] Listening on topics: (product-queries)")
    }, 0);

    await expect(specmatic.startKafkaStub()).resolves.toStrictEqual(
        new KafkaStub(9092, 29092, javaProcessMock)
    );

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe("");
});

test('takes additional pass through arguments', async () => {
    spawn.mockReturnValue(javaProcessMock);

    setTimeout(() => {
        const messageCallback = readableMock.on.mock.calls[0][1];
        messageCallback("[Specmatic::Mock] Starting api server on port:29092");
        messageCallback("[Specmatic::Mock] Kafka started on localhost:1234");
        messageCallback("[Specmatic::Mock] Listening on topics: (product-queries)")
    }, 0);

    await expect(specmatic.startKafkaStub(1234, ['p1', 'p2'])).resolves.toStrictEqual(
        new KafkaStub(1234, 29092, javaProcessMock)
    );

    expect(spawn.mock.calls[0][1][1]).toBe(`"${path.resolve(SPECMATIC_JAR_PATH)}"`);
    expect(spawn.mock.calls[0][1][2]).toBe(" --port=1234 p1 p2");
});

test('stopStub method stops any running stub server', async () => {
    specmatic.stopKafkaMock(new KafkaStub(1234, 29092, javaProcessMock));
    expect(readableMock.removeAllListeners).toHaveBeenCalledTimes(2);
    expect(javaProcessMock.removeAllListeners).toHaveBeenCalledTimes(1);
});
