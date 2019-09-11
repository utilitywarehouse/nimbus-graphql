import * as templates from 'uri-template';

export class URL {
  private constructor(private readonly template: string, private readonly parsed: string) { }

  static template(template: string, parameters?: Record<string, string>) {
    const tpl = templates.parse(template);
    return new URL(template, tpl.expand(parameters));
  }

  urlTemplate = () => this.template;

  toString = () => this.parsed;
}
