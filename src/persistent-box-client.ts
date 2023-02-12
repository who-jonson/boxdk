'use strict';

import { isFunction, isObject } from '@whoj/utils-core';
import BaseBoxClient from './base-box-client';
import BOX_CONSTANTS from './config/box-constants';
import type { BoxConfig, Token, UnObj } from './options';

type _Callback = ((err: Error | string, token: Token) => void);
type _HandlerCallback = ((cb: _Callback) => void);
type _HandlerPromise = () => Promise<any>;
type AccessTokenHandler = _HandlerPromise | _HandlerCallback;

export default class PersistentBoxClient extends BaseBoxClient {
  protected _tokenExpirationTime;
  accessTokenHandler: AccessTokenHandler;
  accessTokenStore: any;
  storage;
  disableStorage;
  isCallback;
  isPromise;
  requestRetryTimes;
  supportsStorage;
  suppressExpiration;

  constructor(config: BoxConfig = {}) {
    super(config);
    this._tokenExpirationTime = config.tokenExpirationTime || 2700000;
    this.accessTokenHandler = this._checkConfigForAccessTokenHandler(config);
    this.accessTokenStore = this._defaultAccessTokenStore();
    this.storage = config.storage || 'localStorage';
    this.disableStorage = config.disableStorage || false;
    this.isCallback = config.isCallback || false;
    this.isPromise = config.isPromise || true;
    this.requestRetryTimes = config.retryTimes || 3;
    this.supportsStorage = this._storageAvailable(this.storage);
    this.suppressExpiration = config.suppressExpiration || false;
  }

  _checkConfigForAccessTokenHandler(config?: UnObj<BoxConfig>) {
    if ((config?.accessTokenHandler || config?.access_token_handler)) {
      config.accessTokenObject = config.accessTokenHandler || config.access_token_handler;
      return config.accessTokenObject;
    } else {
      throw new Error('An accessTokenHandler is required to create a PersisentBoxClient. Please provide a callback function or promise that resolves to an access token');
    }
  }

