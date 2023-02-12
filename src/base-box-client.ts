import { hasOwnProperty, isObject, isString } from '@whoj/utils-core';
import type { Func } from '@whoj/utils-types';
import Folders from './managers/folders';
import Files from './managers/files';
import WebLinks from './managers/web-links';
import Collaborations from './managers/collaborations';
import Collections from './managers/collections';
import Comments from './managers/comments';
import Groups from './managers/groups';
import Metadata from './managers/metadata';
import Search from './managers/search';
import Tasks from './managers/tasks';
import Users from './managers/users';
import BOX_CONSTANTS from './config/box-constants';
import BoxHttp from './box-http';
import type { BoxConfig, Token, UnObj } from './options';

export default class BaseBoxClient {
  protected _folders;
  protected _files;
  protected _webLinks;
  protected _collaborations;
  protected _collections;
  protected _comments;
  protected _groups;
  protected _metadata;
  protected _search;
  protected _tasks;
  protected _users;
  protected _baseApiUrl: string;
  protected _returnsOnlyOptions: boolean;
  protected _skipValidation: boolean;
  protected _simpleMode: boolean;
  protected _accessToken?: UnObj | Func<Promise<any> | void>;
  protected _hasStoredAccessToken: boolean;
  protected _verbose: boolean;
  protected httpService;
  protected Promise;

  constructor(config: BoxConfig) {
    this._folders = new Folders(this);
    this._files = new Files(this);
    this._webLinks = new WebLinks(this);
    this._collaborations = new Collaborations(this);
    this._collections = new Collections(this);
    this._comments = new Comments(this);
    this._groups = new Groups(this);
    this._metadata = new Metadata(this);
    this._search = new Search(this);
    this._tasks = new Tasks(this);
    this._users = new Users(this);
    this._baseApiUrl = config.baseUrl || 'https://api.box.com/2.0';
    this._returnsOnlyOptions = ((hasOwnProperty(config, 'noRequestMode') && config.noRequestMode === true));
    this._skipValidation = ((hasOwnProperty(config, 'skipValidation') && config.skipValidation === true));
    this._simpleMode = ((hasOwnProperty(config, 'simpleMode') && config.simpleMode === true));
    // @ts-ignore
    this._accessToken = this._checkTokenType(config);
    this._hasStoredAccessToken = !!(this._accessToken);
    this._verbose = ((hasOwnProperty(config, 'verbose') && config.verbose === true));

    this.httpService = config.httpService || BoxHttp;
    this.Promise = config.Promise || Promise;
  }

  get folders() {
    return this._folders;
  }

  get files() {
    return this._files;
  }

  get webLinks() {
    return this._webLinks;
  }

  get collaborations() {
    return this._collaborations;
  }

  get collections() {
    return this._collections;
  }

  get comments() {
    return this._comments;
  }

  get groups() {
    return this._groups;
  }

  get metadata() {
    return this._metadata;
  }

  get search() {
    return this._search;
  }

  get tasks() {
    return this._tasks;
  }

  get users() {
    return this._users;
  }

  _checkTokenType(token: Token, removeFromOptions = false) {
    if (isString(token)) {
      return token;
    }

    let foundToken;

    if (isObject(token)) {
      if (hasOwnProperty(token, 'accessToken')) {
        foundToken = token.accessToken;
        if (removeFromOptions) {
          delete token.accessToken;
        }
      }

      if (hasOwnProperty(token, 'access_token')) {
        foundToken = token.access_token;
        if (removeFromOptions) {
          delete token.access_token;
        }
      }
    }

    return foundToken;
  }

  _handleAuthorization(options: UnObj<BoxConfig>, accessToken: string) {
    if (accessToken) {
      return this._constructHeaders(options, accessToken);
    }

    if (options?.accessToken || options?.access_token) {
      const accessToken = options.accessToken || options.access_token;
      (options.accessToken) ? delete options.accessToken : delete options.access_token;
      return this._constructHeaders(options, accessToken);
    } else if (this._hasStoredAccessToken) {
      return this._constructHeaders(options, this._accessToken!);
    } else {
      const token = this._checkTokenType(options, true);
      return this._constructHeaders(options, token!);
    }
  }

  _constructHeaders(options: any, accessToken: any) {
    const headers: { [p: string]: any } = {};
    if (accessToken) {
      headers[BOX_CONSTANTS.HEADER_AUTHORIZATION] = this._constructAuthorizationHeader(accessToken);
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  _constructAuthorizationHeader(accessToken: string) {
    return `${BOX_CONSTANTS.HEADER_AUTHORIZATION_PREFIX}${accessToken}`;
  }

  _checkForEmptyObjects(options: { [x: string]: any }) {
    // eslint-disable-next-line array-callback-return
    Object.keys(options).map((field) => {
      if (field !== 'body'
          && field !== 'upload'
          && field !== 'chunkedUpload'
          && field !== 'useXHR'
          && field !== 'returnCancelToken'
          && field !== 'returnsOnlyOptions'
          && field !== 'includeFullResponse'
          && this._isEmpty(options[field])) {
        delete options[field];
      }
    });
  }

  _isEmpty(object: { hasOwnProperty: (arg0: string) => any }) {
    for (const key in object) {
      // eslint-disable-next-line no-prototype-builtins
      if (object.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  _applyFields(options: { [x: string]: any, params?: any, fields?: any }) {
    options.params = options.params || {};
    if (options.fields) {
      options.params.fields = options.fields;
      delete options.fields;
    }
    return options.params;
  }

  _formatOptions(options: { [x: string]: any, setAsNewAccessToken?: any, headers?: any, chunkedUpload?: any, useXHR?: any, returnCancelToken?: any, includeFullResponse?: any, url?: any, params?: any, upload?: any, mode?: any, body?: any, method?: any }) {
    if (options.chunkedUpload) {
      return options;
    }

    const formattedOptions: UnObj = {};
    (options.useXHR) ? formattedOptions.useXHR = true : null;
    (options.returnCancelToken) ? formattedOptions.returnCancelToken = true : null;
    (options.includeFullResponse) ? formattedOptions.includeFullResponse = true : null;
    let uri = options.url;

    if (options.params) {
      uri += '?';
      uri += Object.keys(options.params).map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`;
      }).join('&');
    }
    formattedOptions.url = uri;
    formattedOptions.headers = options.headers;

    if (options.upload) {
      options.headers['Content-Type'] = 'multipart/form-data';
      options.mode = 'cors';
      return options;
    }

    if (options.body && typeof options.body === 'object' && !options.upload) {
      formattedOptions.body = JSON.stringify(options.body);
      if (!formattedOptions.headers['Content-Type']) {
        formattedOptions.headers['Content-Type'] = 'application/json;charset=UTF-8';
      }
    }

    formattedOptions.method = options.method;
    formattedOptions.data = options.body;
    formattedOptions.mode = 'cors';
    return formattedOptions;
  }

  _handleAngularFileUpload($http: { post: (arg0: any, arg1: any, arg2: { headers: any }) => any }, options: { [x: string]: any, headers?: any, url?: any, body?: any }) {
    options.headers['Content-Type'] = undefined;
    return $http.post(options.url, options.body, {
      headers: options.headers
    });
  }
}
