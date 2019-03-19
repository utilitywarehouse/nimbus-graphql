"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
class RecordWriter {
    constructor(levels, stream) {
        this.levels = {};
        levels.forEach((lvl) => {
            this.levels[bunyan.resolveLevel(lvl)] = true;
        });
        this.stream = stream;
    }
    mapLevelToString(lvl) {
        return bunyan.nameFromLevel[lvl];
    }
    write(record) {
        if (this.levels[record.level] !== undefined) {
            record.severity = this.mapLevelToString(record.level);
            const str = JSON.stringify(record, bunyan.safeCycles()) + '\n';
            this.stream.write(str);
        }
    }
}
exports.RecordWriter = RecordWriter;
//# sourceMappingURL=writer.js.map