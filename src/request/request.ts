import Axios, { CancelToken } from 'axios';

import { get, set, hash } from './cache';

import { Request, Response } from '../types';

type Props = Request & {
  cancelToken?: CancelToken;
};

const request = async ({
  url,
  template,
  page = 1,
  params = {},
  cancelToken = new Axios.CancelToken(() => {})
}: Props): Promise<Response> => {
  // Create cache key
  const key = hash({
    url,
    template,
    page,
    params
  });

  // Check cache
  const cacheHit = await get(key);

  // Return from cahce
  if (cacheHit) {
    return cacheHit;
  }

  let headers;
  let payload;

  try {
    // Create req
    const { data } = await Axios.get(url, {
      params: {
        ...params,
        view: template,
        page
      },
      transformResponse: [
        res => {
          try {
            return JSON.parse(res);
          } catch (e) {
            throw new Error('JSON parsing failed');
          }
        }
      ],
      cancelToken
    });

    headers = {
      size: data.size,
      total: data.total,
      page: data.page,
      pages: data.pages
    };

    ({ payload } = data);
  } catch (e) {
    // Canceled - not error
    if (Axios.isCancel(e)) {
      throw new Axios.Cancel('Uncaught cancellation error');
    }
    // Format network errors etc.
    throw new Error(
      `Failed to fetch '${url}?view=${template}': ${e.message || e}`
    );
  }

  const response = {
    headers,
    payload
  };

  // Cache response & ignore any errors
  if (page <= headers.pages) {
    set(key, response).catch(() => undefined);
  }

  return response;
};

export default request;
