import { ChildProcess } from 'child_process';
declare const callCore: (args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void) => ChildProcess;
declare const callKafka: (args: string, done: (error: any) => void, onOutput: (message: string, error: boolean) => void) => ChildProcess;
export { callCore, callKafka };
