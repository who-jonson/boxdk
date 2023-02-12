import { objectKeys } from '@whoj/utils-core';

export default <T extends object>(values: T) => {
  return objectKeys(values).map((key) => {
    return values[key];
  });
};
