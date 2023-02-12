import { isObject, objectKeys } from '@whoj/utils-core';
import type { UnObj } from '../options';

// @ts-ignore
export default function MapNestedValues(values: UnObj) {
  return Array.prototype.concat.apply([], objectKeys(values).map((key) => {
    if (isObject(values[key])) {
      return MapNestedValues(values[key]);
    }
    return values[key];
  }));
}
