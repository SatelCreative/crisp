import TemplateLoader from './TemplateLoader';
import { CacheProvider } from './cache';
import { TemplatePayload } from './types';

// Cache Mock
type Payload = TemplatePayload<any>;

let store: { [key: string]: Payload } = {};
const get = jest.fn().mockImplementation(key => store[key] || null);
const set = jest.fn().mockImplementation((key, payload) => {
  store[key] = payload;
});

const cache: CacheProvider = {
  get,
  set
};

beforeEach(() => {
  store = {};
  get.mockClear();
  set.mockClear();
});

describe('TemplateLoader()', () => {
  it('exists and returns a function', () => {
    expect(typeof TemplateLoader).toEqual('function');
    expect(typeof TemplateLoader()).toEqual('function');
  });

  it('accepts custom cache and request implementations', async () => {
    const request = jest.fn().mockResolvedValue({
      total: 0,
      pages: 0,
      page: 0,
      size: 0,
      payload: []
    });

    const loadTemplate = TemplateLoader({ cache, request });

    const foo = await loadTemplate('/foo');
    expect(request.mock.calls).toMatchSnapshot('/foo request calls');
    expect(store).toMatchSnapshot('/foo store state');
    expect(get.mock.calls).toMatchSnapshot('/foo cache get calls');
    expect(set.mock.calls).toMatchSnapshot('/foo cache set calls');
    expect(await loadTemplate('/foo')).toEqual(foo);
  });
});
