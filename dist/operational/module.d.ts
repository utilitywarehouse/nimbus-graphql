import { CheckerReporter, CheckerResult } from './checker';
export declare enum Ready {
    None = 0,
    Yes = 1,
    No = 2
}
export declare enum Health {
    Unhealthy = "unhealthy",
    Degraded = "degraded",
    Healthy = "healthy"
}
interface Owner {
    name: string;
    slack?: string;
}
interface Link {
    description: string;
    url: string;
}
interface BuildInformation {
    revision?: string;
}
export interface ApplicationInformation {
    name: string;
    description?: string;
    owners?: Owner[];
    links?: Link[];
    build?: BuildInformation;
}
export interface ApplicationHealth {
    name: string;
    description?: string;
    health: Health;
    checks: CheckerResult[];
}
export declare class OperationalModule {
    private readonly name;
    private readonly description?;
    private owners;
    private links;
    private revision;
    private checkers;
    private readyFn;
    private provideMetrics;
    constructor(name: string, description?: string);
    enableMetrics(): OperationalModule;
    addOwner(name: string, slack?: string): OperationalModule;
    addLink(description: string, url: string): OperationalModule;
    setRevision(revision: string): OperationalModule;
    readyNone(): OperationalModule;
    readyAlways(): OperationalModule;
    readyNever(): OperationalModule;
    readyCallback(fn: () => boolean): OperationalModule;
    addCheck(name: string, checkFn: (cr: CheckerReporter) => void): OperationalModule;
    readyUseHealthCheck(): OperationalModule;
    about(): ApplicationInformation;
    ready(): Ready;
    metrics(): string;
    health(): ApplicationHealth;
}
export {};
