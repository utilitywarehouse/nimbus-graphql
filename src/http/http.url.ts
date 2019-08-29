import * as templates from 'uri-template';

interface Parameters {
    [k: string]: string;
}

export class URL {
  private constructor(private readonly template: string, private readonly parsed: string) {

  }

  static template(template: string, parameters?: Parameters): URL {

    const tpl = templates.parse(template);

    return new URL(template, tpl.expand(parameters));
  }

  urlTemplate(): string {
    return this.template;
  }

  toString(): string {
    return this.parsed;
  }
}
