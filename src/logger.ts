import { createLogger, format, transports } from 'winston';
import fs from 'fs';

const data = fs.readFileSync('./package.json');
const packageConfig = JSON.parse(data as unknown as string);
const specmaticConfig = packageConfig.specmatic || {};

const logFormat = format.printf(({ level, message, label, timestamp }) => {
    return `[${label}] ${timestamp} ${level}: ${message}`;
});

export default createLogger({
    level: specmaticConfig.logLevel || 'warn',
    format: format.combine(format.label({ label: 'specmatic' }), format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), logFormat),
    transports: [new transports.Console()],
});
