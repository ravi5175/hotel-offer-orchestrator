import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
	imports: [
		WinstonModule.forRoot({
			level: process.env.LOG_LEVEL || 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				winston.format.json(), // structured JSON logs
			),
			transports: [
				new winston.transports.Console({
				format: winston.format.combine(
					winston.format.colorize({ all: true }),
					winston.format.timestamp(),
					winston.format.printf(
					({ level, message, timestamp, context, stack, ...meta }) => {
						const base = `[${timestamp}] [${level}] ${context || ''} ${message}`;
						return stack ? `${base}\n${stack}` : base;
					},
					),
				),
				}),
				// optionally: file logging
				// new winston.transports.File({ filename: 'logs/app.log' }),
			],
		}),
	],
	exports: [WinstonModule],
})
export class LoggerModule {}
