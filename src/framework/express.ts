import * as express from 'express';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import * as prom from 'prom-client';

const httpHistogram = new prom.Histogram({
  name: 'http_requests_seconds',
  help: 'measures http request duration',
  labelNames: ['path', 'status', 'method'],
  buckets: [0.2, 0.5, 1, 1.5, 3, 5, 10],
});

export const createExpressApp = (): express.Express => {

  const app = express();

  app.use((req: Request, _, next) => {
    req.headers['X-Correlation-ID'] = req.headers['X-Correlation-ID'] || uuid();
    next();
  });

  app.use((req: Request, res: Response, next) => {
    if (req.path === '/graphql') {
      const labels = { path: req.path, status: res.statusCode, method: req.method };
      const timeRequest = httpHistogram.startTimer(labels);

      res.on('finish', () => timeRequest({ ...labels, status: res.statusCode }));
    }

    next();
  });

  return app;
};
