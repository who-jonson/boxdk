'use strict';

import type { ElementOf } from '@whoj/utils-types';
import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import MapValues from './map-values';

const MODE_VALUES = MapValues(BOX_CONSTANTS.MODES);

export default (options: UnObj, mode: ElementOf<typeof MODE_VALUES>) => {
  let runMode;
  if (MODE_VALUES.includes(mode)) {
    runMode = options[mode];
    delete options[mode];
  }
  return runMode;
};
