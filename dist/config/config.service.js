"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const glob = require("fast-glob");
const config_getter_1 = require("./config.getter");
exports.Section = Symbol.for('config.section');
class Config {
    constructor(defaults, sections) {
        this.defaults = defaults;
        this.sections = sections;
    }
    section(key) {
        return new config_getter_1.Getter(key, this.sections[key], this.defaults);
    }
    get(key) {
        if (this.defaults.hasOwnProperty(key)) {
            const value = this.defaults[key];
            if (Number.isNaN(value)) {
                throw new Error(`NaN encountered for key '${key}' in config`);
            }
            return value;
        }
        throw new Error(`could not find requested key '${key}' in config`);
    }
    static load(base, globPattern) {
        const files = glob.sync(path.resolve(base, globPattern));
        const configs = files.map(f => {
            return require(f).default;
        });
        let defaults = {};
        const sections = {};
        configs.forEach(c => {
            if (c[exports.Section]) {
                sections[c[exports.Section]] = c;
            }
            else {
                defaults = Object.assign({}, defaults, c);
            }
        });
        return new Config(defaults, sections);
    }
}
exports.Config = Config;
//# sourceMappingURL=config.service.js.map