'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import VerifyRequiredValues from '../util/verify-required-values';
import CreateRequestBody from '../util/create-request-body';
import NormalizeObjectKeys from '../util/normalize-object-keys';
import type { UnObj } from '../options';
import InvestigateModes from '../util/investigate-modes';
import Manager from './manager';

const BASE_PATH = '/web_links';
const MODEL_VALUES = {
  URL: 'url',
  PARENT: 'parent',
  ID: 'parent.id',
  NAME: 'name',
  DESCRIPTION: 'description'
};

export default class WebLinks extends Manager {
  constructor(client: any) {
    super(client, MODEL_VALUES);
  }

  _getWebLinkId(options: UnObj) {
    let id = super._getId(options);

    if (options.webLink) {
      options.web_link = options.webLink;
      delete options.webLink;
    }

    if (options.web_link && options.web_link.id) {
      id = options.web_link.id;
    } else if (options.webLinkId || options.web_link_id) {
      id = options.webLinkId || options.web_link_id;
      (options.webLinkId) ? delete options.webLinkId : delete options.web_link_id;
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
  _getWebLink(options: UnObj, values: Array<any>, skipValidation: boolean, ignoreModelValues?: boolean) {
    skipValidation = skipValidation || this.client.skipValidation || false;
    ignoreModelValues = ignoreModelValues || false;

    if (options.webLink) {
      options.web_link = options.webLink;
      delete options.webLink;
    }

    if (options.web_link) {
      if (!skipValidation) {
        VerifyRequiredValues(options.webLink, values);
      }
      if (!ignoreModelValues) {
        NormalizeObjectKeys(options.webLink, this.FLATTENED_VALUES);
      }
      options.body = CreateRequestBody(options.webLink, this.ALL_VALUES!);
      delete options.web_link;
    } else {
      super._getModel(options, values, skipValidation, ignoreModelValues);
    }
  }

  get(options: UnObj | string) {
    options = super._objectifyString(options) || {};
    const webLinkId = this._getWebLinkId(options);
    const apiPath = `${BASE_PATH}/${webLinkId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  create(options: UnObj = {}) {
    if (!this.client._simpleMode) {
      const REQUIRED_VALUES = [MODEL_VALUES.URL, MODEL_VALUES.PARENT, MODEL_VALUES.ID];
      const skipValidation = InvestigateModes(options, BOX_CONSTANTS.MODES.SKIP_VALIDATION) || false;
      const ignoreModelValues = InvestigateModes(options, BOX_CONSTANTS.MODES.IGNORE_MODEL_VALUES) || false;

      if (!this.client._returnsOnlyOptions) {
        this._getWebLink(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);
      }
    }
    const apiPath = `${BASE_PATH}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  update(options: UnObj = {}) {
    const webLinkId = this._getWebLinkId(options);
    if (!this.client._simpleMode) {
      const skipValidation = InvestigateModes(options, BOX_CONSTANTS.MODES.SKIP_VALIDATION) || false;
      const ignoreModelValues = InvestigateModes(options, BOX_CONSTANTS.MODES.IGNORE_MODEL_VALUES) || false;

      this._getWebLink(options, [], skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${webLinkId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  delete(options: UnObj = {}) {
    const webLinkId = this._getWebLinkId(options);
    const apiPath = `${BASE_PATH}/${webLinkId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }
}
