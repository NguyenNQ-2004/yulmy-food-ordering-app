import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

// Real axios instance (NOT mocked) so we exercise the actual request interceptor.
const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;

describe('api request interceptor — JWT attachment', () => {
  afterEach(() => jest.clearAllMocks());

  it('attaches the Bearer token from AsyncStorage to the Authorization header', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('jwt-token-123');

    const config = await requestInterceptor({ headers: {} });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
    expect(config.headers.Authorization).toBe('Bearer jwt-token-123');
  });

  it('leaves Authorization unset when no token is stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const config = await requestInterceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('still returns the config if AsyncStorage throws', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('storage boom'));

    const config = await requestInterceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
