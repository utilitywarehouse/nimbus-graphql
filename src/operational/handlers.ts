import { Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ApplicationInformation, OperationalModule, Ready } from './module';

export class Handlers {
    applicationInformation: ApplicationInformation;
    constructor(private readonly operational: OperationalModule) {
      this.applicationInformation = operational.about();
    }

    about = (_: any, res: Response) => {
      res.status(200);
      res.json(this.applicationInformation);
      res.end();
    };

    ready = (_: any, res: Response) => {
      switch (this.operational.ready()) {
      case Ready.No:
        res.status(HttpStatus.SERVICE_UNAVAILABLE);
        res.end();
        return;
      case Ready.None:
        res.status(HttpStatus.NOT_FOUND);
        res.end();
        return;
      default:
        res.set('Content-Type', 'text/plain');
        res.status(HttpStatus.OK);
        res.send('ready\n');
      }
    };

    health = (_: any, res: Response) => {
      const health = this.operational.health();

      if (!health.checks.length) {
        res.status(HttpStatus.NOT_FOUND);
        res.end();
        return;
      }
      res.json(this.operational.health());
    };

    metrics = (_: any, res: Response) => {
      const metrics = this.operational.metrics();

      if (!metrics) {
        res.status(HttpStatus.NOT_FOUND);
        res.end();
        return;
      }

      res.send(metrics);
    };
}
