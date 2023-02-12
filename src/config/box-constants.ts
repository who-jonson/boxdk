const constants = {
  HEADER_AUTHORIZATION: 'Authorization',
  HEADER_AUTHORIZATION_PREFIX: 'Bearer ',
  HTTP_VERBS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    OPTIONS: 'OPTIONS'
  },
  MODES: {
    SKIP_VALIDATION: 'skipValidation',
    IGNORE_MODEL_VALUES: 'ignoreModelValues'
  },
  FOLDER: 'folder',
  FOLDER_ID: 'folderId',
  FILE: 'file',
  FILE_ID: 'fileId',
  VERSION: 'version',
  VERSION_ID: 'versionId',
  COMMENT: 'comment',
  COMMENT_ID: 'commentId',
  BOX_TOKEN_STORAGE_KEY: 'box_token'
} as const;

export type BoxdkConstants = typeof constants;

export type IdType = typeof constants.FILE | typeof constants.FOLDER | typeof constants.COMMENT | typeof constants.VERSION | 'unknown';
export type FormattedIdType = typeof constants.FILE_ID | typeof constants.FOLDER_ID | typeof constants.COMMENT_ID | typeof constants.VERSION_ID | 'unknown';

export default constants;
