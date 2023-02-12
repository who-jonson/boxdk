'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/collections';
const MODEL_VALUES = {};

export default class Collections extends Manager {
  constructor(readonly client: any) {
    super(client, MODEL_VALUES);
  }

  _getCollectionId(options: UnObj) {
    let id = super._getId(options);
    if (options.collectionId || options.collection_id) {
      id = options.collectionId || options.collection_id;
      (options.collectionId) ? delete options.collectionId : delete options.collection_id;
    } else if (options.collection && options.collection.id) {
      id = options.collection.id;
    }
    super._testForMissingId(id);
    return id;
  }

  get(options: UnObj) {
    options = super._objectifyString(options) || {};
    const collectionId = this._getCollectionId(options);
    const apiPath = `${BASE_PATH}/${collectionId}/items`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getAll(options: UnObj) {
    options = options || {};
    const apiPath = `${BASE_PATH}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }
}
