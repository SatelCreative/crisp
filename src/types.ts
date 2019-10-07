/* eslint-disable @typescript-eslint/no-explicit-any */
type URL = string;
type Template = string;
type Page = number;

export interface Params {
  sort_by?: string;
  types?: string;
  q?: string;
}

/**
 * Accepts an api object and returns whether to keep or remove it from the response
 */
export type FilterFunction = (arg0: any) => boolean;

export interface Request {
  url: URL;
  template: Template;
  page?: Page;
  params?: Params;
}

export interface Headers {
  size: number;
  total: number;
  page: number;
  pages: number;
}

/**
 * An array of the requested api object. Generally based on a template
 */
export type Payload = any[];

/**
 * A callback function that either contains the requested payload or an error. Remember to check if the error is due to cancellation via {@link isCancel}
 * @param {object} args
 * @param {Payload} [args.payload = undefined]
 * @param {Error} [args.error = undefined]
 * @return {undefined}
 * @example
 * collection.get({
 *  number: 48,
 *  callback: function callback(response) {
 *    var payload = response.payload;
 *    var error = response.error;
 *
 *    if (Crisp.isCancel(error)) {
 *      // Can usually ignore
 *      return;
 *    }
 *
 *    if (error) {
 *      // Handle error
 *      return;
 *    }
 *
 *    // Use payload
 *  }
 *});
 */
export type Callback = (arg0: { payload?: Payload; error?: Error }) => void;

export interface Response {
  headers: Headers;
  payload: Payload;
}

export type Cancel = () => void;

/**
 * Defines in what order products are returned
 * @see {@link https://help.shopify.com/themes/liquid/objects/collection#collection-default_sort_by|shopify sort order}
 */
export type CollectionOrder =
  | 'default'
  | 'manual'
  | 'best-selling'
  | 'title-ascending'
  | 'title-descending'
  | 'price-ascending'
  | 'price-descending'
  | 'created-ascending'
  | 'created-descending';

/** */
export type SearchField =
  | 'title'
  | 'handle'
  | 'body'
  | 'vendor'
  | 'product_type'
  | 'tag'
  | 'variant'
  | 'sku'
  | 'author';
