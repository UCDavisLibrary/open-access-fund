import { html, css } from 'lit';
import './oaf-submission-query-filters.js';
import './oaf-submission-teaser.js';

export function styles() {
  const elementStyles = css`
    oaf-submission-query {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <oaf-submission-query-filters></oaf-submission-query-filters>
  <div ?hidden=${!this.results.length}>
    ${this.results.map(d => html`<oaf-submission-teaser .submission=${d}></oaf-submission-teaser>`)}
  </div>
  <ucd-theme-pagination
    current-page=${this.page}
    max-pages=${this.totalPages}
    ellipses
    xs-screen
    @page-change=${this._onPageChange}
  ></ucd-theme-pagination>
`;}
