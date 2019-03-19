"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Getter {
    constructor(name, section = {}, defaults = {}) {
        this.name = name;
        this.section = section;
        this.defaults = defaults;
    }
    get(key) {
        let value;
        if (this.section.hasOwnProperty(key)) {
            value = this.section[key];
        }
        if (!this.section.hasOwnProperty(key) && this.defaults.hasOwnProperty(key)) {
            value = this.defaults[key];
        }
        if (Number.isNaN(value)) {
            throw new Error(`NaN encountered for key '${key}' for section '${this.name}' in config`);
        }
        else if (value === undefined) {
            throw new Error(`could not find requested key '${key}' for section '${this.name}' in config`);
        }
        return value;
    }
}
exports.Getter = Getter;
//# sourceMappingURL=config.getter.js.map