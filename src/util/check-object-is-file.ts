'use strict';

export default (file: any) => {
  return file.constructor === File;
};
