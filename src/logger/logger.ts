import * as bunyan from 'bunyan';
import { Token } from 'typedi';
import { LogLevelString } from 'bunyan';
import { RecordWriter } from './writer';

export type LoggerEntry = bunyan;

export const Logger = new Token<LoggerEntry>('logger');

export class LoggerFactory {
  static new(name: string, level: LogLevelString = 'info'): LoggerEntry {
    const logger = bunyan.createLogger({
      name,
      streams: [
        {
          type: 'raw',
          stream: new RecordWriter(
            [bunyan.ERROR, bunyan.FATAL],
            process.stderr,
          ),
          level: bunyan.ERROR,
        },
        {
          type: 'raw',
          stream: new RecordWriter(
            [bunyan.TRACE, bunyan.INFO, bunyan.DEBUG, bunyan.WARN],
            process.stdout,
          ),
          level: bunyan.TRACE,
        },
      ],
      level,
    });

    logger.addSerializers({
      err: (error) => error.render ? error.render() : error.message,
      error: (error) => error.render ? error.render() : error.message,
    });

    return logger;
  }
}
