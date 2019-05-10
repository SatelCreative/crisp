class CrispCancellationError extends Error {
  public name: string;

  public constructor() {
    super('Crisp Cancellation Exception');
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = CrispCancellationError.name;
  }
}

export function isCancel(error: Error): boolean {
  return error instanceof CrispCancellationError;
}

async function request<R>(
  url: string,
  cancelRef?: (cancel: () => void) => void
): Promise<R> {
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
