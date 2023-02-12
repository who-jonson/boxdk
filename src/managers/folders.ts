'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import VerifyRequiredValues from '../util/verify-required-values';
import CreateRequestBody from '../util/create-request-body';
import NormalizeObjectKeys from '../util/normalize-object-keys';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/folders';
const MODEL_VALUES = {
  NAME: 'name',
  PARENT: 'parent',
  ID: 'parent.id',
  DESCRIPTION: 'description',
  SHARED_LINK: 'shared_link',
  SHARED_LINK_ACCESS: 'shared_link.access',
  UNSHARED_AT: 'shared_link.unshared_at',
  PASSWORD: 'shared_link.password',
  PERMISSIONS: 'shared_link.permissions',
  CAN_DOWNLOAD: 'shared_link.permissions.can_download',
  CAN_PREVIEW: 'shared_link.permissions.can_preview',
  FOLDER_UPLOAD_EMAIL: 'folder_upload_email',
  FOLDER_UPLOAD_EMAIL_ACCESS: 'folder_upload_email.access',
  OWNED_BY: 'owned_by',
  OWNED_BY_ID: 'owned_by.id',
  SYNC_STATE: 'sync_state',
  TAGS: 'tags'
};

export default class Folders extends Manager {
  constructor(readonly client: any) {
    super(client, MODEL_VALUES);
  }

  /**
   * @param {Object} options
   * @param {Array} values
   * @param {Boolean} skipValidation
   * @param {Boolean} ignoreModelValues
   */
  _getFolder(options: UnObj, values: Array<any>, skipValidation: boolean, ignoreModelValues?: boolean) {
    skipValidation = skipValidation || this.client.skipValidation || false;
    ignoreModelValues = ignoreModelValues || false;

    if (options.folder) {
      if (!skipValidation) {
        VerifyRequiredValues(options.folder, values);
      }
      if (!ignoreModelValues) {
        NormalizeObjectKeys(options.folder, this.FLATTENED_VALUES);
      }
      options.body = CreateRequestBody(options.folder, this.ALL_VALUES!, ignoreModelValues);
      delete options.folder;
    } else {
      super._getModel(options, values, skipValidation, ignoreModelValues);
    }
  }

  get(options: UnObj) {
    options = super._objectifyString(options) || {};
    const folderId = super._getFolderId(options);
    const apiPath = `${BASE_PATH}/${folderId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getItems(options: UnObj) {
    options = super._objectifyString(options) || {};
    const folderId = super._getFolderId(options);
    const apiPath = `${BASE_PATH}/${folderId}/items`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getCollaborations(options: UnObj) {
    options = super._objectifyString(options) || {};
    const folderId = super._getFolderId(options);
    const apiPath = `${BASE_PATH}/${folderId}/collaborations`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getTrashedItems(options: UnObj) {
    options = options || {};
    const apiPath = `${BASE_PATH}/trash/items`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getTrashedFolder(options: UnObj) {
    options = super._objectifyString(options) || {};
    const folderId = super._getFolderId(options);

    const apiPath = `${BASE_PATH}/${folderId}/trash`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  create(options: UnObj) {
    options = options || {};
    if (!this.client._simpleMode) {
      const REQUIRED_VALUES = [MODEL_VALUES.PARENT, MODEL_VALUES.ID, MODEL_VALUES.NAME];
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getFolder(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  update(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    if (!this.client._simpleMode) {
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getFolder(options, [], skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${folderId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  copy(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    if (!this.client._simpleMode) {
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);
      const REQUIRED_VALUES = [MODEL_VALUES.PARENT, MODEL_VALUES.ID];
      this._getFolder(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);

      if (options.newName) {
        options.body.name = options.newName;
        delete options.newName;
      }
    }
    const apiPath = `${BASE_PATH}/${folderId}/copy`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  createSharedLink(options: UnObj) {
    options = super._objectifyString(options) || {};
    const folderId = super._getFolderId(options);
    return super._createSharedLink(options, folderId, BASE_PATH, this.FLATTENED_VALUES);
  }

  updateCollections(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);

    if (options.collections) {
      options.body.collections = options.collections;
      delete options.collections;
    }

    const apiPath = `${BASE_PATH}/${folderId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  restore(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    if (!this.client._simpleMode) {
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getFolder(options, [], skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${folderId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  delete(options: UnObj) {
    options = super._objectifyString(options) || {};
    options.params = options.params || {};
    options.params.recursive = options.params.recursive || true;
    const folderId = super._getFolderId(options);

    const apiPath = `${BASE_PATH}/${folderId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }

  permanentlyDelete(options: UnObj) {
    options = super._objectifyString(options) || {};
    const folderId = super._getFolderId(options);

    const apiPath = `${BASE_PATH}/${folderId}/trash`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }
}
