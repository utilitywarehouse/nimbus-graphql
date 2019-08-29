import { StringBoolean } from '../index';

test('coercion', () => {
  expect(StringBoolean('true')).toBe(true);
  expect(StringBoolean('false')).toBe(false);
  expect(StringBoolean('whatever')).toBe(false);
  expect(StringBoolean('TRUE')).toBe(true);
});
