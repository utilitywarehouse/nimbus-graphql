"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus = require("http-status-codes");
const module_1 = require("./module");
class Handlers {
    constructor(operational) {
        this.operational = operational;
        this.about = (_, res) => {
            res.status(200);
            res.json(this.applicationInformation);
            res.end();
        };
        this.ready = (_, res) => {
            switch (this.operational.ready()) {
                case module_1.Ready.No:
                    res.status(HttpStatus.SERVICE_UNAVAILABLE);
                    res.end();
                    return;
                case module_1.Ready.None:
                    res.status(HttpStatus.NOT_FOUND);
                    res.end();
                    return;
                default:
                    res.set('Content-Type', 'text/plain');
                    res.status(HttpStatus.OK);
                    res.send('ready\n');
            }
        };
        this.health = (_, res) => {
            const health = this.operational.health();
            if (!health.checks.length) {
                res.status(HttpStatus.NOT_FOUND);
                res.end();
                return;
            }
            res.json(this.operational.health());
        };
        this.metrics = (_, res) => {
            const metrics = this.operational.metrics();
            if (!metrics) {
                res.status(HttpStatus.NOT_FOUND);
                res.end();
                return;
            }
            res.send(metrics);
        };
        this.applicationInformation = operational.about();
    }
}
exports.Handlers = Handlers;
//# sourceMappingURL=handlers.js.map