// @flow
import { Cancel, isCancel, CancelableFactory } from './cancel';
import request from './request';
import { normalizeQuery, mapify } from './utils';

import { LegacyFilterFunction, Params, Payload } from './typesLegacy';
import { FilterFunction } from './types';

/**
 * Input options
 * @deprecated
 */
export interface LegacyFilterConfig {
  url: string;
  template: string;
  filter?: LegacyFilterFunction;
  params?: Params;
}

/**
 * Legacy filter class
 * @deprecated
 */
class LegacyFilter {
  // Config
  private url: string;
  private template: string;
  private filter: FilterFunction;
  private params: Params;

  // Cancellation
  private cancelTokens: (() => void)[] = [];
  private rejectTokens: (() => void)[] = [];

  // Flags
  private pages: number | undefined;
  private offset: number = 0;

  public constructor({ url, template, filter, params }: LegacyFilterConfig) {
    // Add default vars
    this.url = url;
    this.template = template;
    this.filter = filter || (() => true);
    this.params = params || {};
  }

  /* INTERNAL */
  private async load(
    page: number
  ): Promise<{ payload: Payload; page: number }> {
    // Check if pages is known
    if ((this.pages && page > this.pages) || this.pages === 0) {
      return { payload: [], page };
    }

    // Make the requests
    const { query } = normalizeQuery(this.url, {
      view: this.template,
      ...this.params,
      page
    });

    let cancel = () => {};

    const response = request(`${this.url}?${query}`, c => {
      cancel = c;
    });

    // Add the cancel token
    this.cancelTokens.push(cancel);

    // Extract data from response
    try {
      // $flow-ignore TODO figure out
      const { payload, ...headers } = await response;

      // Set pages / loaded
      if (this.pages === undefined) {
        this.pages = headers.pages;

        // Cancel any extraneous requests
        const toCancel = this.cancelTokens.slice(this.pages);
        toCancel.forEach(c => c());

        // Remove extra cancel tokens
        this.cancelTokens = this.cancelTokens.slice(0, this.pages);
      }

      // Return result
      return { payload, page };
    } catch (e) {
      // Fail quietly on cancel
      if (isCancel(e)) {
        return { payload: [], page };
      }
      throw e;
    }
  }

  /* DECORATORS */
  private async cancelible<T>(func: () => Promise<T>): Promise<T> {
    return new Promise(async (res, rej) => {
      this.rejectTokens.push(() => rej(new Cancel()));
      try {
        const value = await func();
        res(value);
      } catch (e) {
        rej(e);
      }
    });
  }

  private cancelify<T>(func: () => T): T {
    // Cancel everything
    this.cancelTokens.forEach(cancel => cancel());
    this.cancelTokens = [];
    this.rejectTokens.forEach(rej => rej());
    this.rejectTokens = [];

    // Reset internal values
    this.pages = undefined;
    this.offset = 0;

    // Pass through
    return func();
  }

  /* GETTERS / SETTERS */
  public setUrl(url: string) {
    return this.cancelify(() => {
      this.url = url;
    });
  }

  public setFilter(filter: FilterFunction) {
    return this.cancelify(() => {
      this.filter = filter;
    });
  }

  public setParams(params: Params) {
    this.cancelify(() => {
      this.params = params;
    });
  }

  // TODO does this need cancelify?
  public clearOffset() {
    this.offset = 0;
  }

  public cancel() {
    return this.cancelify(() => undefined);
  }

  // /* API */
  public async get({
    number,
    offset = 0
  }: {
    number: number;
    offset: number;
  }): Promise<Payload | void> {
    return this.cancelible(
      () =>
        new Promise(async res => {
          // Needed length
          const length = offset + number;

          // Storage
          let filtered: any[] = [];

          // Resolved flag
          let resolved = false;

          // Function to filter and parse
          const handlePayload = ({
            payload: rawLoadPayload,
            error
          }: {
            payload?: { payload: Payload; page: number };
            error?: Error;
          }) => {
            // Handle errors
            if (error) {
              if (isCancel(error)) {
                return;
              }
              throw error;
            }

            // Handle undefined payload
            if (!rawLoadPayload) {
              throw new Error('Did not receive payload');
            }

            // Get page and payload
            const { page, payload: rawPayload } = rawLoadPayload;

            // Filter
            const filteredPayload = rawPayload.filter(p => this.filter(p));

            // Push
            filtered = filtered.concat(filteredPayload);

            // TODO figure out why this.pages is sometimes undefined here

            // Completion check
            if (
              !resolved &&
              (filtered.length >= length || (this.pages && this.pages <= page))
            ) {
              // Mark completed
              resolved = true;

              // Reset for next call
              // TODO this could be inefficient / weird if we have concurrent calls
              this.cancelTokens.forEach(c => c());
              this.cancelTokens = [];

              // Cut to length
              const payload =
                filtered.length < length
                  ? filtered.slice(offset)
                  : filtered.slice(offset, length);

              // Return the promise api
              res(payload);
            }
          };

          /* We dont know the number of pages */
          if (this.pages === undefined) {
            // Create a guess at how many pages to load
            let guess = Math.ceil((10 * number + offset) / 24);

            // Max of 24 - Should not impact perf
            if (guess > 24) {
              guess = 24;
            }

            // Create array with those indexes
            const guessedPages = Array.from(new Array(guess), (_, i) => i + 1);

            // Await mapify to finish
            await mapify(
              guessedPages.map(page => this.load(page)),
              handlePayload
            );

            // Assert this.pages is populated
            if (this.pages === undefined) {
              // Assume cancellation
              return;
            }

            // Check if we are done
            if (resolved) {
              return;
            }

            // Check if that finished it
            if (guess >= this.pages) {
              // TODO remove this, hacky but currently needed for some reason
              res(filtered);
              return;
            }

            // We no longer need to guess
            const remaining = this.pages - guess;

            // Create array with those indexes
            const pages = Array.from(
              new Array(remaining),
              (_, i) => i + guess + 1
            );

            // Await mapify to finish
            await mapify(pages.map(page => this.load(page)), handlePayload);
          } else {
            /* We already know the number of pages */

            // Create array with those indexes
            const pages = Array.from(new Array(this.pages), (_, i) => i + 1);

            // Await mapify to finish
            await mapify(pages.map(page => this.load(page)), handlePayload);
          }
        })
    );
  }

