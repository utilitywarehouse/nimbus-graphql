"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./config.service"));
exports.StringBoolean = (value) => {
    return value.toLowerCase().trim() === 'true';
};
//# sourceMappingURL=index.js.map