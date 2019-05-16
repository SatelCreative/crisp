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
