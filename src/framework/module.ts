import { Container, ObjectType } from 'typedi';
import { Application } from './application';
import { Config } from '../config';

export interface Module {
  register(): void;
}

export abstract class Module implements Module {

  app: Application;

  static dev = true;

  constructor(application: Application) {
    this.app = application;
  }

  /**
   * Set dev to true or false
   * @param value
   */
  static setDev(value: boolean): new (app: Application) => Module {
    this.dev = value;
    return this as any;
  }

  // abstract register(): void;

  /**
   * Bind an abstract type to a resolved type
   * @param abstract
   * @param concrete
   */
  bind(abstract: any, concrete: any): Application {
    if (this.app.has(concrete) || typeof concrete === 'function') {
      return this.app.set(abstract, this.get(concrete));
    }

    return this.app.set(abstract, concrete);
  }

  /**
   * Bind values if condition passes
   * @param condition
   * @param abstract
   * @param concrete
   */
  bindIf(condition: boolean, abstract: any, concrete: any): any {
    if (condition) {
      return this.bind(abstract, concrete);
    }
  }

  /**
   * Bind dependency only on dev mode
   * @param abstract
   * @param concrete
   */
  bindIfDev(abstract: any, concrete: any): any {
    const parentClass = this.constructor as typeof Module;
    return this.bindIf(
      parentClass.dev && this.config().get('service.isDev'),
      abstract,
      concrete,
    );
  }

  /**
   * Import classes into the container
   * @param factories
   */
  import(factories: Function[]): void {
    Container.import(factories);
  }

  /**
   * Retrieve dependency bound to the container
   * @param service
   */
  get<T>(service: ObjectType<T>): T {
    return this.app.get<T>(service);
  }

  /**
   * Return global configuration object
   */
  config(): Config {
    return this.app.config();
  }
}
