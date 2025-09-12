
import { getLogger, Registry } from '@ucd-lib/cork-app-utils';

/**
 * @description Recaptcha service
 * https://developers.google.com/recaptcha/intro
 * When your page loads (onAppStateUpdate), call init()
 * When you want to execute recaptcha, call execute()
 */
class Recaptcha {

  constructor() {
    this.logger = getLogger('Recaptcha');
    this.loaded = false;
  }

  async init(){
    if ( this.loaded ) return;
    const configModel = Registry.getModel('ConfigModel');
    const config = await configModel.getByCategory('recaptcha');
    if ( config.state !== 'loaded' ) {
      this.logger.error('Error loading recaptcha config');
      return;
    }
    this.config = config.payload;
    if ( this.config.disabled ){
      this.logger.info('Recaptcha is disabled');
      return true;
    }
    try {
      await this.loadScript();
    } catch (e) {
      this.logger.error('Error loading recaptcha script', e);
      return;
    }
    this.loaded = true;
    return this.loaded;
  }

  async loadScript(){
    let script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${this.config.key}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    this.scriptPromise = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });

    return this.scriptPromise;
  }

  async execute(action){
    action = action || this.config.submissionAction || 'submit';
    let token;
    if ( this.config.disabled || !this.config.key ) return token;
    await this.scriptPromise;
    try {
      token = await window.grecaptcha.enterprise.execute(this.config.key, {action});
    } catch(e) {
      this.logger.error('Error executing recaptcha', e);
    }

    return token;
  }

}

export default new Recaptcha();