  public getNext({ number }: { number: number }): Promise<Payload | void> {
    // Calculate offset
    const { offset } = this;

    // Create new offset
    this.offset += number;

    // Return
    return this.get({ number, offset });
  }
}

/**
 * After testing, this seems to
 * be the best page size for perf
 */
const PAGE_SIZE = 24;

export interface FilterConfig<E> {
  /**
   * Path of the url (`/collections/all`)
   */
  url: string;

  /**
   * Template extension used. If template is
   * `collection.foo.liquid` provide `foo`
   */
  template: string;

  /**
   * Any additional url query parameters
   * beyond `view` and `page` which are
   * handled internally
   */
  params?: Params;

  /**
   * A filter function similar to that
   * used by Array.filter
   */
  filter?: FilterFunction<E>;
}

/**
 * Creates a filter instance that can
 * be used to load and filter items
 *
 * @template E
 * @param {FilterConfig<E>} config
 */
export function FilterFactory<E = any>(config: FilterConfig<E>) {
  const Cancelable = CancelableFactory();

  // Stores the number of pages of
  // a particular resource that are
  // contain items. Unknown when null
  let pages: number | null = null;

  // Cancel tokens corresponding to
  // pages of items
  let requestCancelTokens: { [key: number]: () => void } = {};

  function cancelOutstandingRequests(after: number) {
    Object.keys(requestCancelTokens).forEach(key => {
      const page = Number.parseInt(key, 10);

      if (page > after) {
        requestCancelTokens[page]();
      }
    });
  }

  /**
   * Internal function that will
   * reset all of the internal state
   */
  function reset() {
    pages = null;
    requestCancelTokens = {};
  }

  // Reset when cancelled
  Cancelable.onCancel(reset);

  /**
   * Internal function to handle cancellation
   * logic around xhr requests
   *
   * @private
   * @param {number} page
   */
  const load = Cancelable.cancelify(
    async (page: number): Promise<E[]> => {
      // Check if we need to make the request
      if (pages && pages < page) {
        return [];
      }

      // @todo check the cache...

      let unsub = () => {};
      const cancelToken = (c: () => void) => {
        if (requestCancelTokens[page]) {
          console.warn(
            `Overwriting cancellation token for page ${page}. This is probably a Crisp bug`
          );
        }
        requestCancelTokens[page] = c;
        unsub = Cancelable.onCancel(c);
      };

      const { query } = normalizeQuery(config.url, {
        ...(config.params || {}),
        view: config.template,
        page
      });

      try {
        const response = await request<E>(
          `${config.url}?${query}`,
          cancelToken
        );

        if (!pages) {
          pages = response.pages;
          cancelOutstandingRequests(pages);
        }

        return response.payload;
      } catch (e) {
        if (isCancel(e)) {
          return [];
        }

        throw e;
      } finally {
        unsub();
      }
    }
  );

  async function get(amount: number) {
    // Figure out how many pages to load
    const pagesToLoad = Math.ceil((amount / PAGE_SIZE) * 10);

    const promises: Promise<E[]>[] = [];
    for (let i = 1; i <= pagesToLoad; i += 1) {
      promises.push(load(i));
    }

    return new Promise<E[]>(async (res, rej) => {
      let results: E[] = [];

      try {
        await mapify<E[]>(promises, ({ payload, error }) => {
          if ((error && !isCancel(error)) || !payload) {
            throw error;
          }

          const valid = payload.filter((product: any) =>
            product.tags.includes('on-sale')
          );

          results = results.concat(valid);

          if (results.length >= amount) {
            res(results);
          }
        });
      } catch (e) {
        rej(e);
      }

      res(results.slice(0, amount));
    });
  }

  return {
    cancel: Cancelable.cancel(),
    get: Cancelable.cancelify(get)
  };
}

export default LegacyFilter;
