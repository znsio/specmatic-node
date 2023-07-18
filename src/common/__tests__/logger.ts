import { initLogger } from '../logger'
import { when } from 'jest-when'

import fs from 'fs'

beforeEach(() => {
    jest.resetAllMocks()
    delete process.env.SPECMATIC_LOG_LEVEL
})

test('logging level is debug as configured in package.json', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{"specmatic": {"logLevel": "debug"}}')
    const logger = initLogger()
    expect(logger.level).toBe('debug')
})

test('logging level is info as configured in package.json', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{"specmatic": {"logLevel": "info"}}')
    const logger = initLogger()
    expect(logger.level).toBe('info')
})

test('defaults logging level to warn when logLevel setting does not exist with specmatic configuration', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{"specmatic": {}}')
    const logger = initLogger()
    expect(logger.level).toBe('warn')
})

test('defaults logging level to warn when specmatic configuration does not exist', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{}')
    const logger = initLogger()
    expect(logger.level).toBe('warn')
})

test('defaults logging level to warn when package.json does not exist', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy)
        .calledWith('./package.json')
        .mockImplementation(() => {
            throw new Error()
        })
    const logger = initLogger()
    expect(logger.level).toBe('warn')
})

test('log level is read from environment variable', () => {
    process.env.SPECMATIC_LOG_LEVEL = 'debug'
    const logger = initLogger()
    expect(logger.level).toBe('debug')
})

test('log level set in environment variable takes precendece over specmatic.json', () => {
    process.env.SPECMATIC_LOG_LEVEL = 'error'
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{"specmatic": {"logLevel": "debug"}}')
    const logger = initLogger()
    expect(logger.level).toBe('error')
})

test('log level set in environment variable is used instead of default', () => {
    process.env.SPECMATIC_LOG_LEVEL = 'error'
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{}')
    const logger = initLogger()
    expect(logger.level).toBe('error')
})

test('uses default log level "warn" when log level configured in specmatic.json is invalid', () => {
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{"specmatic": {"logLevel": "silly"}}')
    const logger = initLogger()
    expect(logger.level).toBe('warn')
})

test('ignores log level configured in environment variable when invalid', () => {
    process.env.SPECMATIC_LOG_LEVEL = 'silly'
    const packageJsonFileReadSpy = jest.spyOn(fs, 'readFileSync')
    when(packageJsonFileReadSpy).calledWith('./package.json').mockReturnValue('{"specmatic": {"logLevel": "debug"}}')
    const logger = initLogger()
    expect(logger.level).toBe('debug')
})
