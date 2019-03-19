/// <reference types="node" />
import WritableStream = NodeJS.WritableStream;
export declare class RecordWriter {
    levels: {
        [k: string]: boolean;
    };
    stream: WritableStream;
    constructor(levels: any, stream: any);
    mapLevelToString(lvl: any): string;
    write(record: any): void;
}
