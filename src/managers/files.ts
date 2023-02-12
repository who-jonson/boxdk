'use strict';

import { objectKeys } from '@whoj/utils-core';
import BOX_CONSTANTS from '../config/box-constants';
import VerifyRequiredValues from '../util/verify-required-values';
import CreateRequestBody from '../util/create-request-body';
import NormalizeObjectKeys from '../util/normalize-object-keys';
import generateSHA1 from '../util/generate-sha1';
import generateMD5 from '../util/generate-md5';
import checkForFormData from '../util/check-for-form-data';
import type { UnObj } from '../options';
import Manager from './manager';
import ChunkedUploader from './chunked-uploader';

const BASE_PATH = '/files';
const LOCK = 'lock';

const MODEL_VALUES = {
  NAME: 'name',
  PARENT: 'parent',
  ID: 'parent.id',
  DESCRIPTION: 'description',
  SHARED_LINK: 'shared_link',
  SHARED_LINK_ACCESS: 'shared_link.access',
  UNSHARED_AT: 'shared_link.unshared_at',
  PERMISSIONS: 'shared_link.permissions',
  CAN_DOWNLOAD: 'shared_link.permissions.can_download',
  CAN_PREVIEW: 'shared_link.permissions.can_preview',
  FOLDER_UPLOAD_EMAIL: 'folder_upload_email',
  FOLDER_UPLOAD_EMAIL_ACCESS: 'folder_upload_email.access',
  OWNED_BY: 'owned_by',
  OWNED_BY_ID: 'owned_by.id',
  SYNC_STATE: 'sync_state',
  TAGS: 'tags',
  SIZE: 'size'
};

const DIMENSION_VALUES = {
  MIN_HEIGHT: 'min_height',
  MAX_HEIGHT: 'max_height',
  MIN_WIDTH: 'min_width',
  MAX_WIDTH: 'max_width'
};

const DIMENSIONS = objectKeys(DIMENSION_VALUES).map(key => DIMENSION_VALUES[key]);

const MINIMUM_CHUNKED_FILE_SIZE = 50000000;

export default class Files extends Manager {
  constructor(
    readonly client: any,
    readonly UPLOAD_PATH = 'https://upload.box.com/api/2.0'
  ) {
    super(client, MODEL_VALUES);
  }

  _getVersionId(options: UnObj) {
    let versionId;
    if (options.versionId || options.version_id) {
      versionId = options.versionId || options.version_id;
      (options.versionId) ? delete options.versionId : options.version_id;
    }
    super._testForMissingId(versionId, BOX_CONSTANTS.VERSION, BOX_CONSTANTS.VERSION_ID);
    return versionId;
  }

  /**
   * @param {Object} options
   * @param {Array} values
   * @param {Boolean} skipValidation
   * @param {Boolean} ignoreModelValues
   */
  _getFile(options: UnObj, values: Array<any>, skipValidation: boolean, ignoreModelValues?: boolean) {
    skipValidation = skipValidation || this.client.skipValidation || false;
    ignoreModelValues = ignoreModelValues || false;

    if (options.file) {
      if (!skipValidation) {
        VerifyRequiredValues(options.file, values);
      }
      if (!ignoreModelValues) {
        NormalizeObjectKeys(options.file, this.FLATTENED_VALUES);
      }
      options.body = CreateRequestBody(options.file, (this.ALL_VALUES || []), ignoreModelValues);
      delete options.file;
    } else {
      super._getModel(options, values, skipValidation, ignoreModelValues);
    }
  }

  /**
   * @param options
   */
  get(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);
    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  // Currently not possible due to CORS
  // Need to implement your own server endpoint
  // and retrieve download redirect url.
  // download(options) {
  //   options.params = options.params || {};

  //   let versionId = options.versionId || '';
  //   if (versionId) {
  //     options.params.version = versionId;
  //   }

  //   let fileId = super._getFileId(options);

  //   let apiPath = `${BASE_PATH}/${fileId}/content`;
  //   options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
  //   return this.client.makeRequest(apiPath, options);
  // }

  getDownloadUrl(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);
    options.params = options.params || {};
    if (options.fields || options.params.fields) {
      options.params.fields = (options.params.fields) ? options.params.fields : options.fields;
      options.params.fields = options.params.fields.concat(',download_url');
    } else {
      options.params = {
        fields: 'download_url'
      };
    }
    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  private optionsHasFile(options: UnObj) {
    if (!options.file) {
      throw new Error('Must make this call with an HTML5 File object.');
    }
  }

