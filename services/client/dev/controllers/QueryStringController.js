import { Registry } from '@ucd-lib/cork-app-utils';
import AppComponentController from './AppComponentController.js';

export default class QueryStringController {

  constructor(host, opts={}){
    this.types = opts.types || {};
    this.host = host;
    host.addController(this);
    this.AppStateModel = Registry.getModel('AppStateModel');
    this.appComponentController = new AppComponentController(host);
    this.query = {};
  }

  setParam(key, value){
    this.query[key] = value;
    this.host.requestUpdate();
  }

  deleteParam(key){
    delete this.query[key];
    this.host.requestUpdate();
  }

  setLocation(){
    let q = new URLSearchParams();
    for ( const key of Object.keys(this.query) ) {
      if ( this.types[key] === 'array' ) {
        if ( Array.isArray(this.query[key]) && this.query[key].length ) {
          q.append(key, this.query[key].join(','));
        }
      } else if ( this.types[key] === 'boolean' ) {
        if ( this.query[key] ) q.append(key, 'true');
      } else {
        if ( this.query[key] ) q.append(key, this.query[key]);
      }
    }
    const qs = q.toString();
    this.AppStateModel.setLocation(`${this.AppStateModel.store.data.location.pathname}${qs ? '?'+qs : ''}`);
  }


  resetQuery(){
    const q = {};
    for ( const key of Object.keys(this.types) ) {
      if ( this.types[key] === 'array' ) {
        q[key] = [];
      } else if ( this.types[key] === 'boolean' ) {
        q[key] = false;
      } else {
        q[key] = '';
      }
    }
    this.query = q;
  }

  _onAppStateUpdate(e) {
    if ( !this.appComponentController.isOnActivePage ) return;
    const q = JSON.parse(JSON.stringify(e.location?.query || {}));
    this.resetQuery();
    for ( const key of Object.keys(q) ) {
      if ( this.types[key] === 'array' ) {
        this.query[key] = q[key] ? q[key].split(',') : [];
      } else if ( this.types[key] === 'boolean' ) {
        this.query[key] = q[key] === 'false' ? false : true;
      } else {
        this.query[key] = q[key];
      }
    }
    this.host.requestUpdate();
  }

  hostConnected() {
    this.AppStateModel.EventBus.on('app-state-update', this._onAppStateUpdate.bind(this));
  }

  hostDisconnected() {
    this.AppStateModel.EventBus.off('app-state-update', this._onAppStateUpdate.bind(this));
  }
}
