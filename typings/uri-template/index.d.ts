declare module 'uri-template' {
  export function parse(template: string): ParsedTemplate;

  interface ParsedTemplate {
    expand(parameters: any): string;
    toString(): string;
    toJSON(): string;
  }
}
