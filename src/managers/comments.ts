'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/comments';
const MODEL_VALUES = {
  ITEM: 'item',
  ITEM_TYPE: 'item.type',
  ITEM_ID: 'item.id',
  TAGGED_MESSAGE: 'tagged_message',
  MESSAGE: 'message'
};

export default class Comments extends Manager {
  constructor(readonly client: any) {
    super(client, MODEL_VALUES);
  }

  _getCommentId(options: UnObj) {
    let id = super._getId(options);
    if (options.commentId || options.comment_id) {
      id = options.commentId || options.comment_id;
      (options.commentId) ? delete options.commentId : delete options.comment_id;
    } else if (options.comment && options.comment.id) {
      id = options.comment.id;
    }
    super._testForMissingId(id, BOX_CONSTANTS.COMMENT, BOX_CONSTANTS.COMMENT_ID);
    return id;
  }

  /**
   * @param {Object} options
   * @param {Array} values
   * @param {Boolean} skipValidation
   * @param {Boolean} ignoreModelValues
   */
  _getComment(options: UnObj, values: Array<any>, skipValidation: boolean, ignoreModelValues?: boolean) {
    skipValidation = skipValidation || this.client.skipValidation || false;
    ignoreModelValues = ignoreModelValues || false;
    if (options.comment) {
      if (!skipValidation) {
        super.VerifyRequiredValues(options.comment, values);
      }
      if (!ignoreModelValues) {
        super.NormalizeObjectKeys(options.comment, this.FLATTENED_VALUES);
      }
      options.body = super.CreateRequestBody(options.comment, (this.ALL_VALUES || []), ignoreModelValues);
      delete options.comment;
    } else {
      super._getModel(options, values, skipValidation, ignoreModelValues);
    }
  }

  get(options: UnObj) {
    options = super._objectifyString(options) || {};
    const commentId = this._getCommentId(options);
    const apiPath = `${BASE_PATH}/${commentId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  create(options: UnObj) {
    options = options || {};
    if (!this.client._simpleMode) {
      const REQUIRED_VALUES = [MODEL_VALUES.ITEM, MODEL_VALUES.ITEM_ID, MODEL_VALUES.ITEM_TYPE, MODEL_VALUES.MESSAGE];
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getComment(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  update(options: UnObj) {
    options = options || {};
    const commentId = this._getCommentId(options);
    if (!this.client._simpleMode) {
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getComment(options, [MODEL_VALUES.MESSAGE], skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${commentId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  delete(options: UnObj) {
    options = super._objectifyString(options) || {};
    const commentId = this._getCommentId(options);
    const apiPath = `${BASE_PATH}/${commentId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }
}
