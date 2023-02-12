export interface BoxConfig {
  accessToken?: string;

  baseUrl?: string;

  noRequestMode?: boolean;

  skipValidation?: boolean;

  simpleMode?: boolean;

  verbose?: boolean;

  httpService?: any;

  tokenExpirationTime?: number;

  retryTimes?: number;

  storage?: 'localStorage' | 'sessionStorage';

  disableStorage?: boolean;

  suppressExpiration?: boolean;

  Promise?: PromiseConstructor;

  isPromise?: boolean;

  isCallback?: boolean;
}

export type Token = string | {
  accessToken?: string,
  access_token?: string,
  expiresAt?: number,
  expires_at?: number
};

export type UnObj<T extends object = {}> = T & { [p: string]: any };

export interface BoxdkClient {

}
