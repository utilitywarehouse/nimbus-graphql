"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("./module");
class CheckerReporter {
    healthy(output) {
        this.output = output;
        this.health = module_1.Health.Healthy;
    }
    degraded(output, action) {
        this.output = output;
        this.action = action;
        this.health = module_1.Health.Degraded;
    }
    unhealthy(output, action, impact) {
        this.output = output;
        this.action = action;
        this.impact = impact;
        this.health = module_1.Health.Unhealthy;
    }
}
exports.CheckerReporter = CheckerReporter;
//# sourceMappingURL=checker.js.map