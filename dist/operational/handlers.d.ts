import { Response } from 'express';
import { ApplicationInformation, OperationalModule } from './module';
export declare class Handlers {
    private readonly operational;
    applicationInformation: ApplicationInformation;
    constructor(operational: OperationalModule);
    about: (_: any, res: Response) => void;
    ready: (_: any, res: Response) => void;
    health: (_: any, res: Response) => void;
    metrics: (_: any, res: Response) => void;
}
