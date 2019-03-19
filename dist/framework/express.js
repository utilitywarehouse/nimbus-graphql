"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const uuid_1 = require("uuid");
exports.createExpressApp = () => {
    const app = express();
    app.use((req, _, next) => {
        req.headers['X-Correlation-ID'] = req.headers['X-Correlation-ID'] || uuid_1.v4();
        next();
    });
    return app;
};
//# sourceMappingURL=express.js.map