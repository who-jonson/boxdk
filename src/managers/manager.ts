'use strict';

import { isObject } from '@whoj/utils-core';
import type { Numberish } from '@whoj/utils-types';

import type { FormattedIdType, IdType } from '../config/box-constants';
import BOX_CONSTANTS from '../config/box-constants';
import InvestigateModes from '../util/investigate-modes';
import MapValues from '../util/map-values';
import FlattenDotProps from '../util/flatten-dotted-property-names';
import NormalizeObjectKeys from '../util/normalize-object-keys';
import VerifyRequiredValues from '../util/verify-required-values';
import CreateRequestBody from '../util/create-request-body';
import type { UnObj } from '../options';

declare enum MODEL_VALUES {
  SHARED_LINK = 'shared_link',
  SHARED_LINK_ACCESS = 'shared_link.access',
  UNSHARED_AT = 'shared_link.unshared_at',
  PERMISSIONS = 'shared_link.permissions',
  CAN_DOWNLOAD = 'shared_link.permissions.can_download',
  CAN_PREVIEW = 'shared_link.permissions.can_preview'
}

export default class Manager {
  ALL_VALUES;
  FLATTENED_VALUES;
  CreateRequestBody = CreateRequestBody;
  VerifyRequiredValues = VerifyRequiredValues;
  NormalizeObjectKeys = NormalizeObjectKeys;

  /**
   * @constructor
   *
   * @param {Object} client
   * @param {Object} values
   */
  constructor(readonly client: any, values?: UnObj) {
    this.ALL_VALUES = (values) ? MapValues(values) : null;
    this.FLATTENED_VALUES = (this.ALL_VALUES) ? FlattenDotProps(this.ALL_VALUES) : null;
  }

  /**
   * @param {Object} options
   * @param {Array} values
   * @param {Boolean} skipValidation
   * @param {Boolean} ignoreModelValues
   */
  _getModel(options: UnObj, values: Array<any>, skipValidation: boolean, ignoreModelValues: boolean) {
    if (options.body) {
      if (!skipValidation) {
        VerifyRequiredValues(options.body, values);
      }
      if (!ignoreModelValues) {
        NormalizeObjectKeys(options.body, this.FLATTENED_VALUES);
      }
    } else if (options) {
      if (!skipValidation) {
        VerifyRequiredValues(options, values);
      }
      if (!ignoreModelValues) {
        NormalizeObjectKeys(options, this.FLATTENED_VALUES);
      }
      options.body = CreateRequestBody(options, this.ALL_VALUES!, ignoreModelValues);
    } else {
      values = values || this.ALL_VALUES;
      const requiredValuesString = values.join(', ');
      throw new Error(`Please select from the following fields when making this API call: ${requiredValuesString}`);
    }
  }

  _objectifyString(options: UnObj<{ id?: string }> | string) {
    if (typeof options === 'string') {
      const id = options;
      options = { id };
    }
    return options;
  }

  _getId(options: UnObj<{ id?: string }> | string) {
    let id = '';
    if (isObject(options) && options.id) {
      id = options.id;
      delete options.id;
    } else if (typeof options === 'string') {
      id = options;
      options = {};
    }
    return id;
  }

  /**
   * Get Folder Id
   * @param {Object} options
   */
  _getFolderId(options: UnObj) {
    let folderId = this._getId(options);
    if (options.folderId || options.folder_id) {
      folderId = options.folderId || options.folder_id;
      (options.folderId) ? delete options.folderId : delete options.folder_id;
    } else if (options.folder && options.folder.id) {
      folderId = options.folder.id;
    }
    this._testForMissingId(folderId, BOX_CONSTANTS.FOLDER, BOX_CONSTANTS.FOLDER_ID);
    return folderId;
  }

  /**
   * @param {Object} options
   */
  _getFileId(options: UnObj) {
    let fileId = this._getId(options);
    if (options.fileId || options.file_id) {
      fileId = options.fileId || options.file_id;
      (options.fileId) ? delete options.fileId : delete options.file_id;
    } else if (options.file && options.file.id) {
      fileId = options.file.id;
    }
    this._testForMissingId(fileId, BOX_CONSTANTS.FILE, BOX_CONSTANTS.FILE_ID);
    return fileId;
  }

  /**
   * @param {Object} options
   */
  _getScope(options: UnObj) {
    let scope = 'enterprise';
    if (options.scope && options.scope !== '') {
      scope = options.scope;
      delete options.scope;
    }
    return scope;
  }

  /**
   * @param {Object} options
   */
  _getTemplateKey(options: UnObj) {
    let templateKey = '';
    if (options.template && options.template !== '') {
      templateKey = (options.template.key !== '') ? options.template.key : options.template;
      delete options.template;
    } else if (options.templateKey || options.template_key) {
      templateKey = options.templateKey || options.template_key;
      (options.templateKey) ? delete options.templateKey : delete options.template_key;
    }
    return templateKey;
  }

  _testForMissingId(id: Numberish, idType?: IdType, correctlyFormattedIdProp?: FormattedIdType) {
    idType = idType || 'unknown';
    correctlyFormattedIdProp = correctlyFormattedIdProp || 'unknown';
    if (id === '') {
      throw new Error(`A(n) ${idType} field is required for this API call. Please provide an object with a key formatted in this style: ${correctlyFormattedIdProp}`);
    }
  }

  /**
   * @param {Object} options
   */
  _setSkipValidation(options: UnObj) {
    return InvestigateModes(options, BOX_CONSTANTS.MODES.SKIP_VALIDATION) || false;
  }

  /**
   * @param {Object} options
   */
  _setIgnoreModelValues(options: UnObj) {
    return InvestigateModes(options, BOX_CONSTANTS.MODES.IGNORE_MODEL_VALUES) || false;
  }

  /**
   *
   * @param {Object} options
   * @param {Numberish} id
   * @param {String} BASE_PATH
   * @param FLATTENED_VALUES
   */
  _createSharedLink(options: UnObj, id: Numberish, BASE_PATH: string, FLATTENED_VALUES: any) {
    options = options || {};
    options.body = options.body || {};
    options.body.shared_link = options.body.shared_link || {};

    if (!this.client._simpleMode) {
      const skipValidation = this._setSkipValidation(options);
      const ignoreModelValues = this._setIgnoreModelValues(options);

      if (!ignoreModelValues) {
        NormalizeObjectKeys(options, FLATTENED_VALUES);
      }
      if (!skipValidation) {
        if (options[MODEL_VALUES.SHARED_LINK]) {
          options.body[MODEL_VALUES.SHARED_LINK] = options[MODEL_VALUES.SHARED_LINK];
          delete options[MODEL_VALUES.SHARED_LINK];
        }
      }
    }
    const apiPath = `${BASE_PATH}/${id}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }
}
