/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Filter from './filter';
import { callbackify } from '../utils';

import { FilterFunction, Params, Payload, Callback } from '../types';

type CollectionOrder =
  | 'default'
  | 'manual'
  | 'best-selling'
  | 'title-ascending'
  | 'title-descending'
  | 'price-ascending'
  | 'price-descending'
  | 'created-ascending'
  | 'created-descending';

interface CollectionConfig {
  handle: string;
  template: string;
  order?: CollectionOrder;
  filter?: FilterFunction;
}

/**
 * The create function handles docs
 * @name CollectionClass
 * @private
 */
export class Collection {
  filter: Filter;
  params: Params;

  constructor({ handle, template, order, filter }: CollectionConfig) {
    this.params = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      sort_by: order || 'default'
    };

    this.filter = new Filter({
      url: `/collections/${handle}`,
      template,
      filter,
      params: {
        ...this.params
      }
    });
  }

  /**
   * @example
   * collection.setHandle('all');
   */
  setHandle = (handle: string) => {
    this.filter.setUrl(`/collections/${handle}`);
  };

  /**
   * @example
   * collection.setFilter(function(product) {
   *   return product.tags.indexOf('no_show' === -1);
   * });
   */
  setFilter = (filter: FilterFunction) => {
    this.filter.setFilter(filter);
  };

  /**
   * @example
   * collection.setOrder('price-ascending');
   */
  setOrder = (order: CollectionOrder) => {
    this.params = {
      ...this.params,
      // eslint-disable-next-line @typescript-eslint/camelcase
      sort_by: order
    };

    this.filter.setParams({ ...this.params });
  };

  /**
   * Clears the internal offset stored by getNext
   * @example
   * collection.clearOffset();
   */
  clearOffset = () => {
    this.filter.clearOffset();
  };

  /**
   * Manually cancel active network requests
   * @example
   * collection.cancel();
   */
  cancel = () => {
    this.filter.cancel();
  };

  /* API */

  /**
   * Retrieve the first `options.number` products in a collection. No filter support but extremely fast
   * @param {Object} options
   * @param {number} options.number
   * @param {Callback} [options.callback = void]
   * @return {Promise<Payload | void>}
   * @example
   * collection.preview({
   *   number: 10,
   * });
   */
  preview = ({
    number,
    callback
  }: {
    number: number;
    callback?: (arg0: { payload?: Payload; error?: Error }) => void;
  }): Promise<Payload | void> =>
    // @ts-ignore
    callbackify(callback, () => this.filter.preview({ number }));

  /**
   * The most versatile option for retrieving products. Only recommended for use cases that require a large amount of customization
   * @param {Object} options
   * @param {number} options.number
   * @param {number} [options.offset = 0]
   * @param {Callback} [options.callback = void]
   * @return {Promise<Payload | void>}
   * @example
   * collection.get({
   *   number: 10,
   * });
   * @example
   * const payload = await collection.get({
   *   number: 10,
   *   offset: 10,
   * });
   */
  get = ({
    number,
    offset = 0,
    callback
  }: {
    number: number;
    offset?: number;
    callback?: (arg0: { payload?: Payload; error?: Error }) => void;
  }): Promise<Payload | void> =>
    // @ts-ignore
    callbackify(callback, () =>
      this.filter.get({
        number,
        offset
      })
    );

  /**
   * Similar to get but stores and increments the offset internally. This can be reset with calls to getNext. Recommended for infinite scroll and similar
   * @param {Object} options
   * @param {number} options.number
   * @param {Callback} options.callback
   * @return {Promise<Payload | void>}
   * @example
   * collection.getNext({
   *   number: 10,
   * });
   */
  getNext = ({
    number,
    callback
  }: {
    number: number;
    callback?: Callback;
  }): Promise<Payload | void> =>
    // @ts-ignore
    callbackify(callback, () =>
      this.filter.getNext({
        number
      })
    );
}

/**
 * Creates a collection instance
 * @name Collection
 * @param {Object} config
 * @param {string} config.handle
 * @param {string} config.template
 * @param {CollectionOrder} [config.order = void]
 * @param {FilterFunction} [config.filter = void]
 * @return {CollectionInstance}
 * @example
 * const collection = Crisp.Collection({
 *   handle: 'all',
 *   template: '__DO-NOT-SELECT__.products',
 * });
 */
const createCollection = (config: CollectionConfig) => new Collection(config);

export default createCollection;
