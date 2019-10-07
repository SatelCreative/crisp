/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Filter from './filter';
import { constructQuery } from './utils';
import { callbackify } from '../utils';

import { FilterFunction, SearchField, Params, Payload } from '../types';

/** */
type SearchType = 'article' | 'page' | 'product';

interface SearchConfig {
  query: string;
  template: string;
  filter?: FilterFunction;
  types?: SearchType[];
  exact?: boolean;
  and?: boolean;
  fields?: SearchField[];
}

/**
 * The create function handles docs
 * @name SearchClass
 * @private
 */
export class Search {
  filter: Filter;
  query: string;
  types: SearchType[] = ['article', 'page', 'product'];
  exact: boolean;
  and: boolean;
  fields: SearchField[] = [];

  constructor({
    query,
    template,
    filter,
    types,
    exact,
    and,
    fields
  }: SearchConfig) {
    // Set internal vars
    this.query = query || '';
    this.types = types || this.types;
    this.exact = exact != null ? exact : true;
    this.and = and != null ? and : true;
    this.fields = fields || this.fields;

    // Add default vars
    this.filter = new Filter({
      url: `/search`,
      template,
      filter,
      params: {
        ...this.generateParams()
      }
    });
  }

  /**
   * @private
   */
  generateQuery = (): string =>
    constructQuery({
      query: this.query,
      fields: this.fields,
      exact: this.exact,
      and: this.and
    });

  /**
   * @private
   */
  generateParams = (): Params => ({
    q: this.generateQuery(),
    // Only set types if needed. Default is any
    ...(this.types.length < 3 ? { type: this.types.join(',') } : {})
  });

  /**
   * @example
   * search.setQuery('blue shirt');
   */
  setQuery = (query: string) => {
    this.query = query;
    this.filter.setParams(this.generateParams());
  };

  /**
   * @example
   * search.setFilter(function(object) {
   *   return object.type === 'product';
   * });
   */
  setFilter = (filter: FilterFunction) => {
    this.filter.setFilter(filter);
  };

  /**
   * @example
   * search.setTypes(['product']);
   */
  setTypes = (types: SearchType[]) => {
    this.types = types;
    this.filter.setParams(this.generateParams());
  };

  /**
   * @example
   * search.setExact(false);
   */
  setExact = (exact: boolean) => {
    this.exact = exact;
    this.filter.setParams(this.generateParams());
  };

  /**
   * @example
   * search.setAnd(false);
   */
  setAnd = (and: boolean) => {
    this.and = and;
    this.filter.setParams(this.generateParams());
  };

  /**
   * @example
   * search.setTypes(['title', 'author']);
   */
  setFields = (fields: SearchField[]) => {
    this.fields = fields;
    this.filter.setParams(this.generateParams());
  };

  /**
   * Clears the internal offset stored by getNext
   * @example
   * search.clearOffset();
   */
  clearOffset = () => {
    this.filter.clearOffset();
  };

  /**
   * Manually cancel active network requests
   * @example
   * search.cancel();
   */
  cancel = () => {
    this.filter.cancel();
  };

  /**
   * @param {Object} options
   * @param {number} options.number
   * @param {Callback} [options.callback = void]
   * @return {Promise<Payload | void>}
   * @example
   * search.preview({
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
   * @param {Object} options
   * @param {number} options.number
   * @param {number} [options.offset = 0]
   * @param {Callback} [options.callback = void]
   * @return {Promise<Payload | void>}
   * @example
   * search.get({
   *   number: 10,
   * });
   * @example
   * const payload = await search.get({
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
   *
   * @param {Object} options
   * @param {number} options.number
   * @param {Callback} options.callback
   * @return {Promise<Payload | void>}
   * @example
   * search.getNext({
   *   number: 10,
   * });
   */
  getNext = ({
    number,
    callback
  }: {
    number: number;
    callback?: (arg0: { payload?: Payload; error?: Error }) => void;
  }): Promise<Payload | void> =>
    // @ts-ignore
    callbackify(callback, () =>
      this.filter.getNext({
        number
      })
    );
}

/**
 * Creates a search instance
 * @name Search
 * @param {Object} config
 * @param {string} config.query
 * @param {string} config.template
 * @param {FilterFunction} [config.filter = void]
 * @param {Array<SearchType>} [config.types = ["article", "page", "product"]]
 * @param {boolean} [config.exact = true]
 * @param {boolean} [config.and = true]
 * @param {Array<SearchField>} [config.fields = []]
 * @return {SearchInstance}
 * @example
 * const collection = Crisp.Search({
 *   query: 'blue shirt',
 *   template: '__DO-NOT-SELECT__',
 * });
 */
const createSearch = (config: SearchConfig) => new Search(config);

export default createSearch;
