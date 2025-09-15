import { html, css } from 'lit';
import { when } from 'lit/directives/when.js';

import config from '../../../lib/utils/config.js';

export function styles() {
  const elementStyles = css`
    oaf-admin-app {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() {
  return html`
    ${renderHeader.call(this)}
    <cork-app-error></cork-app-error>
    <cork-app-loader></cork-app-loader>
    <main>
      <ucdlib-pages
        selected=${this.page}
        attr-for-selected='page-id'>
        ${renderSubmissionsQueryPage.call(this)}
      </ucdlib-pages>
    </main>

  `;
}

function renderSubmissionsQueryPage(){
  return html`
    <div page-id='home'>
      <div><h1 class="page-title">Submissions</h1></div>
      <ol class="breadcrumbs"><li>Submissions</li></ol>
      <div class="l-container l-basic--flipped">
        <div class="l-content">hello world</div>
        <div class="l-sidebar-second"></div>
      </div>
    </div>
  `;
}


function renderHeader(){
  return html`
    <ucd-theme-header>
      <ucdlib-branding-bar
        site-name="UC Davis Library"
        slogan="Open Access Fund Administration">
        <a href='/logout'>Logout</a>
      </ucdlib-branding-bar>
      <ucd-theme-primary-nav>
        <a href='/'>Submissions</a>
        ${when(config.appConfig?.submissionForm?.url, () => html`
          <a href='${config.appConfig.submissionForm.url.value}'>Submission Form</a>
        `)}
      </ucd-theme-primary-nav>
    </ucd-theme-header>
  `;
}
