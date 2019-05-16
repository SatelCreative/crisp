import { isCancel, Cancel } from './cancel';

describe('isCancel()', () => {
  it('correctly identifies cancellation errors', () => {
    const error = new Cancel();
    expect(isCancel(error)).toEqual(true);
  });

  it('correctly identifies non-cancellation errors', () => {
    const error = new Error();
    expect(isCancel(error)).toEqual(false);
  });

  it('correctly handles non-error arguments', () => {
    const error = (undefined as unknown) as Error;
    expect(isCancel(error)).toEqual(false);
  });
});
