import { config, createLogger, format, transports } from 'winston'
import fs from 'fs'

const logFormat = format.printf(({ level, message, label, timestamp }) => {
    return `[${label}] ${timestamp} ${level}: ${message}`
})

function getSpecmaticConfig() {
    const packageJsonPath = './package.json'
    var specmaticConfig
    if (fs.existsSync(packageJsonPath)) {
        let packageJsonContent
        try {
            packageJsonContent = fs.readFileSync(packageJsonPath)
        } catch (error) {
            packageJsonContent = '{}'
        }
        const packageConfig = JSON.parse(packageJsonContent as unknown as string)
        specmaticConfig = packageConfig.specmatic
    }
    return specmaticConfig || {}
}

function getLogLevel() {
    let logLevel
    if (process.env.SPECMATIC_LOG_LEVEL) {
        logLevel = process.env.SPECMATIC_LOG_LEVEL
    }
    if (!logLevel || !config.syslog.levels[logLevel]) {
        const specmaticConfig = getSpecmaticConfig()
        logLevel = specmaticConfig.logLevel
    }
    if (!logLevel || !config.syslog.levels[logLevel]) {
        logLevel = 'warn'
    }
    return logLevel
}

export function initLogger() {
    let logLevel = getLogLevel()
    const logger = createLogger({
        level: logLevel,
        format: format.combine(format.label({ label: 'specmatic' }), format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), logFormat),
        transports: [new transports.Console()],
    })
    return logger
}

export default initLogger()
