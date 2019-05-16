export { default as normalizeQuery } from './normalizeQuery';

interface MapifyResponse<T> {
  payload?: T;
  error?: Error;
}

interface MapifyCallback<T> {
  (props: MapifyResponse<T>): void;
}

/**
 * Maps promises, waiting for each to
 * resolve first. Can be vastly improved
 *
 * @deprecated
 * @export
 * @template T
 * @param {Promise<T>[]} promises
 * @param {MapifyCallback<T>} callback
 * @returns {Promise<MapifyResponse<T>[]>}
 */
export async function mapify<T>(
  promises: Promise<T>[],
  callback: MapifyCallback<T>
): Promise<MapifyResponse<T>[]> {
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
}
