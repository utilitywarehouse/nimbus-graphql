/// <reference types="node" />
import { ContainerInstance } from 'typedi';
import Logger = require('bunyan');
import { Module } from './module';
import { Config } from '../config';
import { Express } from "express";
export declare class Application extends ContainerInstance {
    modules: Module[];
    basePath: string;
    containerId: symbol;
    express: Express;
    constructor(basePath: string);
    static create(basePath: string, modules: Array<new (app: Application) => Module>, containerId?: symbol): Promise<Application>;
    config(): Config;
    logger(): Logger;
    listen(handle: any, listeningListener?: Function): import("http").Server;
    setLogger(logger: Logger): void;
    initModules(modules: Array<new (app: Application) => Module>): Promise<any>;
    private loadConfig;
    private defaultLogger;
}
