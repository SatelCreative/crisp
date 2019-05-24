import { isCancel, Cancel, CancelableFactory } from './cancel';

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

describe('CancelableFactory()', () => {
  it('returns a function', () => {
    expect(typeof CancelableFactory).toEqual('function');
    expect(typeof CancelableFactory()).toEqual('object');
  });
});

const timeout = (time = 200) =>
  new Promise<void>(resolve => setTimeout(resolve, time));

describe('CancelableFactory().cancelify()', () => {
  it('correctly passes through the return value', async () => {
    const C = CancelableFactory();

    const V = Symbol('unique');
    const uniqueReturn = async () => V;

    const cancelableUniqueReturn = C.cancelify(uniqueReturn);

    const value = await cancelableUniqueReturn();

    expect(value).toEqual(V);
  });

  it('correctly cancels async function', async () => {
    const C = CancelableFactory();

    const cancelableTimeout = C.cancelify(timeout);

    setTimeout(C.cancel, 10);

    try {
      await cancelableTimeout();
      expect(true).toEqual(false);
    } catch (e) {
      expect(isCancel(e)).toEqual(true);
    }
  });

  // @todo clean this up
  it('works as expected with CancelableFactory().onCancel()', async () => {
    // Manual timeout to ensure the
    // timeout 10000 doesn't kill CI
    setTimeout(() => {
      throw new Error('This test failed');
    }, 200);

    const C = CancelableFactory();

    let internallyCancelled = false;
    let finallyUnsubbed = false;

    const t = async (time = 20) => {
      const unsubscribe = C.onCancel(() => {
        if (internallyCancelled) {
          throw new Error('Event called twice!');
        }

        internallyCancelled = true;
        unsubscribe();
        throw new Cancel();
      });

      try {
        await timeout(time);
      } catch (e) {
      } finally {
        if (finallyUnsubbed) {
          throw new Error('finally unsub called twice!');
        }

        finallyUnsubbed = true;
        unsubscribe();
      }
    };

    const cancelableTimeout = C.cancelify(t);

    setTimeout(C.cancel, 10);

    try {
      await cancelableTimeout(10000);
      expect(true).toEqual(false);
    } catch (e) {
      expect(isCancel(e)).toEqual(true);
    }

    expect(internallyCancelled && !finallyUnsubbed).toEqual(true);

    // Make sure we are not leaking
    C.cancel();

    await cancelableTimeout(1);

    expect(finallyUnsubbed).toEqual(true);

    // Make sure we are not leaking
    C.cancel();
  });
});
