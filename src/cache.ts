import { TemplatePayload } from './types';

interface CacheProvider<E = any> {
  /**
   * Retrieve a cached template payload from the cache
   *
   * @param {string} key
   * @returns {(Promise<TemplatePayload<E> | null>)}
   * @memberof CacheProvider
   */
  get(key: string): Promise<TemplatePayload<E> | null>;

  /**
   * Add a template payload to the cache
   *
   * @param {string} key
   * @param {TemplatePayload<E>} template
   * @returns {Promise<void>}
   * @memberof CacheProvider
   */
  set(key: string, template: TemplatePayload<E>): Promise<void>;
}
