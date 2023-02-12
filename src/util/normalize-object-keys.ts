'use strict';

import type { UnObj } from '../options';

export default function NormalizeObjectKeys(options: UnObj, values: any) {
  values = values || [];

  // eslint-disable-next-line array-callback-return
  Object.keys(options).map((key) => {
    if (values.includes(key)) {
      // eslint-disable-next-line array-callback-return
      return;
    }
    if (typeof options[key] === 'object') {
      NormalizeObjectKeys(options[key], values);
    }

    const splitCamel = key.split(/(?=[A-Z])/g);

    if (splitCamel.length > 1) {
      const regroup = [];
      for (let i = 1; i < splitCamel.length; i++) {
        regroup.push(splitCamel[i].toLowerCase());
      }
      if (splitCamel.length > 0) {
        regroup.unshift(splitCamel[0]);
      }
      const newKey = regroup.join('_');

      if (values.includes(newKey)) {
        options[newKey] = options[key];
        delete options[key];
      }
    }
  });
}