  _storageAvailable(type: 'localStorage' | 'sessionStorage') {
    try {
      const storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  _verifyAccessTokenObject(accessTokenObject: Token) {
    const verifiedAccessTokenObject: Token = {};
    if (typeof accessTokenObject === 'string') {
      verifiedAccessTokenObject.accessToken = accessTokenObject;
      if (!this.suppressExpiration) {
        verifiedAccessTokenObject.expiresAt = this._calculateTokenExpiration();
      }
      return verifiedAccessTokenObject;
    }
    if (isObject(accessTokenObject) && (accessTokenObject.accessToken || accessTokenObject.access_token)) {
      verifiedAccessTokenObject.accessToken = accessTokenObject.accessToken || accessTokenObject.access_token;
    }
    if (isObject(accessTokenObject) && !this.suppressExpiration && (accessTokenObject.expiresAt || accessTokenObject.expires_at)) {
      verifiedAccessTokenObject.expiresAt = accessTokenObject.expiresAt || accessTokenObject.expires_at;
    }
    if (!this.suppressExpiration && !verifiedAccessTokenObject.expiresAt) {
      verifiedAccessTokenObject.expiresAt = this._calculateTokenExpiration();
    }
    return verifiedAccessTokenObject;
  }

  _calculateTokenExpiration() {
    return Date.now() + this._tokenExpirationTime;
  }

  _promisifyAccessTokenHandler(accessTokenHandler: AccessTokenHandler) {
    if (isFunction<_HandlerCallback>(accessTokenHandler) && this.isCallback) {
      return new this.Promise((resolve, reject) => {
        accessTokenHandler((err, token) => {
          if (err) {
            reject(err);
          }
          if (token) {
            resolve(token);
          } else {
            reject('Couldn\'t retrieve a new token.');
          }
        });
      });
    } else if (isFunction<_HandlerPromise>(accessTokenHandler) && this.isPromise) {
      const isAccessTokenHandlerAPromise = accessTokenHandler();
      if (isObject(isAccessTokenHandlerAPromise) && 'then' in isAccessTokenHandlerAPromise) {
        return isAccessTokenHandlerAPromise;
      } else {
        throw new Error('accessTokenHandler must resolve to a function or promise');
      }
    } else {
      throw new Error('accessTokenHandler must resolve to a function or promise');
    }
  }

  _defaultAccessTokenStore() {
    this._accessToken = () => {
      if (this.supportsStorage && !this.disableStorage) {
        return new this.Promise((resolve) => {
          return this._promisifyAccessTokenHandler(this.accessTokenHandler)
            .then((token: any) => {
              token = this._verifyAccessTokenObject(token);
              window[this.storage].setItem(BOX_CONSTANTS.BOX_TOKEN_STORAGE_KEY, JSON.stringify(token));
              resolve(token);
            });
        });
      } else {
        return new this.Promise((resolve) => {
          return this._promisifyAccessTokenHandler(this.accessTokenHandler)
            .then((token: any) => {
              token = this._verifyAccessTokenObject(token);
              resolve(token);
            });
        });
      }
    };

    return {
      accessToken: this._accessToken
    };
  }

  _isExpired(token: Exclude<Token, string>) {
    const expiresAt = token.expires_at || token.expiresAt || 0;
    return (expiresAt < Date.now());
  }

  retrieveToken(requestRetryCount: number) {
    if (this.supportsStorage && !this.disableStorage) {
      let boxToken = window[this.storage].getItem(BOX_CONSTANTS.BOX_TOKEN_STORAGE_KEY);
      boxToken = boxToken ? JSON.parse(boxToken) : null;
      if (boxToken && !this._isExpired((boxToken as Exclude<Token, string>)) && requestRetryCount === 0) {
        return new this.Promise((resolve) => {
          resolve(boxToken);
        });
      } else {
        window[this.storage].removeItem(BOX_CONSTANTS.BOX_TOKEN_STORAGE_KEY);
        return this.accessTokenStore.accessToken();
      }
    } else {
      return this.accessTokenStore.accessToken();
    }
  }

  reauth(path: string, options: UnObj, requestRetryCount: number) {
    return this.retrieveToken(requestRetryCount)
      .then((token: Exclude<Token, string>) => {
        const headers = options.headers || {};
        headers[BOX_CONSTANTS.HEADER_AUTHORIZATION] = `Bearer ${token.accessToken}`;
        options = options || {};
        let compiledOptions = Object.assign({}, options);
        compiledOptions.url = options.url || `${this._baseApiUrl}${path}`;
        compiledOptions.headers = headers;
        compiledOptions.params = this._applyFields(options);
        this._checkForEmptyObjects(compiledOptions);
        compiledOptions = this._formatOptions(compiledOptions);
        return compiledOptions;
      });
  }

  makeRequest(path: string, options: UnObj, requestRetryCount: number) {
    requestRetryCount = requestRetryCount || 0;
    if (requestRetryCount > this.requestRetryTimes) {
      throw new Error('Exceeded retry count.');
    }
    return this.reauth(path, options, requestRetryCount)
      .then((compiledOptions: any) => {
        if (this._returnsOnlyOptions || options.returnsOnlyOptions) {
          if (compiledOptions.upload) {
            compiledOptions.headers['Content-Type'] = undefined;
            delete compiledOptions.upload;
          }
          return compiledOptions;
        } else if (this.httpService.defaults && options.upload) {
          return this._handleAngularFileUpload(this.httpService, compiledOptions);
        } else {
          return this.httpService(compiledOptions)
            .catch((err: UnObj<Error>) => {
              const status = err.status || err.response.status;
              if (status === undefined || status <= 0) {
                if (this.supportsStorage && !this.disableStorage) {
                  window[this.storage].removeItem(BOX_CONSTANTS.BOX_TOKEN_STORAGE_KEY);
                }
                return this.makeRequest(path, options, requestRetryCount + 1);
              } else {
                throw err;
              }
            });
        }
      });
  }
}
