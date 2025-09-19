import { html, css } from 'lit';
import './oaf-form-section.js';

export function styles() {
  const elementStyles = css`
    oaf-submission-single {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <div><h1 class="page-title">${this.submissionId}</h1></div>
    <ol class="breadcrumbs">
      <li><a href="${this.submissionListUrl}">Submissions</a></li>
      <li>${this.submissionId}</li>
    </ol>
    <div class="l-container l-basic--flipped">
      <div class="l-content">
        <oaf-form-section heading-icon="fas.user" heading-text="Author Information"></oaf-form-section>
      </div>
      <div class="l-sidebar-second">
        <p>sidebar</p>
      </div>
    </div>

`;}
