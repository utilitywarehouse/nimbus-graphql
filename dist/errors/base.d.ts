export declare class BaseError extends Error {
    readonly previous?: Error | BaseError;
    static wrap<T>(this: new (message?: string, previous?: Error | BaseError) => T, previous: Error, message?: string): T;
    private correlationId;
    constructor(message?: string, previous?: Error | BaseError);
    setCorrelationId(correlationId: string): void;
    render(): any;
}