  // Be careful, this is an experimental and untested method.
  // Use at your own risk!
  // Tested lightly with Angular 1 and vanilla JS in lastest build of Chrome Version 59.0.3071.115 on MacOS
  chunkedUpload(options: UnObj) {
    options = options || {};
    this.optionsHasFile(options);
    if (options.file && options.file.size < MINIMUM_CHUNKED_FILE_SIZE) {
      throw new Error('File size less than minimum allowed for this API: 50000000');
    }
    options.name = options.name || options.file.name;
    const session = new ChunkedUploader(this, options.name, options.file, options.parentFolder, options.listeners, options.id);
    return session.startSession();
  }

  // Be careful, this is an experimental and untested method.
  // Use at your own risk!
  // Tested lightly with Angular 1 and vanilla JS in lastest build of Chrome Version 59.0.3071.115 on MacOS
  chunkedUploadNewFileVersion(options: UnObj) {
    options = options || {};
    if (!options.id) {
      throw new Error('chunkedUploadNewVersion requires an existing file ID');
    }

    this.optionsHasFile(options);

    if (options.file && options.file.size < MINIMUM_CHUNKED_FILE_SIZE) {
      throw new Error('File size less than minimum allowed for this API: 50000000');
    }
    options.name = options.name || options.file.name;
    const session = new ChunkedUploader(this, options.name, options.file, options.parentFolder, options.listeners, options.id);
    return session.startSession();
  }

  upload(options: UnObj) {
    options = options || {};
    options.url = options.url || `${this.UPLOAD_PATH}/files/content`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    options.upload = true;
    return this.client.makeRequest(null, options);
  }

  uploadNewFileVersion(options: UnObj) {
    if (!checkForFormData()) {
      throw new Error('Form Data not supported. The uploadNewFileVersion requires Form Data in the browser.');
    }
    options = options || {};
    const fileId = options.body.get('id') || options.body.get('fileId') || options.body.get('file_id');
    options.url = options.url || `${this.UPLOAD_PATH}/files/${fileId}/content`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    options.upload = true;
    return this.client.makeRequest(null, options);
  }

  // Be careful, this is an experimental and untested method.
  // Use at your own risk!
  uploadWithPreflightAndMd5(options: UnObj) {
    options = options || {};
    const file = options.file;
    const formData = options.body;
    const preflightOptions = { name: options.name, parent: options.parent, size: options.file.size };
    const decorateOptions = JSON.parse(JSON.stringify(options));
    return this.preflightCheck(preflightOptions)
      .then((resp: any) => {
        if (resp.upload_url) {
          decorateOptions.url = resp.upload_url;
        }
      })
      .then(() => {
        if (file === undefined) {
          throw new Error('Couldn\'t access file...');
        }
        return generateMD5(file);
      })
      .then((md5: any) => {
        decorateOptions.headers = decorateOptions.headers || {};
        decorateOptions.body = formData;
        delete decorateOptions.file;
        decorateOptions.headers['Content-MD5'] = md5;
        return this.upload(decorateOptions);
      });
  }

  uploadNewFileVersionWithPreflightAndMd5(options: UnObj) {
    if (!checkForFormData()) {
      throw new Error('Form Data not supported. The uploadNewFileVersion requires Form Data in the browser.');
    }
    options = options || {};
    const file = options.file;
    const formData = options.body;
    const decorateOptions = JSON.parse(JSON.stringify(options));
    options.fileId = options.body.get('id') || options.body.get('fileId') || options.body.get('file_id');
    return this.preflightCheckNewFileVersion(options)
      .then((resp: any) => {
        if (resp.upload_url) {
          decorateOptions.url = resp.upload_url;
        }
      })
      .then(() => {
        if (file === undefined) {
          throw new Error('Couldn\'t access file...');
        }
        return generateMD5(file);
      })
      .then((md5: any) => {
        decorateOptions.headers = decorateOptions.headers || {};
        decorateOptions.body = formData;
        delete decorateOptions.file;
        decorateOptions.headers['Content-MD5'] = md5;
        return this.uploadNewFileVersion(decorateOptions);
      });
  }

