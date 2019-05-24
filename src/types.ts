/**
 * An object of query parameters
 * @interface Params
 */
export interface Params {
  [key: string]: string | number | undefined;
}

/**
 * The generic shape that template data is expected
 * to take
 *
 * @export
 * @interface TemplatePayload
 * @template E
 */
export interface TemplatePayload<E = any> {
  /**
   * Total number of items this specific
   * query contains. Will be broken into
   * multiple pages of 24 items each
   */
  total: number;

  /**
   * The number of pages of items this
   * specific query contains
   */
  pages: number;

  /**
   * The current page that this payload
   * is referring to
   */
  page: number;

  /**
   * The number of items per page. This
   * should currently always be 24
   */
  size: number;

  /**
   * Array of the items loaded for the
   * current page
   */
  payload: E[];
}

/**
 * Basic filter function. Works essentially
 * the same way that `Array.filter` works
 */
export type FilterFunction<E = any> = (item: E) => boolean;
