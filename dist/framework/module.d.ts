import { Application } from './application';
export interface IModule {
    register(): any;
}
export declare abstract class Module implements IModule {
    app: Application;
    static dev: boolean;
    constructor(application: Application);
    static setDev(value: boolean): new (app: Application) => Module;
    abstract register(): any;
    bind(abstract: any, concrete: any): Application;
    bindIf(condition: any, abstract: any, concrete: any): Application;
    bindIfDev(abstract: any, concrete: any): Application;
    import(factories: any): void;
    get<T>(service: any): T;
    config(): import("../config").Config;
}
