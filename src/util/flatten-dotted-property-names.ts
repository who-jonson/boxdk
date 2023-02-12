export default (values: string[]) => {
  values = Array.prototype.concat.apply([], values.map((value) => {
    if (value.includes('.')) {
      const split = value.split('.');
      return split.filter((value) => {
        return !values.includes(value);
      });
    } else {
      return value;
    }
  }));

  return values;
};
