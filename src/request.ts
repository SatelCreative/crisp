class CrispCancellationError extends Error {
  constructor() {
    super('Crisp Cancellation Exception');
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = CrispCancellationError.name;
  }
}

function isCancel(error: Error) {
  return error instanceof CrispCancellationError;
}

async function request(url: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(this: XMLHttpRequest) {
      try {
        const data = this.response;
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });

    xhr.addEventListener("error", function(this: XMLHttpRequest) {
      reject(new Error(`Request to "${url}" failed with status code ${this.status}`));
    });

    xhr.addEventListener("abort", function() {
      reject(new CrispCancellationError());
    });

    xhr.open('GET', url, true);
    xhr.send();
  });
}

export default request;