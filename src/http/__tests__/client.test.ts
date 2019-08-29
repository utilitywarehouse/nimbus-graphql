import axios from 'axios';
import { createClient } from '../http.client';
import { TransportError } from '../../errors';

const mockRequest = jest.fn();
mockRequest.mockResolvedValue('return');

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

mockAxios.create.mockReturnValue({
  request: mockRequest,
} as any);

describe('http client', () => {

  test('create adds default timeout', () => {
    createClient();
    // eslint-disable-next-line
    expect(mockAxios.create).toHaveBeenCalledWith({ timeout: 3000 });
  });

  test('create passes axios options', () => {
    createClient({
      timeout: 10,
      method: 'post',
    });
    // eslint-disable-next-line
    expect(mockAxios.create).toHaveBeenCalledWith({ timeout: 10, method: 'post' });
  });

  test('get', async () => {
    const client = createClient();

    await client.get('/url', { timeout: 10 });

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/url',
      method: 'get',
      data: undefined,
      validateStatus: null,
      timeout: 10,
    });
  });

  test('post', async () => {
    const client = createClient();

    await client.post('/url', { a: 1 }, { timeout: 10 });

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/url',
      method: 'post',
      validateStatus: null,
      timeout: 10,
      data: { a: 1 },
    });
  });

  test('put', async () => {
    const client = createClient();

    await client.put('/url', { a: 1 }, { timeout: 10 });

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/url',
      method: 'put',
      validateStatus: null,
      timeout: 10,
      data: { a: 1 },
    });
  });

  test('patch', async () => {
    const client = createClient();

    await client.patch('/url', { a: 1 }, { timeout: 10 });

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/url',
      method: 'patch',
      validateStatus: null,
      timeout: 10,
      data: { a: 1 },
    });
  });

  test('delete', async () => {
    const client = createClient();

    await client.delete('/url', { timeout: 10 });

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/url',
      method: 'delete',
      validateStatus: null,
      timeout: 10,
      data: undefined,
    });
  });

  test('throws transport error on failed request', () => {
    mockRequest.mockRejectedValue(new Error('err msg'));

    const client = createClient();

    expect(client.delete('/url', { timeout: 10 })).rejects.toThrow(TransportError);

  });
});
