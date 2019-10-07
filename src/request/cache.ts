import md5 from 'md5';

import { Request, Response } from '../types';

// Cache
let cache = {};

// Takes the params and hashes them
export const hash = (params: Request): string => {
  const json = JSON.stringify(params);
  return `${params.url}-${String(params.page || 1).padStart(3, '0')}-${md5(
    json
  )}`;
};

export const set = async (key: string, response: Response) => {
  cache[key] = response;
};

export const get = async (key: string): Promise<Response | void> => cache[key];

export const clear = async () => {
  cache = {};
};
