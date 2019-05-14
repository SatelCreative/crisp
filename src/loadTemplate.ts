import { TemplatePayload, Params } from './types';
import MemoryCache, { CacheProvider } from './cache';
import defaultRequest, { Request } from './request';
import { normalizeQuery } from './utils';

interface TemplateLoaderConfig<E> {
  cache?: CacheProvider<E>;
  request?: Request<E>;
}

function TemplateLoader<E>({
  cache = MemoryCache<E>(),
  request = defaultRequest
}: TemplateLoaderConfig<E>) {
  return async (path: string, params: Params): Promise<TemplatePayload<E>> => {
    const { key, query } = normalizeQuery(path, params);

    // @todo better error handling when calling into client code
    const cacheHit = await Promise.resolve(cache.get(key));

    if (cacheHit) {
      return cacheHit;
    }

    // @todo better error handling when calling into client code
    const template = await request(path + '?' + query);

    await Promise.resolve(cache.set(key, template));

    return template;
  };
}

export default TemplateLoader;
