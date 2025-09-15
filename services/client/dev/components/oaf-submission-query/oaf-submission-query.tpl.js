import { html, css } from 'lit';
import './oaf-submission-query-filters.js';

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
`;}
