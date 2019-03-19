"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates = require("uri-template");
class URL {
    constructor(template, parsed) {
        this.template = template;
        this.parsed = parsed;
    }
    static template(template, parameters) {
        const tpl = templates.parse(template);
        return new URL(template, tpl.expand(parameters));
    }
    urlTemplate() {
        return this.template;
    }
    toString() {
        return this.parsed;
    }
}
exports.URL = URL;
//# sourceMappingURL=http.url.js.map