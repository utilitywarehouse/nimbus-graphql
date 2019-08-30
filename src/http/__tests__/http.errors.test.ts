import getErrorFromStatusCode from '../http.errors';
import { InternalServerError } from '../../errors';

describe('http.errors', () => {
  it('the default error must be "internal server error"', () => {
    expect(getErrorFromStatusCode(1000)).toBe(InternalServerError);
  });
});
