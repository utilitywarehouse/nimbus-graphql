import * as fg from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs';
import { gql } from 'apollo-server-express';

export function generateSchema(basePath: string, glob: string, outputPath: string): void {
  const grpahqlFiles = fg.sync<string>([glob], { cwd: basePath });

  const schema: string[] = [];

  grpahqlFiles.forEach(file => {
    schema.push(fs.readFileSync(path.join(basePath, file), 'utf8'));
  });

  fs.writeFileSync(
    path.join(basePath, outputPath),
    JSON.stringify(gql(schema.join('\n')))
  );

}
