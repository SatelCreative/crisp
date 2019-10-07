/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Axios from 'axios';
import request from '../request';
import { mapify } from '../utils';

import { FilterFunction, Params, Payload } from '../types';

interface FilterConfig {
  url: string;
  template: string;
  filter?: FilterFunction;
  params?: Params;
}

/*
 * TODO
 * - Scope loaded
 */
class Filter {
  // Config
  url: string;
  template: string;
  filter: FilterFunction;
  params: Params;

  // Cancellation
  cancelTokens: (() => void)[] = [];
  rejectTokens: (() => void)[] = [];

  // Flags
  pages: number | undefined;
  offset: number = 0;

  constructor({ url, template, filter, params }: FilterConfig) {
    // Add default vars
    this.url = url;
    this.template = template;
    this.filter = filter || (() => true);
    this.params = params || {};
  }

  /* INTERNAL */
  load = async (page: number): Promise<{ payload: Payload; page: number }> => {
    // Check if pages is known
    if ((this.pages && page > this.pages) || this.pages === 0) {
      return { payload: [], page };
    }

    // Make the requests
    const { response, cancel } = request({
      url: this.url,
      template: this.template,
      params: this.params,
      page
    });

    // Add the cancel token
    this.cancelTokens.push(cancel);

    // Extract data from response
    try {
      // $flow-ignore TODO figure out
      const { headers, payload } = await response;

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
      if (Axios.isCancel(e)) {
        return { payload: [], page };
      }
      throw e;
    }
  };

  /* DECORATORS */
  // Eslint does not like generics with arrow functions
  // eslint-disable-next-line func-names
  cancelible = async function<T>(func: () => Promise<T>): Promise<T> {
    return new Promise(async (res, rej) => {
      this.rejectTokens.push(() => rej(new Axios.Cancel('Canceled by Crisp')));
      try {
        const value = await func();
        res(value);
      } catch (e) {
        rej(e);
      }
    });
  };

  // Eslint does not like generics with arrow functions
  // eslint-disable-next-line func-names
  cancelify = function<T>(func: () => T): T {
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
  };

  /* GETTERS / SETTERS */
  setUrl = (url: string) =>
    this.cancelify(() => {
      this.url = url;
    });

  setFilter = (filter: FilterFunction) =>
    this.cancelify(() => {
      this.filter = filter;
    });

  setParams = (params: Params) =>
    this.cancelify(() => {
      this.params = params;
    });

  // TODO does this need cancelify?
  clearOffset = () => {
    this.offset = 0;
  };

  cancel = () => this.cancelify(() => undefined);

  /* API */
  preview = async ({ number }: { number: number }): Promise<Payload | void> =>
    this.cancelible(async () => {
      // Calculate the number of pages required &
      // create array of that length - [1, 2, ...,pages]
      const pages = Array.from(
        new Array(Math.ceil(number / 24)),
        (_, i) => i + 1
      );

      // Load payloads
      const rawPayloads = await Promise.all(pages.map(page => this.load(page)));

      // Retrieve correct value
      const payloads = rawPayloads.map(({ payload }) => payload);

      // Stitch together
      const rawPayload = [].concat(...payloads);

      // Cut to length
      const payload =
        rawPayload.length < number ? rawPayload : rawPayload.slice(0, number);

      // Return the promise api
      return payload;
    });

  get = async ({
    number,
    offset
  }: {
    number: number;
    offset: number;
  }): Promise<Payload | void> =>
    this.cancelible(
      () =>
        new Promise(async res => {
          // Needed length
          const length = offset + number;

          // Storage
          let filtered = [];

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
              if (Axios.isCancel(error)) {
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

  getNext = ({ number }: { number: number }): Promise<Payload | void> => {
    // Calculate offset
    const { offset } = this;

    // Create new offset
    this.offset += number;

    // Return
    return this.get({ number, offset });
  };

  // TODO get page
}

export default Filter;
