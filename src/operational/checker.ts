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

export class CheckerReporter {
    health: Health;
    output: string;
    action?: string;
    impact?: string;

    healthy(output: string): void {
      this.output = output;
      this.health = Health.Healthy;
    }

    degraded(output: string, action: string): void {
      this.output = output;
      this.action = action;
      this.health = Health.Degraded;
    }

    unhealthy(output: string, action: string, impact: string): void {
      this.output = output;
      this.action = action;
      this.impact = impact;
      this.health = Health.Unhealthy;
    }
}
