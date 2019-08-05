import { Container, ContainerInstance } from 'typedi';
import {createServer as createHttpServer, Server} from 'http';
import Logger = require('bunyan');
import { Module } from './module';
import { Config } from '../config';
import { LoggerFactory, Logger as LoggerToken } from '../logger';
import { Express } from "express";
import { createExpressApp } from "./express";

/**
 * Application
 */
export class Application extends ContainerInstance {
  modules: Module[];
  basePath: string;
  containerId: symbol;
  express: Express;
  server: Server;

  constructor(basePath: string) {
    const containerID = Symbol();
    super(containerID);
    this.basePath = basePath;
    this.modules = [];
    this.containerId = containerID;
    this.express = createExpressApp();
    this.server = createHttpServer(this.express)
  }

  /**
   * Create an instance of the application
   * @param basePath
   * @param modules
   * @param containerId
   */
  static async create(basePath: string, modules: Array<new (app: Application) => Module>, containerId?: symbol) {
    const app = new Application(basePath);

    await app.loadConfig();
    await app.defaultLogger();
    await app.initModules(modules);

    return app;
  }

  /**
   * Get config Instance
   */
  config() {
    return this.get(Config);
  }

  /**
   * Get Logger Instance
   */
  logger() {
    return this.get(LoggerToken);
  }

  /**
   * Start application web server
   * @param handle
   * @param listeningListener
   */
  listen(handle: any, listeningListener?: Function) {
    return this.server.listen(handle, listeningListener);
  }

  /**
   * Set a custom logger
   * @param logger
   */
  setLogger(logger: Logger) {
    this.set(LoggerToken, logger);
    Container.set(LoggerToken, logger);
  }

  /**
   * Init all application modules
   */
  initModules(modules: Array<new (app: Application) => Module>) {
    return modules.reduce((promise: Promise<any>, appModule: new (app: Application) => Module) => {
      return promise.then(() => {
        const moduleInstance = new appModule(this);
        this.modules.push(moduleInstance);
        return moduleInstance.register();
      });
    }, Promise.resolve());
  }

  /**
   * Load configurations
   */
  private async loadConfig() {
    const config = await Config.load(this.basePath, '!(node_modules)/**/*.config.!(*.d){js,ts,json}');
    Container.set({ type: Config, value: config, global: true });
    return config;
  }

  /**
   * Default logger
   */
  private defaultLogger() {
    const config = Container.get(Config);
    return this.setLogger(LoggerFactory.new(
        config.get('log.name'),
        config.get('log.level'),
    ));
  }
}
