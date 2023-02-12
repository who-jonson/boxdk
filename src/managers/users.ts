'use strict';

import type { Numberish } from '@whoj/utils-types';
import BOX_CONSTANTS from '../config/box-constants';
import type { UnObj } from '../options';
import Manager from './manager';

const BASE_PATH = '/users';
const MODEL_VALUES = {};

export default class Users extends Manager {
  constructor(client: any) {
    super(client, MODEL_VALUES);
  }

  getCurrentUser(options: UnObj) {
    options = options || {};
    const apiPath = `${BASE_PATH}/me`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }

  getGroupMemberships(options: UnObj, userId: Numberish) {
    options = options || {};
    const apiPath = `${BASE_PATH}/${userId}/memberships`;
    options.method = BOX_CONSTANTS.HTTP_VERBS.GET;
    return this.client.makeRequest(apiPath, options);
  }
}
