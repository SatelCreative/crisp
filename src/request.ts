import { CancelRef, CrispCancellationError } from './cancel';

/**
 * Makes a cancelable XMLHttpRequest to a given url
 * and then attempts to parse the response as JSON
 *
 * @template R data response that is expected
 * @param {string} url url to fetch the data from
 * @param {CancelRef} [cancelRef] callback to receive a cancel
 * @returns {Promise<R>}
 */
async function request<R>(url: string, cancelRef?: CancelRef): Promise<R> {
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
        const parsed: R = JSON.parse(data);
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
