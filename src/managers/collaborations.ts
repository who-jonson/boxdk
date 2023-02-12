'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/collaborations';
const MODEL_VALUES = {
  NOTIFY: 'notify',
  ITEM: 'item',
  ITEM_TYPE: 'item.type',
  ITEM_ID: 'item.id',
  ACCESSIBLE_BY: 'accessible_by',
  ACCESSIBLE_BY_ID: 'accessible_by.id',
  ACCESSIBLE_BY_TYPE: 'accessible_by.type',
  ACCESSIBLE_BY_LOGIN: 'accessible_by.login',
  ROLE: 'role'
};

/**
 * @class Collaborations
 */
export default class Collaborations extends Manager {
  constructor(readonly client: any) {
    super(client, MODEL_VALUES);
  }

  _getCollaborationId(options: UnObj) {
    let id = super._getId(options);
    if (options.collaborationId || options.collaboration_id) {
      id = options.collaborationId || options.collaboration_id;
      (options.collaborationId) ? delete options.collaborationId : delete options.collaboration_id;
    } else if (options.collaboration && options.collaboration.id) {
      id = options.collaboration.id;
    }
    super._testForMissingId(id);
    return id;
  }

  /**
   * @param {Object} options
   * @param {Array} values
   * @param {Boolean} skipValidation
   * @param {Boolean} ignoreModelValues
   */
  _getCollaboration(options: UnObj, values: Array<any>, skipValidation: boolean, ignoreModelValues: boolean) {
    skipValidation = skipValidation || this.client.skipValidation || false;
    ignoreModelValues = ignoreModelValues || false;
    if (options.collaboration) {
      if (!skipValidation) {
        super.VerifyRequiredValues(options.collaboration, values);
      }
      if (!ignoreModelValues) {
        super.NormalizeObjectKeys(options.collaboration, this.FLATTENED_VALUES);
      }
      options.body = super.CreateRequestBody(options.comment, (this.ALL_VALUES || []), ignoreModelValues);
      delete options.collaboration;
    } else {
      super._getModel(options, values, skipValidation, ignoreModelValues);
    }
  }

  /**
   * @param {Object} options
   */
  get(options: UnObj) {
    options = super._objectifyString(options) || {};
    const collaborationId = this._getCollaborationId(options);
    const apiPath = `${BASE_PATH}/${collaborationId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  /**
   * @param {Object} options
   */
  create(options: UnObj) {
    options = options || {};
    if (!this.client._simpleMode) {
      const REQUIRED_VALUES = [MODEL_VALUES.ITEM, MODEL_VALUES.ITEM_ID, MODEL_VALUES.ITEM_TYPE, MODEL_VALUES.ACCESSIBLE_BY, MODEL_VALUES.ROLE];
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getCollaboration(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  /**
   * @param {Object} options
   */
  update(options: UnObj) {
    options = options || {};
    const collaborationId = this._getCollaborationId(options);
    if (!this.client._simpleMode) {
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getCollaboration(options, [], skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${collaborationId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  /**
   * @param {Object} options
   */
  delete(options: UnObj) {
    options = options || {};
    const collaborationId = this._getCollaborationId(options);
    const apiPath = `${BASE_PATH}/${collaborationId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }
}
