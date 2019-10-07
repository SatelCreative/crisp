// Eslint does not like generics with arrow functions
// eslint-disable-next-line func-names, import/prefer-default-export
export const callbackify = async function<T>(
  callback?: (arg: { error: Error | void; payload: T | void }) => void,
  func?: () => Promise<T>
): Promise<T | void> {
  return new Promise(async (res, rej) => {
    try {
      // Get value
      const value = await func();

      // Handle callback
      if (callback) {
        callback({
          payload: value,
          error: undefined
        });
        res(undefined);
        return;
      }
      // Handle promise
      res(value);
    } catch (e) {
      // Handle callback
      if (callback) {
        callback({
          payload: undefined,
          error: e
        });
        res(undefined);
        return;
      }
      // Handle promise
      rej(e);
    }
  });
};

// Eslint does not like generics with arrow functions
// eslint-disable-next-line func-names
export const mapify = async function<T>(
  promises: Promise<T>[],
  callback: (arg0: { payload?: T; error?: Error }) => void
): Promise<{ payload?: T; error?: Error }[]> {
  if (!promises || promises.length === 0) {
    return [];
  }

  let result;

  // Call with error or payload
  try {
    const payload = await promises[0];
    result = { payload };
  } catch (error) {
    result = { error };
  }

  // Return res
  callback(result);

  // Get rest
  const rec = await mapify(promises.slice(1), callback);

  // Recursive
  return [result, ...rec];
};
