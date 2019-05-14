import { CancelRef, CrispCancellationError } from './cancel';
import { TemplatePayload } from './types';

export interface Request<E> {
  (url: string, cancelRef?: CancelRef): Promise<TemplatePayload<E>>;
}

/**
 * Makes a cancelable XMLHttpRequest to a given url
 * and then attempts to parse the response as JSON
 *
 * @template E Entity that is expected to be returned
 * @param {string} url url to fetch the data from
 * @param {CancelRef} [cancelRef] callback to receive a cancel
 * @returns {Promise<TemplatePayload<E>>}
 */
async function request<E>(
  url: string,
  cancelRef?: CancelRef
): Promise<TemplatePayload<E>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (cancelRef) {
      cancelRef(() => {
        xhr.abort();
      });
    }

    xhr.addEventListener('load', function(this: XMLHttpRequest) {
      try {
        const data = this.response;
        const parsed: TemplatePayload<E> = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });

    xhr.addEventListener('error', function(this: XMLHttpRequest) {
      reject(
        new Error(`Request to "${url}" failed with status code ${this.status}`)
      );
    });

    xhr.addEventListener('abort', function() {
      reject(new CrispCancellationError());
    });

    xhr.open('GET', url, true);
    xhr.send();
  });
}

export default request;
