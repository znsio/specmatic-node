/// <reference types="node" />
import { ChildProcess } from 'child_process';
export declare class KafkaStub {
    port: number;
    apiPort: number;
    process: ChildProcess;
    constructor(port: number, apiPort: number, process: ChildProcess);
}
declare const startKafkaStub: (port?: number, args?: (string | number)[]) => Promise<KafkaStub>;
declare const stopKafkaStub: (stub: KafkaStub) => Promise<void>;
declare const setKafkaStubExpectations: (stub: KafkaStub, expecations: any) => Promise<void>;
declare const verifyKafkaStub: (stub: KafkaStub) => Promise<Boolean>;
declare const verifyKafkaStubMessage: (stub: KafkaStub, topic: string, value: string) => Promise<Boolean>;
export { startKafkaStub, stopKafkaStub, verifyKafkaStubMessage, verifyKafkaStub, setKafkaStubExpectations };
