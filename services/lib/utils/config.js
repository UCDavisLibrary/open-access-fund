class Config {
  constructor(){

    this.adminApp = {
      env: this._getEnv('ADMIN_APP_ENV').value === 'dev' ? 'dev' : 'prod',
      title: this._getEnv('ADMIN_APP_TITLE', 'UC Davis Open Access Fund Administration'),
      routes: this._getEnv('ADMIN_APP_ROUTES', [], false, true),
      ports: {
        host: this._getEnv('ADMIN_APP_HOST_PORT', 3000),
        container: this._getEnv('ADMIN_APP_CONTAINER_PORT', 3000)
      },
      bundleName: this._getEnv('ADMIN_APP_BUNDLE_NAME', 'open-access-fund.js'),
      host: this._getEnv('ADMIN_APP_HOST'),
    }


    this.db = {
      tables: {
        submission: 'submission',
        submissionStatus: 'submission_status',
        userComment: 'user_comment',
        submissionTransaction: 'submission_transaction'
      }
    }

    this.api = {
      root: this._getEnv('API_ROOT', '/api'),
    }

    this.recaptcha = {
      key: this._getEnv('RECAPTCHA_KEY'),
      disabled: this._getEnv('RECAPTCHA_DISABLED', false),
      submissionAction: this._getEnv('RECAPTCHA_SUBMISSION_ACTION', 'submit_oaf_form'),
      projectId: this._getEnv('RECAPTCHA_PROJECT_ID', 'digital-ucdavis-edu'),
      scoreThreshold: this._getEnv('RECAPTCHA_SCORE_THRESHOLD', 0.5)
    }

    this.logger = {
      name: this._getEnv('LOGGER_NAME', 'open-access-fund')
    }
  }

  /**
   * @description Get the application configuration object written by the SPA middleware
   * @returns {Object} - Returns the application configuration object.
   */
  get appConfig(){
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
      return window.APP_CONFIG;
    }
    return {};
  }

  /**
   * @description Set the ADMIN_APP_HOST from the script tag in the document
   * Critical for cork model functionality when doing cross-origin hosting of the submission form
   */
  setAdminAppHostFromDocument(){
    if (typeof document !== 'undefined') {
      const script = document.querySelector('script[src*="open-access-fund.js"]');
      if ( !script ){
        console.warn('Could not find script tag for open-access-fund.js to set ADMIN_APP_HOST');
      }
      const url = new URL(script.src);
      this.adminApp.host.value = url.origin;
    }
  }

  /**
   * @description Make the application configuration object written by the SPA middleware
   * @param {Object} config - The configuration object to merge with the default configuration.
   * @returns {Object} - Returns the merged configuration object.
   */
  makeAppConfig(config={}){

    config.title = this.adminApp.title.value;
    config.routes = this.adminApp.routes.value;

    return config;
  }

  /**
   * @description Get an environment variable and return it as an object with name and value properties.
   * @param  {...any} args - Same as getEnv
   * @returns
   */
  _getEnv(...args) {
    const name = args[0];
    const value = this.getEnv(...args);
    return { name, value };
  }

  /**
   * @description Get an environment variable.  If the variable is not set, return the default value.
   * @param {String} name - The name of the environment variable.
   * @param {*} defaultValue - The default value to return if the environment variable is not set.
   * @param {Boolean|String} errorIfMissing - Throws an error if the environment variable is not set.
   * If true, throws an error in both browser and server environments.
   * If 'browser', throws an error only in the browser.
   * If 'server', throws an error only on the server.
   * @returns
   */
  getEnv(name, defaultValue=null, errorIfMissing=false, parseJson=false) {
    let value;
    if( typeof window !== 'undefined' ) {
      value = window.APP_CONFIG?.[name];
      errorIfMissing = errorIfMissing === true || errorIfMissing === 'browser';
    } else {
      value = process?.env?.[name];
      errorIfMissing = errorIfMissing === true || errorIfMissing === 'server';
    }
    if (value === undefined || value === null) {
      if (errorIfMissing) {
        throw new Error(`Environment variable ${name} is not set`);
      }
      return defaultValue;
    }

    if ( value?.toLowerCase?.() === 'false' ) {
      value = false;
    } else if ( value?.toLowerCase?.() === 'true' ) {
      value = true;
    }
    if (parseJson) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        throw new Error(`Environment variable ${name} is not valid JSON`);
      }
    }
    return value;

  }
}

export default new Config();
