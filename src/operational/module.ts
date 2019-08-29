import * as prom from 'prom-client';
import { Checker, CheckerReporter, CheckerResult } from './checker';

export enum Ready {
    None,
    Yes,
    No,
}

export enum Health {
    Unhealthy = 'unhealthy',
    Degraded = 'degraded',
    Healthy = 'healthy',
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

export class OperationalModule {
    private owners: Owner[] = [];
    private links: Link[] = [];
    private revision: string;
    private checkers: Checker[] = [];
    private readyFn: () => boolean;
    private provideMetrics = false;

    constructor(
        private readonly name: string,
        private readonly description?: string,
    ) {
    }

    enableMetrics(): OperationalModule {
      this.provideMetrics = true;
      prom.collectDefaultMetrics();
      return this;
    }

    addOwner(name: string, slack?: string): OperationalModule {
      this.owners.push({ name, slack });
      return this;
    }

    addLink(description: string, url: string): OperationalModule {
      this.links.push({ description, url });
      return this;
    }

    setRevision(revision: string): OperationalModule {
      this.revision = revision;
      return this;
    }

    readyNone(): OperationalModule {
      this.readyFn = null;
      return this;
    }

    readyAlways(): OperationalModule {
      this.readyFn = () => true;
      return this;
    }

    readyNever(): OperationalModule {
      this.readyFn = () => false;
      return this;
    }

    readyCallback(fn: () => boolean): OperationalModule {
      this.readyFn = fn;
      return this;
    }

    addCheck(name: string, checkFn: (cr: CheckerReporter) => void): OperationalModule {
      this.checkers.push({ name, checkFn });
      return this;
    }

    readyUseHealthCheck(): OperationalModule {
      this.readyFn = () => {

        switch (this.health().health) {
        case Health.Degraded:
        case Health.Healthy:
          return true;
        default:
          return false;
        }
      };
      return this;
    }

    about(): ApplicationInformation {
      const about: ApplicationInformation = {
        name: this.name,
        description: this.description,
        owners: this.owners,
        links: this.links,
        build: null,
      };

      if (this.revision) {
        about.build = {
          revision: this.revision,
        };
      }

      return about;
    }

    ready(): Ready {
      if (!this.readyFn) {
        return Ready.None;
      }

      return this.readyFn() ? Ready.Yes : Ready.No;
    }

    metrics(): string {
      if (!this.provideMetrics) {
        return '';
      }

      return prom.register.metrics();
    }

    health(): ApplicationHealth {

      const result: CheckerResult[] = [];

      let seenHealthy;
      let seenDegraded;
      let seenUnhealthy;

      this.checkers.forEach((checker => {
        const checkerResult = new CheckerReporter();
        checker.checkFn(checkerResult);
        result.push({ // should checkFn be async?
          name: checker.name,
          health: checkerResult.health,
          output: checkerResult.output,
          action: checkerResult.action,
          impact: checkerResult.impact,
        });

        switch (checkerResult.health) {
        case Health.Unhealthy:
          seenUnhealthy = true;
          break;
        case Health.Degraded:
          seenDegraded = true;
          break;
        case Health.Healthy:
          seenHealthy = true;
          break;
        }
      }));

      let health = Health.Unhealthy;

      switch (true) {
      case seenUnhealthy:
        health = Health.Unhealthy;
        break;
      case seenDegraded:
        health = Health.Degraded;
        break;
      case seenHealthy:
        health = Health.Healthy;
        break;
      }

      return {
        name: this.name,
        description: this.description,
        health,
        checks: result,
      };
    }

}
