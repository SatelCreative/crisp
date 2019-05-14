import { hash } from '../vendor';
import { Params } from '../types';

interface NormalizedQuery {
  query: string;
  key: string;
}

/**
 * Takes a seed and an object of query params
 * and generates a normalized urlencoded query
 * string along with a unique key that can be
 * used for caching etc.
 *
 * @param {string} seed for example collection handle or search query
 * @param {Params} params
 * @returns {NormalizedQuery}
 */
export function normalizeQuery(seed: string, params: Params): NormalizedQuery {
  const p = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const param = params[key];
    const value = typeof param === 'number' ? param.toString() : param;
    p.append(key, value);
  });

  p.sort();

  const query = p.toString();
  const key = hash(seed + '-' + p).toString(10);

  return {
    key,
    query
  };
}
