/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Collection } from './collection';
import { Search } from './search';
import { callbackify } from '../utils';

import { CollectionOrder, SearchField, Payload } from '../types';

interface Product {
  collections: string[];
}

// Different here because we need collections
type FilterFunction = (arg0: Product) => boolean;

interface SearchableCollectionConfig {
  // Collection
  handle: string;
  collectionTemplate: string;
  order?: CollectionOrder;

  // Search
  searchTemplate: string;
  query?: string;
  exact?: boolean;
  and?: boolean;
  fields?: SearchField[];

  // Both
  filter?: FilterFunction;
}

/**
 * The create function handles docs
 * @name SearchableCollectionClass
 * @private
 */
class SearchableCollection {
  // Objects
  collection: Collection;
  search: Search;

  // Flags
  collectionMode: boolean = true;

  // Collection
  handle: string;
  collectionTemplate: string;
  collectionFilter: FilterFunction;

  // Search
  searchTemplate: string;
  searchFilter: FilterFunction;

  // Constructor
  constructor({
    handle,
    collectionTemplate,
    order,
    query,
    searchTemplate,
    exact,
    and,
    fields,
    filter
  }: SearchableCollectionConfig) {
    // Set expected vars
    this.handle = handle;
    this.collectionTemplate = collectionTemplate;
    this.searchTemplate = searchTemplate;

    // Set the mode
    this.collectionMode = !query;

    // Create the filters
    const f = filter || (() => true);
    this.collectionFilter = f;
    // Product is in collection and passes filter
    this.searchFilter = product =>
      product.collections.includes(handle) && f(product);

    // Create accessors
    this.collection = new Collection({
      handle: this.handle,
      template: this.collectionTemplate,
      order: order || 'default',
      filter: this.collectionFilter
    });
    this.search = new Search({
      query: query || '',
      template: this.searchTemplate,
      types: ['product'],
      exact: exact != null ? exact : true,
      and: and != null ? and : true,
      fields: fields || [],
      filter: this.searchFilter
    });
  }

  /**
   * @example
   * collection.setHandle('all');
   */
  setHandle = (handle: string) => {
    // Update search filter
    this.search.setFilter(
      product =>
        product.collections.includes(handle) && this.collectionFilter(product)
    );
    // Set the handle
    this.collection.setHandle(handle);
  };

  /**
   * @example
   * collection.setQuery('blue shirt');
   */
  setQuery = (query: string) => {
    // Cancel collection actions
    this.collection.cancel();

    // Set internal flag to search
    this.collectionMode = !query;

    // Pass along the query
    this.search.setQuery(query);
  };

  /**
   * @example
   * collection.setFilter(function(product) {
   *   return product.tags.indexOf('no_show' === -1);
   * });
   */
  setFilter = (filter: FilterFunction) => {
    // Set collection filter
    this.collectionFilter = filter;
    this.collection.setFilter(filter);
    // Create and update search filter
    this.search.setFilter(
      product => product.collections.includes(this.handle) && filter(product)
    );
  };

  /**
   * *Order only works while* `query === ''`
   * @example
   * collection.setOrder('price-ascending');
   */
  setOrder = (order: CollectionOrder) => {
    this.search.cancel();
    this.collection.setOrder(order);
  };

  /**
   * @example
   * collection.setExact(false);
   */
  setExact = (exact: boolean) => {
    this.collection.cancel();
    this.search.setExact(exact);
  };

  /**
   * @example
   * collection.setAnd(false);
   */
  setAnd = (and: boolean) => {
    this.collection.cancel();
    this.search.setAnd(and);
  };

  /**
   * @example
   * collection.setTypes(['title', 'author']);
   */
  setFields = (fields: SearchField[]) => {
    this.collection.cancel();
    this.search.setFields(fields);
  };

  /**
   * Clears the internal offset stored by getNext
   * @example
   * collection.clearOffset();
   */
  clearOffset = () => {
    this.collection.clearOffset();
    this.search.clearOffset();
  };

  /**
   * Manually cancel active network requests
   * @example
   * collection.cancel();
   */
  cancel = () => {
    this.collection.cancel();
    this.search.cancel();
  };

  /**
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
    callbackify(callback, () => {
      if (this.collectionMode) {
        // Cancel any searches
        this.search.cancel();

        // Load
        return this.collection.get({
          number,
          offset
        });
      }
      // Cancel any collection actions
      this.collection.cancel();

      // Load
      return this.search.get({
        number,
        offset
      });
    });

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
    offset?: number;
    callback?: (arg0: { payload?: Payload; error?: Error }) => void;
  }): Promise<Payload | void> =>
    // @ts-ignore
    callbackify(callback, () => {
      if (this.collectionMode) {
        // Cancel any searches
        this.search.cancel();

        // Load
        return this.collection.getNext({
          number
        });
      }
      // Cancel any collection actions
      this.collection.cancel();

      // Load
      return this.search.getNext({
        number
      });
    });
}

/**
 * Creates a collection instance
 * @name SearchableCollection
 * @param {Object} config
 * @param {string} config.handle
 * @param {string} config.collectionTemplate
 * @param {string} config.searchTemplate
 * @param {FilterFunction} [config.filter = void]
 * @param {CollectionOrder} [config.order = void] *Order only works while* `query === ''`
 * @param {boolean} [config.exact = true]
 * @param {boolean} [config.and = true]
 * @param {Array<SearchField>} [config.fields = []]
 * @return {SearchableCollectionInstance}
 * @example
 * const collection = Crisp.SearchableCollection({
 *   handle: 'all',
 *   collectionTemplate: '__DO-NOT-SELECT__.products',
 *   searchTemplate: '__DO-NOT-SELECT__',
 * });
 */
const createSearchableCollection = (config: SearchableCollectionConfig) =>
  new SearchableCollection(config);

export default createSearchableCollection;
