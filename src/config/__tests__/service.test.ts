import { Config } from '../config.service';

describe('config.service', () => {

  let config: Config;

  beforeAll(() => {
    config = Config.load(__dirname, 'fixtures/*.config.ts');
  });

  test('getting default value', () => {
    expect(config.get('test')).toBe('default-value');
  });

  test('getting section value', () => {
    expect(config.section('test').get('test')).toBe('section-value');
  });

  test('getting section value with fallback', () => {
    expect(config.section('test').get('other')).toBe('other-value');
  });

  test('exception on unknown section key', () => {
    expect(() => {
      config.section('test').get('n-a');
    }).toThrow('could not find requested key');
  });

  test('exception on unknown default key', () => {
    expect(() => {
      config.get('n-a');
    }).toThrow('could not find requested key');
  });

  test('exception on NaN section value (bad coercion)', () => {
    expect(() => {
      config.section('test').get('nan');
    }).toThrow('NaN encountered for key');
  });

  test('exception on NAN default value (bad coercion)', () => {
    expect(() => {
      config.get('nan');
    }).toThrow('NaN encountered for key');
  });

  test('reverting to default on unknown section', () => {
    expect(config.section('n-a').get('test')).toBe('default-value');
  });
});
