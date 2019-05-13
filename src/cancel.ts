/**
 * The error that is thrown to indicate cancellation
 *
 * @class CrispCancellationError
 * @extends {Error}
 */
export class CrispCancellationError extends Error {
  public name: string;

  public constructor() {
    super('Crisp Cancellation Exception');
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = CrispCancellationError.name;
  }
}

/**
 * Check if a given error is a cancellation error
 *
 * @param {Error} error
 * @returns {boolean}
 */
export function isCancel(error: Error): boolean {
  return error instanceof CrispCancellationError;
}

/**
 * Callback that provides a cancel function to the callee
 */
export interface CancelRef {
  (cancel: () => void): void;
}
