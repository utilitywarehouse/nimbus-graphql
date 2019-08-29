import { ConfigProvider } from './config.provider';
import { ConfigContainer } from './config.container';

export class Getter implements ConfigProvider {
  constructor(
    private readonly name: string,
    private readonly section: ConfigContainer = {},
    private readonly defaults: ConfigContainer = {}) {
  }

  get(key: string): any {

    let value;

    const sectionHasProperty = Object.prototype.hasOwnProperty.call(this.section, key);
    const defaultsHasProperty = Object.prototype.hasOwnProperty.call(this.defaults, key);

    if (sectionHasProperty) {
      value = this.section[key];
    }

    if (!sectionHasProperty && defaultsHasProperty) {
      value = this.defaults[key];
    }

    if (Number.isNaN(value)) {
      throw new Error(`NaN encountered for key '${key}' for section '${this.name}' in config`);
    } else if (value === undefined) {
      throw new Error(`could not find requested key '${key}' for section '${this.name}' in config`);
    }

    return value;
  }

}
