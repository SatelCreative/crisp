import { TemplatePayload } from './types';

export interface CacheProvider<E = any> {
  /**
   * Retrieve a cached template payload from the cache
   *
   * @param {string} key
   * @returns {(Promise<TemplatePayload<E> | null>)}
   * @memberof CacheProvider
   */
  get(
    key: string
  ): Promise<TemplatePayload<E> | null> | TemplatePayload<E> | null;

  /**
   * Add a template payload to the cache
   *
   * @param {string} key
   * @param {TemplatePayload<E>} template
   * @returns {Promise<void>}
   * @memberof CacheProvider
   */
  set(key: string, template: TemplatePayload<E>): Promise<void> | void;
}

const cache = {};

/**
 * A simple global memory implementation of
 * CacheProvider. Used by default if no cache
 * is defined
 *
 * @template E
 * @returns {CacheProvider<E>}
 */
export function MemoryCache<E = any>(): CacheProvider<E> {
  const c = cache as { [key: string]: TemplatePayload<E> };
  return {
    get(key: string) {
      return c[key] || null;
    },
    set(key: string, template: TemplatePayload<E>) {
      c[key] = template;
    }
  };
}

export default MemoryCache;
