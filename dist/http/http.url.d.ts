interface Parameters {
    [k: string]: string;
}
export declare class URL {
    private readonly template;
    private readonly parsed;
    private constructor();
    static template(template: string, parameters?: Parameters): URL;
    urlTemplate(): string;
    toString(): string;
}
export {};
