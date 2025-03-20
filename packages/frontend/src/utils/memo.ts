export function shallowEqual<
  T extends Record<string, unknown> = Record<string, unknown>,
>(objA?: T, objB?: T) {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (
      objA[key] !== objB[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}

export function areEqual<
  T extends Record<string, unknown> = Record<string, unknown>,
>(prevProps: T, nextProps: T): boolean {
  const { values, ...otherProps } = prevProps;
  const { values: nextValues, ...nextOtherProps } = nextProps;
  return (
    shallowEqual(nextValues as T, values as T) &&
    shallowEqual(otherProps as T, nextOtherProps)
  );
}
