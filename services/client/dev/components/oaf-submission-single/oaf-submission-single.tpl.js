import { html, css } from 'lit';
import './oaf-form-section.js';

import './oaf-comments.js';
import './oaf-status.js';

import * as submissionFields from '../../templates/submissionFields.js';

import { DataDefinitions } from '../../../../lib/utils/DataDefinitions.js';

export function styles() {
  const elementStyles = css`
    oaf-submission-single {
      display: block;
    }
    oaf-submission-single .person-name {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--ucd-blue);
    }
    oaf-submission-single .l-content {
      container-type: inline-size;
    }
    oaf-submission-single .dot {
      display: none;
      width: .3rem;
      height: .3rem;
      min-width: .3rem;
      min-height: .3rem;
      border-radius: 50%;
      background-color: var(--ucd-blue-60);
    }
    oaf-submission-single .dot-container {
      display: block;
    }
    .contact-info {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .contact-info > div {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .contact-info cork-icon {
      --cork-icon-size: 1rem;
      color: var(--ucd-blue-60);
    }
    @container (width >= 400px) {
      oaf-submission-single .dot-container {
        display: flex;
        align-items: center;
        gap: .5rem;
      }
      oaf-submission-single .dot {
        display: block;
      }
    }

  `;

  return [elementStyles];
}

export function render() {
return html`
  <div><h1 class="page-title">${this.displayTitle}</h1></div>
  <ol class="breadcrumbs">
    <li><a href="${this.submissionListUrl}">Submissions</a></li>
    <li>${this.displayTitle}</li>
  </ol>
  <div class="l-container l-basic--flipped">
    <div class="l-sidebar-first">
      <oaf-status></oaf-status>
    </div>
    <div class="l-content">
      ${_renderAuthorInfo.call(this)}
      ${_renderFinancialContactInfo.call(this)}
      ${_renderFinancialAccountInfo.call(this)}
      ${_renderCommentsSection.call(this)}
    </div>
  </div>
`;}

function _renderAuthorInfo() {
  return html`
    <oaf-form-section
      heading-icon="fas.user"
      heading-text="Author Information"
      brand-color='pinot'
      @form-save=${this._onFormSaveClick}
      @form-toggle=${this._onFormSectionToggle}
      >
      <div slot="read-only">
        <div ?hidden=${!this.data?.authorFullName} class='person-name'>${this.data?.authorFullName || ''}</div>
        <div class='dot-container'>
          <div ?hidden=${!this.data?.authorDepartment}>${this.data?.authorDepartment || ''}</div>
          <div class='dot' ?hidden=${!this.data?.authorDepartment || !this.data?.authorAffiliationCombined}></div>
          <div ?hidden=${!this.data?.authorAffiliationCombined}>${DataDefinitions.getLabel('AFFILIATIONS', this.data?.authorAffiliationCombined)}</div>
        </div>
        <div class='contact-info'>
          <div ?hidden=${!this.data?.authorEmail}>
            <cork-icon icon="fas.envelope"></cork-icon>
            <a href="mailto:${this.data?.authorEmail}">${this.data?.authorEmail}</a>
          </div>
          <div ?hidden=${!this.data?.authorPhone}>
            <cork-icon icon="fas.phone"></cork-icon>
            <a href="tel:${this.data?.authorPhone}">${this.data?.authorPhone}</a>
          </div>
        </div>
        <div ?hidden=${!this.data?.otherAuthors} class='u-space-mt'>
          <div class='primary bold'>Other Authors</div>
          <div class='small'>${this.data?.otherAuthors}</div>
        </div>
      </div>
      <div slot="form">
        ${submissionFields.authorInfo.call(this, true)}
      </div>
    </oaf-form-section>
  `;
}

function _renderFinancialContactInfo() {
  return html`
    <oaf-form-section heading-icon="fas.money-bill" heading-text="Financial Contact Information" brand-color='redwood'>
      <div slot="read-only">
        <div ?hidden=${!this.data?.financialContactFullName} class='person-name'>${this.data?.financialContactFullName || ''}</div>
        <div class='contact-info'>
          <div ?hidden=${!this.data?.financialContactEmail}>
            <cork-icon icon="fas.envelope"></cork-icon>
            <a href="mailto:${this.data?.financialContactEmail}">${this.data?.financialContactEmail}</a>
          </div>
          <div ?hidden=${!this.data?.financialContactPhone}>
            <cork-icon icon="fas.phone"></cork-icon>
            <a href="tel:${this.data?.financialContactPhone}">${this.data?.financialContactPhone}</a>
          </div>
        </div>
      </div>
    </oaf-form-section>
  `;
}

function _renderFinancialAccountInfo() {
  return html`
    <oaf-form-section heading-icon="fas.building-columns" heading-text="Financial Account Information" brand-color='redbud'>
      <div slot="read-only">
        <div class='u-space-mb'>
          <div class='primary bold'>Fund Account</div>
          <div>${this.fundAccountString || ''}</div>
        </div>
        <div ?hidden=${!this.data?.requestedAmount} class='u-space-mb'>
          <div class='primary bold'>Requested Amount</div>
          <div>$${this.data?.requestedAmount || ''}</div>
        </div>
        <div ?hidden=${!this.data?.awardAmount} class='u-space-mb'>
          <div class='primary bold'>Award Amount</div>
          <div>$${this.data?.awardAmount || ''}</div>
        </div>
        <div ?hidden=${!this.data?.accountingSystemNumber} class='u-space-mb'>
          <div class='primary bold'>Accounting System Number</div>
          <div>${this.data?.accountingSystemNumber || ''}</div>
        </div>
      </div>
    </oaf-form-section>
  `;
}

function _renderCommentsSection(){
  return html`
    <oaf-form-section heading-icon='fas.comments' heading-text='Comments' brand-color='putah-creek' disable-form-view>
      <div slot="read-only">
        <oaf-comments submission-id=${this.submissionId}></oaf-comments>
      </div>
    </oaf-form-section>
  `;
}


