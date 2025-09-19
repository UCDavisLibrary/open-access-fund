class Config {
  constructor(){

    this.adminApp = {
      env: this._getEnv('ADMIN_APP_ENV').value === 'dev' ? 'dev' : 'prod',
      title: this._getEnv('ADMIN_APP_TITLE', 'UC Davis Open Access Fund Administration'),
      routes: this._getEnv('ADMIN_APP_ROUTES', ['logout', 'submission'], false, true),
      ports: {
        host: this._getEnv('ADMIN_APP_HOST_PORT', 3000),
        container: this._getEnv('ADMIN_APP_CONTAINER_PORT', 3000)
      },
      bundleName: this._getEnv('ADMIN_APP_BUNDLE_NAME', 'open-access-fund.js'),
      host: this._getEnv('ADMIN_APP_HOST', '' ),
      submissionPaginationSize: this._getEnv('ADMIN_APP_SUBMISSION_PAGINATION_SIZE', 20),

      auth: {
        keycloakJsClient: {
          url: this._getEnv('ADMIN_APP_KEYCLOAK_URL', 'https://auth.library.ucdavis.edu'),
          realm: this._getEnv('ADMIN_APP_KEYCLOAK_REALM', 'internal'),
          clientId: this._getEnv('ADMIN_APP_KEYCLOAK_CLIENT_ID', 'oaf-admin-client'),
        },
        oidcScope: this._getEnv('ADMIN_APP_OIDC_SCOPE', 'profile roles ucd-ids'),
        serverCacheExpiration: this._getEnv('ADMIN_APP_SERVER_CACHE_EXPIRATION', '10 minutes'),
        serverCacheLruSize: this._getEnv('ADMIN_APP_SERVER_CACHE_LRU_SIZE', 3),
        silentCheckSsoRedirectUri: this._getEnv('ADMIN_APP_SILENT_CHECK_SSO_REDIRECT_URI', 'silent-check-sso.html'),
        tokenRefreshRate: this._getEnv('ADMIN_APP_TOKEN_REFRESH_RATE', 300), // seconds
        loginCheckRefreshRate: this._getEnv('ADMIN_APP_LOGIN_CHECK_REFRESH_RATE', 10 * 60 * 1000) // milliseconds
      },

      clientLogger: {
        logLevel: this._getEnv('ADMIN_APP_CLIENT_LOGGER_LOG_LEVEL', 'info'),
        logLevels: {},
        disableCallerInfo: this._getEnv('ADMIN_APP_CLIENT_LOGGER_DISABLE_CALLER_INFO', false),
        reportErrors: {
          enabled: this._getEnv('ADMIN_APP_CLIENT_REPORT_ERRORS_ENABLED', false),
          url: this._getEnv('ADMIN_APP_CLIENT_REPORT_ERRORS_URL', ''),
          method: this._getEnv('ADMIN_APP_CLIENT_REPORT_ERRORS_METHOD', 'POST'),
          key: this._getEnv('ADMIN_APP_CLIENT_REPORT_ERRORS_KEY', ''),
          headers: {},
          sourceMapExtension: this._getEnv('ADMIN_APP_CLIENT_REPORT_ERRORS_SOURCE_MAP_EXTENSION', '.map'),
          customAttributes: {appOwner: 'itis', appName: 'oaf-admin-client'}
        }
      }
    }

    this.icons = {
      client: {
        noInstantiation: true
      }
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
      root: this._getEnv('API_ROOT', 'api'),
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

    this.submissionForm = {
      url: this._getEnv('SUBMISSION_FORM_URL'),
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
    return this.makeAppConfig();
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
    config.host = this.adminApp.host.value;
    config.apiRoot = this.api.root.value;

    config.auth = {
      clientInit: {
        url: this.adminApp.auth.keycloakJsClient.url.value,
        realm: this.adminApp.auth.keycloakJsClient.realm.value,
        clientId: this.adminApp.auth.keycloakJsClient.clientId.value,
      },
      oidcScope: this.adminApp.auth.oidcScope.value,
      silentCheckSsoRedirectUri: this.adminApp.auth.silentCheckSsoRedirectUri.value,
      tokenRefreshRate: this.adminApp.auth.tokenRefreshRate.value,
      loginCheckRefreshRate: this.adminApp.auth.loginCheckRefreshRate.value
    };

    config.logger = {
      logLevel: this.adminApp.clientLogger.logLevel.value,
      logLevels: this.adminApp.clientLogger.logLevels.value,
      disableCallerInfo: this.adminApp.clientLogger.disableCallerInfo.value,
      reportErrors: {
        enabled: this.adminApp.clientLogger.reportErrors.enabled.value,
        url: this.adminApp.clientLogger.reportErrors.url.value,
        method: this.adminApp.clientLogger.reportErrors.method.value,
        key: this.adminApp.clientLogger.reportErrors.key.value,
        headers: this.adminApp.clientLogger.reportErrors.headers.value,
        sourceMapExtension: this.adminApp.clientLogger.reportErrors.sourceMapExtension.value,
        customAttributes: this.adminApp.clientLogger.reportErrors.customAttributes
      }
    };

    config.corkIconConfig = {
      noInstantiation: this.icons.client.noInstantiation
    }

    config.submissionForm = {
      url: this.submissionForm.url.value
    };

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
