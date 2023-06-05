import { createLogger, format, transports } from 'winston';
import fs from 'fs';

const logFormat = format.printf(({ level, message, label, timestamp }) => {
    return `[${label}] ${timestamp} ${level}: ${message}`;
});

function getSpecmaticConfig() {
    const packageJsonPath = './package.json';
    var specmaticConfig;
    if (fs.existsSync(packageJsonPath)) {
        let packageJsonContent;
        try {
            packageJsonContent = fs.readFileSync(packageJsonPath);
        } catch (error) {
            packageJsonContent = "{}";
        }
        const packageConfig = JSON.parse(packageJsonContent as unknown as string);
        specmaticConfig = packageConfig.specmatic;
    }
    return specmaticConfig || {};
}

export function initLogger() {
    const specmaticConfig = getSpecmaticConfig();
    const logger = createLogger({
        level: specmaticConfig.logLevel || 'warn',
        format: format.combine(format.label({ label: 'specmatic' }), format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), logFormat),
        transports: [new transports.Console()],
    });
    return logger;
}

export default initLogger();
