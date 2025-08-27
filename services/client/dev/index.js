// code split between our two primary entrypoints: the submission form and the admin app
// the submission form is meant to be embedded in third party pages, such as the main library website
class DynamicScriptLoader {

  constructor() {
    this.loaded = {};
    this.registration = [
      {
        name: 'submission-form',
        cssQuery: [
          'oaf-submission-form'
        ]
      },
      {
        name: 'admin-app',
        cssQuery: ['oaf-admin-app']
      }
    ];
  }


  async load() {
    for( let bundle of this.registration ) {
      if( bundle.cssQuery ) {
        if ( !Array.isArray(bundle.cssQuery) ){
          bundle.cssQuery = [bundle.cssQuery];
        }
        for (const q of bundle.cssQuery) {
          if ( document.querySelector(q) ){
            this.loadWidgetBundle(bundle.name);
          }
        }
      }
    }
  }

  loadWidgetBundle(bundleName) {
    if( typeof bundleName !== 'string' ) return;
    if( this.loaded[bundleName] ) return this.loaded[bundleName];

    if ( bundleName == 'submission-form' ){
      this.loaded[bundleName] = import(/* webpackChunkName: "submission-form" */ './elements/oaf-submission-form.js');
    } else if ( bundleName == 'admin-app' ) {
      this.loaded[bundleName] = import(/* webpackChunkName: "admin-app" */ './elements/oaf-admin-app.js');
    }

    return this.loaded[bundleName]
  }

}

let loaderInstance = new DynamicScriptLoader();
if( document.readyState === 'complete' ) {
  loaderInstance.load();
} else {
  window.addEventListener('load', () => {
    loaderInstance.load();
  });
}
