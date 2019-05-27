/**
 * Extract resolve value from promise
 */
type ResolveType<P extends Promise<any>> = P extends Promise<infer R> ? R : any;

/**
 * The error that is thrown to indicate cancellation
 *
 * @class Cancel
 * @extends {Error}
 */
export class Cancel extends Error {
  public name: string;

  public constructor() {
    super('Crisp Cancellation Exception');
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = Cancel.name;
  }
}

/**
 * Check if a given error is a cancellation error
 *
 * @param {Error} error
 * @returns {boolean}
 */
export function isCancel(error: Error): boolean {
  return error instanceof Cancel;
}

/**
 * Callback that provides a cancel function to the callee
 */
export interface CancelRef {
  (cancel: () => void): void;
}

/**
 * @todo
 */
export function CancelableFactory() {
  const cancelCallbacks: (() => void)[] = [];
  const cancelTokens: (() => void)[] = [];

  /**
   * Event emitter that will fire when
   * cancellation has occurred. Generally
   * used to cancel events further down the
   * tree. Will be cleaned up on each cancel
   *
   * @param {() => void} cb
   */
  function onCancel(cb: () => void): () => void {
    const index = cancelCallbacks.length;
    cancelCallbacks.push(cb);

    // Return an unregister callback
    return () => {
      cancelCallbacks.splice(index, 1);
    };
  }

  /**
   * Cancel all outstanding work
   */
  function cancel() {
    while (cancelCallbacks.length) {
      try {
        (cancelCallbacks as any).pop()();
      } catch (e) {
        if (!isCancel(e)) {
          throw e;
        }
      }
    }

    while (cancelTokens.length) {
      (cancelTokens as any).pop()();
    }
  }

  /**
   * Higher order function that enables any promise
   * returning function to become cancelable. Will
   * not propagate the cancellation down to, for example,
   * an ajax request that the function has made. That
   * must be handled withing the function itself
   *
   * @template T
   * @param {T} cancelee
   * @returns
   */
  function cancelify<T extends (...args: any[]) => Promise<any>>(cancelee: T) {
    return (...args: Parameters<T>) => {
      return new Promise<ResolveType<ReturnType<T>>>(
        async (resolve, reject) => {
          // Flag to ensure we only
          // resolve / reject the
          // promise once
          let cancelled = false;

          // Register external cancallation callback
          cancelTokens.push(() => {
            if (!cancelled) {
              cancelled = true;
              reject(new Cancel());
            }
          });

          // Wrap the original function.
          // Only resolve / reject if
          // not cancelled
          try {
            const result = await cancelee(...args);
            !cancelled && resolve(result);
          } catch (e) {
            if (cancelled) {
              return;
            }

            cancelled = isCancel(e);
            reject(e);
          }
        }
      );
    };
  }

  return {
    cancel,
    onCancel,
    cancelify
  };
}
