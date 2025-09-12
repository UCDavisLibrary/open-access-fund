import { BaseService, getLogger } from '@ucd-lib/cork-app-utils';
import config from '../../utils/config.js';

/**
 * @class BaseServiceImp
 * @description Extends the cork-app-utils BaseService to add auth headers to requests
 * Import this class instead of BaseService directly from @ucd-lib/cork-app-utils
 */
export default class BaseServiceImp extends BaseService {
  constructor() {
    super();
  }

  /**
   * @description Logger instance for this service
   */
  get logger() {
    if( this._logger ) return this._logger;
    this._logger = getLogger(this.constructor.name);
    return this._logger;
  }

  /**
   * @description Adds auth headers to request before calling super.request
   * @param {Object} options - request options
   * @returns
   */
  async request(options){
    const appConfig = config.appConfig;
    if( appConfig.auth?.keycloakClient ) {
      const kc = appConfig.auth.keycloakClient;
      if( !options.fetchOptions ) options.fetchOptions = {};
      if( !options.fetchOptions.headers ) options.fetchOptions.headers = {};
      try {
        await kc.updateToken(10);
        options.fetchOptions.headers.Authorization = `Bearer ${kc.token}`
      } catch (error) {}
    } else {
      this.logger.warn('No auth client found in appConfig, requests will be made without auth headers');
    }
    return await super.request(options);
  }

  /**
   * @description Log if 500+ error. Will report to google cloud if APP_REPORT_ERRORS_ENABLED=true
   * @param {*} options
   * @param {*} resolve
   * @param {*} error
   */
  async _handleError(options, resolve, error) {
    await super._handleError(options, resolve, error);
    if ( error?.response?.status >= 500) {
      const e = {
        type: 'cork-service.server-error',
        payload: error?.payload,
        url: options.url,
      }
      if ( options.json && options?.fetchOptions?.body ){
        e.requestBody = JSON.parse(options.fetchOptions.body);
      }
      this.logger.error(e);
    }
  }
}
