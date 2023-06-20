import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import * as specmatic from '../..';

test('invokes the test function', () => {
    const cb = jest.fn();
    copyReportFile();
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(5);
    expect(() => cb.mock.calls[0][1]()).not.toThrow();
    expect(() => cb.mock.calls[1][1]()).not.toThrow();
    expect(() => cb.mock.calls[2][1]()).not.toThrow();
    expect(() => cb.mock.calls[3][1]()).toThrow();
    expect(() => cb.mock.calls[4][1]()).toThrow();
});

test('works with junit report from generative tests mode', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-generative.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(4);
});

test('shows "No Name" when test name cannot be found within system-out tag', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-no-testname.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('No Name', expect.any(Function));
});

test('shows "No Name" where system-out tag does not exist', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-corrupt.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('No Name', expect.any(Function));
});

test('handles report having skipped tests', () => {
    const cb = jest.fn();
    copyReportFileWithName('sample-junit-result-skipped.xml');
    specmatic.showTestResults(cb);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(() => cb.mock.calls[0][1]()).toThrow();
    expect(() => cb.mock.calls[1][1]()).not.toThrow();
    expect(() => cb.mock.calls[2][1]()).not.toThrow();
});

function copyReportFile() {
    copyReportFileWithName('sample-junit-result-multiple.xml');
}

function copyReportFileWithName(fileName: string) {
    const destDir = path.resolve('dist/test-report');
    if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
    }
    const srcPath = path.resolve('test-resources', fileName);
    const destPath = path.resolve(destDir, 'TEST-junit-jupiter.xml');
    copyFileSync(srcPath, destPath);
}
