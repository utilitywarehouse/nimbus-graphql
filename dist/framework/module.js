"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
class Module {
    constructor(application) {
        this.app = application;
    }
    static setDev(value) {
        this.dev = value;
        return this;
    }
    bind(abstract, concrete) {
        if (this.app.has(concrete) || typeof concrete === 'function') {
            return this.app.set(abstract, this.get(concrete));
        }
        return this.app.set(abstract, concrete);
    }
    bindIf(condition, abstract, concrete) {
        if (condition) {
            return this.bind(abstract, concrete);
        }
    }
    bindIfDev(abstract, concrete) {
        const parentClass = this.constructor;
        return this.bindIf(parentClass.dev && this.config().get('service.isDev'), abstract, concrete);
    }
    import(factories) {
        typedi_1.Container.import(factories);
    }
    get(service) {
        return this.app.get(service);
    }
    config() {
        return this.app.config();
    }
}
Module.dev = true;
exports.Module = Module;
//# sourceMappingURL=module.js.map