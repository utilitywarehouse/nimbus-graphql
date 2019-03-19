import * as bunyan from 'bunyan';
import { Token } from 'typedi';
import { LogLevelString } from 'bunyan';
export declare type LoggerEntry = bunyan;
export declare const Logger: Token<bunyan>;
export declare class LoggerFactory {
    static new(name: string, level?: LogLevelString): LoggerEntry;
}
