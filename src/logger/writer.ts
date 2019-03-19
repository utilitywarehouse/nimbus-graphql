
// modified from https://github.com/trentm/node-bunyan/blob/master/examples/specific-level-streams.js
import * as bunyan from 'bunyan';
import WritableStream = NodeJS.WritableStream;

export class RecordWriter {
    public levels: {[k: string]: boolean};
    public stream: WritableStream;

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
