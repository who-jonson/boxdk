'use strict';

import 'whatwg-fetch';

// import { ofetch } from 'ofetch';
// import type { FetchOptions } from 'ofetch';
import { hasOwnProperty } from '@whoj/utils-core';
import type { UnObj } from './options';

export default function BoxHttp(options: UnObj) {
  if (options.upload) {
    // Workaround for upload with Fetch library for now...
    // https://github.com/whatwg/fetch/issues/380
    return new Promise((resolve, reject) => {
      const client = new XMLHttpRequest();
      const uri = options.url;
      const method = options.method;

      client.open(method!, uri, true);
      if (options.headers) {
        if (options.headers['Content-Type']) {
          delete options.headers['Content-Type'];
        }
        Object.keys(options.headers).forEach((key) => {
          client.setRequestHeader(key, options.headers[key]);
        });
      }
      client.send(options.body);
      client.onload = function () {
        if (client.status >= 200 && client.status < 300) {
          resolve(JSON.parse(client.response));
        } else {
          reject(handleXMLHttpRequestErrors(client));
        }
      };
      client.onerror = function () {
        reject(handleXMLHttpRequestErrors(client));
      };
    });
    // Workaround for cancelling requests with Fetch library for now...
    // https://github.com/whatwg/fetch/issues/380
  } else if (!options.useXHR) {
    return fetch(options.url, options)
      .then(handleErrors)
      .then(response => constructResponse(response, options));
  } else {
    const client = new XMLHttpRequest();
    const request = new Promise((resolve, reject) => {
      const uri = options.url;
      const method = options.method;

      client.open(method, uri, true);
      Object.keys(options.headers).forEach((key) => {
        client.setRequestHeader(key, options.headers[key]);
      });
      client.send(options.body);
      client.onload = function () {
        if (client.status >= 200 && client.status < 300) {
          const returnData = (client.response) ? JSON.parse(client.response) : {};
          let headers;
          try {
            headers = parseXHRHeaders(client.getAllResponseHeaders());
          } catch (e) {
            headers = client.getAllResponseHeaders();
          }
          const builtResponse = {
            data: returnData,
            headers,
            status: client.status,
            statusText: client.statusText
          };
          resolve(constructResponse(builtResponse, options));
        } else {
          if (hasOwnProperty(options, 'verbose') && options.verbose) {
            console.log(client.getAllResponseHeaders());
          }
          reject(handleXMLHttpRequestErrors(client));
        }
      };
      client.onerror = function () {
        reject(handleXMLHttpRequestErrors(client));
      };
    });
    if (options.returnCancelToken) {
      function abort() {
        client.abort();
      }
      return {
        promise: request,
        abort
      };
    } else {
      return request;
    }
  }
  function handleXMLHttpRequestErrors(client: any) {
    let error: any;
    if (client.statusText) {
      error = new Error(client.statusText);
    } else {
      error = new Error('Unknown');
    }

    let headers;
    try {
      headers = parseXHRHeaders(client.getAllResponseHeaders());
    } catch (e) {
      headers = client.getAllResponseHeaders();
    }

    let responseText;
    if (client.response) {
      try {
        responseText = JSON.parse(client.response);
      } catch (e) {
        responseText = client.response;
      }
    } else {
      responseText = {};
    }
    error.response = {};
    error.response.headers = headers;
    error.response.status = client.status;
    error.response.statusText = client.statusText;
    error.response.data = responseText;
    return error;
  }
  function handleErrors(response: any) {
    if (!response.ok) {
      const error = new Error(response.statusText) as any;
      if (response) {
        return response.json().catch(() => {
          return {};
        })
          .then((body: any) => {
            error.response = {};
            if (Object.keys(body).length === 0) {
              error.response = response;
            } else {
              error.response = body;
            }
            throw error;
          });
      }
    }
    return response;
  }

  function constructResponse(response: any, options: UnObj) {
    let verbose = false;
    if (hasOwnProperty(options, 'verbose')) {
      verbose = options.verbose;
      delete options.verbose;
    }
    if (verbose) {
      console.log('options');
      console.log(options);
      console.log('response');
      console.log(response);
    }
    if (options && options.includeFullResponse) {
      if (response.data && response.headers && response.status) {
        return new Promise((resolve) => {
          resolve(response);
        });
      }
      const buildResponse = {
        data: {},
        headers: {},
        status: ''
      };
      return new Promise((resolve) => {
        const headers = response.headers;
        let retrieveHeaders;
        if (headers && headers.entries && typeof (headers.entries) === 'function') {
          retrieveHeaders = {};
          const iter = headers.entries();
          let header = iter.next();
          while (!header.done) {
            if (header.value && header.value.length && header.value.length === 2) {
              // @ts-ignore
              retrieveHeaders[header.value[0]] = header.value[1];
            }
            header = iter.next();
          }
        } else {
          retrieveHeaders = response.headers;
        }
        buildResponse.headers = retrieveHeaders;
        buildResponse.status = response.status;
        if (checkForJSONResponse(response)) {
          return response.json().catch(() => {
            return {};
          })
            .then((body: any) => {
              buildResponse.data = body;
              resolve(buildResponse);
            });
        } else if (checkForDataResponse(response)) {
          return new Promise((resolve) => {
            buildResponse.data = response.data;
            resolve(buildResponse);
          });
        } else {
          resolve(buildResponse);
        }
      });
    } else {
      if (checkForJSONResponse(response)) {
        return response.json().catch(() => {
          return {};
        });
      } else if (checkForDataResponse(response)) {
        return new Promise((resolve) => {
          resolve(response.data);
        });
      } else {
        return new Promise((resolve) => {
          resolve({});
        });
      }
    }
  }

  function parseXHRHeaders(headerStr?: string) {
    const headers: UnObj = {};
    if (!headerStr) {
      return headers;
    }
    const headerPairs = headerStr.split('\u000D\u000A');
    for (let i = 0; i < headerPairs.length; i++) {
      const headerPair = headerPairs[i];
      const index = headerPair.indexOf('\u003A\u0020');
      if (index > 0) {
        const key = headerPair.substring(0, index).toLowerCase();
        // @ts-ignore
        headers[key] = headerPair.substring(index + 2);
      }
    }
    return headers;
  }

  function checkForJSONResponse(response: any) {
    return ((response.json && typeof response.json === 'function'));
  }
  function checkForDataResponse(response: any) {
    return ((response.data && typeof response.data === 'object'));
  }
}
