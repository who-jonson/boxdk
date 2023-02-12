'use strict';

import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/metadata_templates';
const BASE_PATH_FOLDER_METADATA = '/folders';
const BASE_PATH_FILE_METADATA = '/files';
const MODEL_VALUES = {};

export default class Metadata extends Manager {
  constructor(client: any) {
    super(client, MODEL_VALUES);
  }

  get(options: UnObj) {
    options = options || {};
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);
    const apiPath = `${BASE_PATH}/${scope}/${templateKey}/schema`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getTemplates(options: UnObj) {
    options = options || {};
    const scope = super._getScope(options);
    const apiPath = `${BASE_PATH}/${scope}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getFolderMetadata(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FOLDER_METADATA}/${folderId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getAllFolderMetadata(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);

    const apiPath = `${BASE_PATH_FOLDER_METADATA}/${folderId}/metadata`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getFileMetadata(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FILE_METADATA}/${fileId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getAllFileMetadata(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);

    const apiPath = `${BASE_PATH_FILE_METADATA}/${fileId}/metadata`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  createFolderMetadata(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FOLDER_METADATA}/${folderId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    return this.client.makeRequest(apiPath, options);
  }

  createFileMetadata(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FILE_METADATA}/${fileId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    return this.client.makeRequest(apiPath, options);
  }

  updateFileMetadata(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FILE_METADATA}/${fileId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json-patch+json';
    return this.client.makeRequest(apiPath, options);
  }

  updateFolderMetadata(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FOLDER_METADATA}/${folderId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json-patch+json';
    return this.client.makeRequest(apiPath, options);
  }

  deleteFolderMetadata(options: UnObj) {
    options = options || {};
    const folderId = super._getFolderId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FOLDER_METADATA}/${folderId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }

  deleteFileMetadata(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    const scope = super._getScope(options);
    const templateKey = super._getTemplateKey(options);

    const apiPath = `${BASE_PATH_FILE_METADATA}/${fileId}/metadata/${scope}/${templateKey}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }
}

