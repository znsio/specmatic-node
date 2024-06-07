/// <reference types="node" />
import { ChildProcess } from 'child_process';
import http from 'http';
export declare class Stub {
    host: string;
    port: number;
    url: string;
    process: ChildProcess;
    constructor(host: string, port: number, url: string, process: ChildProcess);
}
declare const startStub: (host?: string, port?: number, args?: (string | number)[]) => Promise<Stub>;
declare const stopStub: (stub: Stub) => Promise<void>;
declare const testWithApiCoverage: (expressApp: any, host?: string, port?: number, contractPath?: string, args?: (string | number)[]) => Promise<{
    [k: string]: number;
} | undefined>;
declare const test: (host?: string, port?: number, contractPath?: string, args?: (string | number)[]) => Promise<{
    [k: string]: number;
} | undefined>;
declare const showTestResults: (testFn: (name: string, cb: () => void) => void) => void;
declare const setExpectations: (stubPath: string, stubServerBaseUrl?: string) => Promise<void>;
declare const setExpectationJson: (stubResponse: any, stubServerBaseUrl?: string) => Promise<void>;
declare const printJarVersion: () => void;
declare const startApiCoverageServer: (expressApp: any) => Promise<http.Server>;
export { startStub, stopStub, test, testWithApiCoverage, setExpectations, setExpectationJson, printJarVersion, showTestResults };
export { startApiCoverageServer };
