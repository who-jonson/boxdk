'use strict';

export default (blob: any) => {
  return ((blob.constructor === Blob && blob instanceof Blob));
};
