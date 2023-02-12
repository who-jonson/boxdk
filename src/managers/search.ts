'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/search';
const MODEL_VALUES = {};

export default class Search extends Manager {
  constructor(client: any) {
    super(client, MODEL_VALUES);
  }

  _objectifyStringWithQuery(options: UnObj | string) {
    if (typeof options === 'string') {
      const query = options;
      options = { query };
    }
    return options;
  }

  _getQuery(options: UnObj) {
    const queryFormat = 'query';
    let query = '';
    if (options.query || options.params.query) {
      options.params = options.params || {};
      query = options.query || options.params.query;
      if (options.query) {
        delete options.query;
      }
      options.params.query = query;
    } else {
      throw new Error(`An ${queryFormat} field is required for this API call. Please provide an object with a key formatted in this style: ${queryFormat}`);
    }
    return options;
  }

  search(options: UnObj) {
    options = this._objectifyStringWithQuery(options) || {};
    options = this._getQuery(options);
    const apiPath = `${BASE_PATH}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }
}
