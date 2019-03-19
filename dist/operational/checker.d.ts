import { Health } from './module';
export interface Checker {
    name: string;
    checkFn: (result: CheckerReporter) => void;
}
export interface CheckerResult {
    name: string;
    health: Health;
    output: string;
    action?: string;
    impact?: string;
}
export declare class CheckerReporter {
    health: Health;
    output: string;
    action?: string;
    impact?: string;
    healthy(output: string): void;
    degraded(output: string, action: string): void;
    unhealthy(output: string, action: string, impact: string): void;
}
