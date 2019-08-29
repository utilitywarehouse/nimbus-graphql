import * as path from 'path';
import * as glob from 'fast-glob';
import { ConfigProvider } from './config.provider';
import { ConfigContainer } from './config.container';
import { Getter } from './config.getter';

export const Section = Symbol.for('config.section');

export class Config implements ConfigProvider {

  constructor(
        private readonly defaults: ConfigContainer,
        private readonly sections: {[key: string]: ConfigContainer},
  ) {

  }

  section(key: string): ConfigProvider {
    return new Getter(key, this.sections[key], this.defaults);
  }

  get(key: string): any {
    const defaultsHasProperty = Object.prototype.hasOwnProperty.call(this.defaults, key);
    if (defaultsHasProperty) {
      const value = this.defaults[key];

      if (Number.isNaN(value)) {
        throw new Error(`NaN encountered for key '${key}' in config`);
      }

      return value;
    }

    throw new Error(`could not find requested key '${key}' in config`);
  }

  static load(base: string, globPattern: string): Config {

    const files = glob.sync<string>(path.resolve(base, globPattern));

    const configs = files.map(f => {
      return require(f).default;
    });

    let defaults: ConfigContainer = {};
    const sections: {[key: string]: ConfigContainer} = {};

    configs.forEach(c => {
      if (c[Section]) {
        sections[c[Section]] = c;
      } else {
        defaults = { ...defaults, ...c };
      }
    });

    return new Config(defaults, sections);
  }
}
