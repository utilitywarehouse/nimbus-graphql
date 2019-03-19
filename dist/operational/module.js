"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prom = require("prom-client");
const checker_1 = require("./checker");
var Ready;
(function (Ready) {
    Ready[Ready["None"] = 0] = "None";
    Ready[Ready["Yes"] = 1] = "Yes";
    Ready[Ready["No"] = 2] = "No";
})(Ready = exports.Ready || (exports.Ready = {}));
var Health;
(function (Health) {
    Health["Unhealthy"] = "unhealthy";
    Health["Degraded"] = "degraded";
    Health["Healthy"] = "healthy";
})(Health = exports.Health || (exports.Health = {}));
class OperationalModule {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.owners = [];
        this.links = [];
        this.checkers = [];
        this.provideMetrics = false;
    }
    enableMetrics() {
        this.provideMetrics = true;
        prom.collectDefaultMetrics();
        return this;
    }
    addOwner(name, slack) {
        this.owners.push({ name, slack });
        return this;
    }
    addLink(description, url) {
        this.links.push({ description, url });
        return this;
    }
    setRevision(revision) {
        this.revision = revision;
        return this;
    }
    readyNone() {
        this.readyFn = null;
        return this;
    }
    readyAlways() {
        this.readyFn = () => true;
        return this;
    }
    readyNever() {
        this.readyFn = () => false;
        return this;
    }
    readyCallback(fn) {
        this.readyFn = fn;
        return this;
    }
    addCheck(name, checkFn) {
        this.checkers.push({ name, checkFn });
        return this;
    }
    readyUseHealthCheck() {
        this.readyFn = () => {
            switch (this.health().health) {
                case Health.Degraded:
                case Health.Healthy:
                    return true;
                default:
                    return false;
            }
        };
        return this;
    }
    about() {
        const about = {
            name: this.name,
            description: this.description,
            owners: this.owners,
            links: this.links,
            build: null,
        };
        if (this.revision) {
            about.build = {
                revision: this.revision,
            };
        }
        return about;
    }
    ready() {
        if (!this.readyFn) {
            return Ready.None;
        }
        return this.readyFn() ? Ready.Yes : Ready.No;
    }
    metrics() {
        if (!this.provideMetrics) {
            return '';
        }
        return prom.register.metrics();
    }
    health() {
        const result = [];
        let seenHealthy;
        let seenDegraded;
        let seenUnhealthy;
        this.checkers.forEach((checker => {
            const checkerResult = new checker_1.CheckerReporter();
            checker.checkFn(checkerResult);
            result.push({
                name: checker.name,
                health: checkerResult.health,
                output: checkerResult.output,
                action: checkerResult.action,
                impact: checkerResult.impact,
            });
            switch (checkerResult.health) {
                case Health.Unhealthy:
                    seenUnhealthy = true;
                    break;
                case Health.Degraded:
                    seenDegraded = true;
                    break;
                case Health.Healthy:
                    seenHealthy = true;
                    break;
            }
        }));
        let health = Health.Unhealthy;
        switch (true) {
            case seenUnhealthy:
                health = Health.Unhealthy;
                break;
            case seenDegraded:
                health = Health.Degraded;
                break;
            case seenHealthy:
                health = Health.Healthy;
                break;
        }
        return {
            name: this.name,
            description: this.description,
            health,
            checks: result,
        };
    }
}
exports.OperationalModule = OperationalModule;
//# sourceMappingURL=module.js.map