  preflightCheck(options: UnObj) {
    options = options || {};
    if (!this.client._simpleMode) {
      const REQUIRED_VALUES = [MODEL_VALUES.SIZE, MODEL_VALUES.NAME];
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getFile(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/content`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.OPTIONS;
    return this.client.makeRequest(apiPath, options);
  }

  preflightCheckNewFileVersion(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    if (!this.client._simpleMode) {
      const REQUIRED_VALUES = [MODEL_VALUES.SIZE, MODEL_VALUES.NAME];
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getFile(options, REQUIRED_VALUES, skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${fileId}/content`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.OPTIONS;
    return this.client.makeRequest(apiPath, options);
  }

  update(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    options.url = options.url || `${this.UPLOAD_PATH}/${fileId}/content`;
    this.upload(options);
  }

  getComments(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);
    const apiPath = `${BASE_PATH}/${fileId}/comments`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getTasks(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);
    const apiPath = `${BASE_PATH}/${fileId}/tasks`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getEmbedLink(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);

    options.params = options.params || {};
    if (options.fields || options.params.fields) {
      if (options.fields) {
        options.params.fields = options.fields;
        delete options.fields;
      }
      options.params.fields = options.params.fields.concat(',expiring_embed_link');
    } else {
      options.params.fields = 'expiring_embed_link';
    }

    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getVersions(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);

    const apiPath = `${BASE_PATH}/${fileId}/versions`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getThumbnail(options: UnObj) {
    options = options || {};
    options.extension = options.extension || '.png';
    options.params = options.params || {};
    const fileId = super._getFileId(options);

    // eslint-disable-next-line array-callback-return
    Object.keys(options).map((key) => {
      // @ts-ignore
      if (DIMENSIONS.includes(key)) {
        options.params[key] = options[key];
        delete options[key];
      }
    });

    const apiPath = `${BASE_PATH}/${fileId}/thumbnail${options.extension}`;
    delete options.extension;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getTrashedFile(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);

    const apiPath = `${BASE_PATH}/${fileId}/trash`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getCollaborations(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);
    const apiPath = `${BASE_PATH}/${fileId}/collaborations`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  createSharedLink(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    return super._createSharedLink(options, fileId, BASE_PATH, this.FLATTENED_VALUES);
  }

  promoteVersion(options: UnObj) {
    options = options || {};
    options.body = options.body || {};
    const fileId = super._getFileId(options);

    if (!options.body.id) {
      options.body.id = this._getVersionId(options);
    }

    options.body.type = 'file_version';

    const apiPath = `${BASE_PATH}/${fileId}/versions/current`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  copy(options: UnObj) {
    options = options || {};
    options.body = options.body || {};
    const fileId = super._getFileId(options);

    if (!options.body.parent && !options.body.parent.id) {
      options.body.parent = {};
      if (options.id) {
        options.body.parent.id = options.id;
        delete options.id;
      } else if (options.parentId) {
        options.body.parent.id = options.parentId;
        delete options.parentId;
      } else {
        throw new Error('A parentId or id is required for this API call.');
      }
    }

    if (options.name) {
      options.body.name = options.name;
      delete options.name;
    } else if (options.newName) {
      options.body.name = options.newName;
      delete options.newName;
    }

    const apiPath = `${BASE_PATH}/${fileId}/copy`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  updateInfo(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    if (!this.client._simpleMode) {
      const skipValidation = super._setSkipValidation(options);
      const ignoreModelValues = super._setIgnoreModelValues(options);

      this._getFile(options, [], skipValidation, ignoreModelValues);
    }
    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  lock(options: UnObj) {
    options = options || {};
    options.body = options.body || {};
    const fileId = super._getFileId(options);

    if (options[LOCK]) {
      options.body[LOCK] = options[LOCK];
      options.body[LOCK].type = LOCK;
      delete options[LOCK];
    } else {
      options.body.lock = {
        type: LOCK
      };
    }
    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  unlock(options: UnObj) {
    options = options || {};
    options.body = options.body || {};
    const fileId = super._getFileId(options);

    if (options[LOCK]) {
      delete options[LOCK];
    }
    options.body[LOCK] = null;

    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.PUT;
    return this.client.makeRequest(apiPath, options);
  }

  restore(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);

    if (options.parent) {
      options.body = options.body || {};
      options.body.parent = options.parent;
      delete options.parent;
    }

    if (options.name) {
      options.body = options.body || {};
      options.body.name = options.name;
      delete options.name;
    }

    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.POST;
    return this.client.makeRequest(apiPath, options);
  }

  delete(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);

    const apiPath = `${BASE_PATH}/${fileId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }

  deleteVersion(options: UnObj) {
    options = options || {};
    const fileId = super._getFileId(options);
    const versionId = this._getVersionId(options);

    const apiPath = `${BASE_PATH}/${fileId}/versions/${versionId}`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }

  permanentlyDelete(options: UnObj) {
    options = super._objectifyString(options) || {};
    const fileId = super._getFileId(options);

    const apiPath = `${BASE_PATH}/${fileId}/trash`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.DELETE;
    return this.client.makeRequest(apiPath, options);
  }

  createSHA1Hash(blob: Blob) {
    return generateSHA1(blob);
  }
}
