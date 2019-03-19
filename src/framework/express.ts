import * as express from 'express';
import {Request} from 'express';
import {v4 as uuid} from 'uuid';

export const createExpressApp = () => {

    const app = express();

    app.use((req: Request, _, next) => {
        req.headers['X-Correlation-ID'] = req.headers['X-Correlation-ID'] || uuid();
        next();
    });

    return app;
};
