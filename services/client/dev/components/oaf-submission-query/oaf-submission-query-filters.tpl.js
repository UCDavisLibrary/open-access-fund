import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    oaf-submission-query-filters {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <p>query filters</p>

`;}
