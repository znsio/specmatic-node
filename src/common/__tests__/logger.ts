import { initLogger } from '../logger';

import fs from 'fs';

beforeEach(() => {
    jest.resetAllMocks();
});

test('logging level is debug as configured in package.json', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(
        '{\
            "specmatic": {\
                "logLevel": "debug"\
            }\
        }'
    );
    const logger = initLogger();
    expect(packageJsonFileReadSpy).toHaveBeenCalledTimes(1);
    expect(logger.level).toBe('debug');
});

test('logging level is info as configured in package.json', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(
        '{\
            "specmatic": {\
                "logLevel": "info"\
            }\
        }'
    );
    const logger = initLogger();
    expect(packageJsonFileReadSpy).toHaveBeenCalledTimes(1);
    expect(logger.level).toBe('info');
});

test('defaults logging level to warn when logLevel setting does not exist with specmatic configuration', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(
        '{\
            "specmatic": {\
            }\
        }'
    );
    const logger = initLogger();
    expect(packageJsonFileReadSpy).toHaveBeenCalledTimes(1);
    expect(logger.level).toBe('warn');
})

test('defaults logging level to warn when specmatic configuration does not exist', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(
        '{\
        }'
    );
    const logger = initLogger();
    expect(packageJsonFileReadSpy).toHaveBeenCalledTimes(1);
    expect(logger.level).toBe('warn');
})

test('defaults logging level to warn when package.json does not exist', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error();
    });
    const logger = initLogger();
    expect(packageJsonFileReadSpy).toHaveBeenCalledTimes(1);
    expect(logger.level).toBe('warn');
});
