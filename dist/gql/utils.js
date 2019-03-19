"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fg = require("fast-glob");
const path = require("path");
const fs = require("fs");
const apollo_server_express_1 = require("apollo-server-express");
function generateSchema(basePath, glob, outputPath) {
    const grpahqlFiles = fg.sync([glob], { cwd: basePath });
    const schema = [];
    grpahqlFiles.forEach(file => {
        schema.push(fs.readFileSync(path.join(basePath, file), 'utf8'));
    });
    fs.writeFileSync(path.join(basePath, outputPath), JSON.stringify(apollo_server_express_1.gql(schema.join('\n'))));
}
exports.generateSchema = generateSchema;
//# sourceMappingURL=utils.js.map