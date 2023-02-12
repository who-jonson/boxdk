import { hasOwnProperty } from '@whoj/utils-core';

export default (item: { [x: string]: any }, values: any[]) => {
  values = values || [];
  if (values.length === 0) {
    return;
  }
  let temp = item;
  // eslint-disable-next-line array-callback-return
  values.map((requiredValue) => {
    if (requiredValue.includes('.')) {
      const requiredValues = requiredValue.split('.');
      for (let i = 0, l = requiredValues.length; i < l; i++) {
        const prop = requiredValues[i];
        if (hasOwnProperty(temp, prop)) {
          temp = temp[prop];
        }
      }
      if (!temp) {
        throw new Error(`A(n) ${requiredValue} field is required for this API call`);
      }
    } else if (!item[requiredValue]) {
      throw new Error(`A(n) ${requiredValue} field is required for this API call`);
    }
  });
};
