import BasicBoxClient from './box-client';
import PersistentBoxClient from './persistent-box-client';

export default class Boxdk {
  private readonly _BasicBoxClient;

  private readonly _PersistentBoxClient;

  constructor() {
    this._BasicBoxClient = BasicBoxClient;
    this._PersistentBoxClient = PersistentBoxClient;
  }

  get BasicBoxClient(): typeof BasicBoxClient {
    return this._BasicBoxClient;
  }

  get PersistentBoxClient(): typeof PersistentBoxClient {
    return this._PersistentBoxClient;
  }
}
