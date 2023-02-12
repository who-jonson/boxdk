import type { UnObj } from '../options';

export default (options: UnObj, values: Array<any>, ignoreModelValues = false) => {
  values = values || [];

  if (ignoreModelValues) {
    // eslint-disable-next-line array-callback-return
    Object.keys(options).map((key) => {
      if (key !== 'body') {
        options.body[key] = options[key];
        delete options[key];
      }
    });
    return options.body;
  }

  if (values.length === 0 && !ignoreModelValues) {
    return {};
  }

  options.body = options.body || {};
  Object.keys(options).every((key) => {
    if (values.includes(key)) {
      if (key !== 'body') {
        options.body[key] = options[key];
        delete options[key];
        return true;
      }
    }
    return true;
  });
  return options.body;
};
