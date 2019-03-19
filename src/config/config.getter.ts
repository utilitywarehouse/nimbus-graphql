import {ConfigProvider} from './config.provider';
import {ConfigContainer} from './config.container';

export class Getter implements ConfigProvider {
    constructor(
        private readonly name: string,
        private readonly section: ConfigContainer = {},
        private readonly defaults: ConfigContainer = {}) {
    }

    get(key: string): any {

        let value;

        if (this.section.hasOwnProperty(key)) {
            value = this.section[key];
        }

        if (!this.section.hasOwnProperty(key) && this.defaults.hasOwnProperty(key)) {
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
