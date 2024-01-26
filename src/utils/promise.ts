export const noop: (...args: any[]) => void = () => {};

export const createPromise = () => {
  let resolve = noop;
  const promise = new Promise((res) => {
    resolve = res;
  });

  return {
    promise,
    resolve,
  };
};
