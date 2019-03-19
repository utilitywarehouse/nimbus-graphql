"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
const typedi_1 = require("typedi");
const writer_1 = require("./writer");
exports.Logger = new typedi_1.Token('logger');
class LoggerFactory {
    static new(name, level = 'info') {
        const logger = bunyan.createLogger({
            name,
            streams: [
                {
                    type: 'raw',
                    stream: new writer_1.RecordWriter([bunyan.ERROR, bunyan.FATAL], process.stderr),
                    level: bunyan.ERROR,
                },
                {
                    type: 'raw',
                    stream: new writer_1.RecordWriter([bunyan.TRACE, bunyan.INFO, bunyan.DEBUG, bunyan.WARN], process.stdout),
                    level: bunyan.TRACE,
                },
            ],
            level,
        });
        logger.addSerializers({
            err: (error) => error.render ? error.render() : error,
            error: (error) => error.render ? error.render() : error,
        });
        return logger;
    }
}
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=logger.js.map