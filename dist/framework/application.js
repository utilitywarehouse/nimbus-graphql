"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const config_1 = require("../config");
const logger_1 = require("../logger");
const express_1 = require("./express");
class Application extends typedi_1.ContainerInstance {
    constructor(basePath) {
        const containerID = Symbol();
        super(containerID);
        this.basePath = basePath;
        this.modules = [];
        this.containerId = containerID;
        this.express = express_1.createExpressApp();
    }
    static create(basePath, modules, containerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = new Application(basePath);
            yield app.loadConfig();
            yield app.defaultLogger();
            yield app.initModules(modules);
            return app;
        });
    }
    config() {
        return this.get(config_1.Config);
    }
    logger() {
        return this.get(logger_1.Logger);
    }
    listen(handle, listeningListener) {
        return this.express.listen(handle, listeningListener);
    }
    setLogger(logger) {
        this.set(logger_1.Logger, logger);
    }
    initModules(modules) {
        return modules.reduce((promise, appModule) => {
            return promise.then(() => {
                const moduleInstance = new appModule(this);
                this.modules.push(moduleInstance);
                return moduleInstance.register();
            });
        }, Promise.resolve());
    }
    loadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield config_1.Config.load(this.basePath, '!(node_modules)/**/*.config.!(*.d){js,ts,json}');
            typedi_1.Container.set({ type: config_1.Config, value: config, global: true });
            return config;
        });
    }
    defaultLogger() {
        const config = typedi_1.Container.get(config_1.Config);
        return this.setLogger(logger_1.LoggerFactory.new(config.get('log.name'), config.get('log.level')));
    }
}
exports.Application = Application;
//# sourceMappingURL=application.js.map