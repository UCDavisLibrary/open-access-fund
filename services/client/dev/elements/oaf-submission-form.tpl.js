import { html, css } from 'lit';
import { when } from 'lit/directives/when.js';

// styles from ucdlib theme
import normalizeStyles from "@ucd-lib/theme-sass/normalize.css.js";
import formStyles from "@ucd-lib/theme-sass/1_base_html/_forms.css.js";
import listStyles from "@ucd-lib/theme-sass/2_base_class/_lists.css.js";
import formClassStyles from "@ucd-lib/theme-sass/2_base_class/_forms.css.js";
import buttonStyles from "@ucd-lib/theme-sass/2_base_class/_buttons.css.js";

import { DataDefinitions } from '../../../lib/utils/DataDefinitions.js';
import fundAccountUtils from '../../../lib/utils/fundAccountUtils.js';
import IdGenerator from '../utils/IdGenerator.js';

import '../components/cork-character-tracker.js';

const idGen = new IdGenerator();

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      font-family: "proxima-nova", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 1rem;
      line-height: 1.618;
    }
    [hidden]{
      display: none !important;
    }
    input, select, textarea {
      box-sizing: border-box;
    }
    .list--reset {
      margin: 0;
      padding: 0 0 0 1.25rem;
      padding-left: 0;
      list-style: none;
    }
    .list--reset li {
      list-style: none;
    }
    .container {
      container-type: inline-size;
    }
    fieldset.fieldset--group {
      border: unset;
      padding: 0;
      margin: 0 0 1rem;
    }
    fieldset.fieldset--group > legend {
      display: block;
      padding: 0 0 .25rem;
      color: rgb(2, 40, 81);
      font-weight: 700;
      font-size: 1rem;
    }
    .fund-parts {
      margin-top: 1.5rem;
    }
    .fund-parts .field-container {
      margin-left: 1rem;
    }

    @container (width > 600px) {
      .flex-fields {
        display: flex;
        gap: 1rem;
      }
      .flex-field-grow {
        flex-grow: 1;
      }
      .flex-field-small {
        width: 75px;
      }
    }

    .submitting-text {
      display: none;
    }
    .submitting .submit-text {
      display: none;
    }
    .submitting .submitting-text {
      display: inline;
    }

  `;

  return [
    normalizeStyles,
    formStyles,
    listStyles,
    buttonStyles,
    formClassStyles,
    elementStyles
  ];
}

export function render() {
  return html`
    <div class='container ${this._submitting ? 'submitting' : ''}'>
      <form @submit=${this._onSubmit} novalidate>
        <div>Fields marked with * are required</div>
        ${_renderAuthorInfo.call(this)}
        ${_renderFinancialContactInfo.call(this)}
        ${_renderFinanceAccountInfo.call(this)}
        ${_renderArticleInfo.call(this)}
        <div class='field-container'>
          <label for=${idGen.get('authorComment')}>Additional Comments</label>
          <textarea
            id=${idGen.get('authorComment')}
            rows='4'
            .value=${this.payload.authorComment || ''}
            @input=${e => this._onInput('authorComment', e.target.value)}></textarea>
        </div>
        <button type='submit' class='btn btn--primary' ?disabled=${this._submitting}>
          <span class='submit-text'>Submit</span>
          <span class='submitting-text'>Submitting...</span>
        </button>
      </form>
    </div>
  `;
}

function _renderAuthorInfo(){
  return html`
    <fieldset>
      <legend>Author Information</legend>
      <div class='flex-fields'>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('authorFirstName')}'>First Name <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorFirstName')}'
            required
            type='text'
            .value=${this.payload.authorFirstName || ''}
            @input=${e => this._onInput('authorFirstName', e.target.value)}>
        </div>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('authorLastName')}'>Last Name <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorLastName')}'
            required
            type='text'
            .value=${this.payload.authorLastName || ''}
            @input=${e => this._onInput('authorLastName', e.target.value)}>
        </div>
        <div class='field-container flex-field-small'>
          <label for='${idGen.get('authorMiddleInitial')}'>M.I.</label>
          <input
            id='${idGen.get('authorMiddleInitial')}'
            type='text'
            .value=${this.payload.authorMiddleInitial || ''}
            @input=${e => this._onInput('authorMiddleInitial', e.target.value)}>
        </div>
      </div>
      <fieldset class='fieldset--group radio'>
        <legend>UC Davis Affiliation <span class='required'>*</span></legend>
        <ul class="list--reset">
          ${DataDefinitions.AFFILIATIONS.map(affiliation => html`
            <li>
              <input
                type='radio'
                id='${idGen.get('authorAffiliation-' + affiliation.value)}'
                name=${idGen.get('authorAffiliation')}
                required
                .checked=${this.payload.authorAffiliation === affiliation.value}
                @change=${e => this._onInput('authorAffiliation', affiliation.value)}>
              <label for='${idGen.get('authorAffiliation-' + affiliation.value)}'>${affiliation.label}</label>
            </li>
          `)}
        </ul>
      </fieldset>
      <div class='field-container' ?hidden=${this.payload.authorAffiliation !== 'other'}>
        <label for='${idGen.get('authorAffiliationOther')}'>Please describe affiliation <span class='required'>*</span></label>
        <input
          id='${idGen.get('authorAffiliationOther')}'
          type='text'
          required
          .value=${this.payload.authorAffiliationOther || ''}
          @input=${e => this._onInput('authorAffiliationOther', e.target.value)}>
      </div>
      <div class='flex-fields'>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('authorEmail')}'>Email <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorEmail')}'
            type='email'
            required
            .value=${this.payload.authorEmail || ''}
            @input=${e => this._onInput('authorEmail', e.target.value)}>
        </div>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('authorPhone')}'>Phone <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorPhone')}'
            type='tel'
            required
            .value=${this.payload.authorPhone || ''}
            @input=${e => this._onInput('authorPhone', e.target.value)}>
        </div>
      </div>

      <div class='field-container'>
        <label for=${idGen.get('authorDepartment')}>UC Davis Department <span class='required'>*</span></label>
        <input
          id='${idGen.get('authorDepartment')}'
          type='text'
          required
          .value=${this.payload.authorDepartment || ''}
          @input=${e => this._onInput('authorDepartment', e.target.value)}>
      </div>
      <div class='field-container'>
        <label for=${idGen.get('otherAuthors')}>Other Author(s)</label>
        <textarea
          id='${idGen.get('otherAuthors')}'
          rows='4'
          .value=${this.payload.otherAuthors || ''}
          @input=${e => this._onInput('otherAuthors', e.target.value)}></textarea>
      </div>
    </fieldset>
  `;
}

function _renderFinancialContactInfo(){
  return html`
    <fieldset>
      <legend>Financial Contact Information</legend>
      <div class='flex-fields'>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('financialContactFirstName')}'>First Name <span class='required'>*</span></label>
          <input
            id='${idGen.get('financialContactFirstName')}'
            required
            type='text'
            .value=${this.payload.financialContactFirstName || ''}
            @input=${e => this._onInput('financialContactFirstName', e.target.value)}>
        </div>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('financialContactLastName')}'>Last Name <span class='required'>*</span></label>
          <input
            id='${idGen.get('financialContactLastName')}'
            required
            type='text'
            .value=${this.payload.financialContactLastName || ''}
            @input=${e => this._onInput('financialContactLastName', e.target.value)}>
        </div>
      </div>
      <div class='flex-fields'>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('financialContactEmail')}'>Email <span class='required'>*</span></label>
          <input
            id='${idGen.get('financialContactEmail')}'
            required
            type='email'
            .value=${this.payload.financialContactEmail || ''}
            @input=${e => this._onInput('financialContactEmail', e.target.value)}>
        </div>
        <div class='field-container flex-field-grow'>
          <label for='${idGen.get('financialContactPhone')}'>Phone <span class='required'>*</span></label>
          <input
            id='${idGen.get('financialContactPhone')}'
            required
            type='tel'
            .value=${this.payload.financialContactPhone || ''}
            @input=${e => this._onInput('financialContactPhone', e.target.value)}>
        </div>
      </div>
    </fieldset>
  `;
}

function _renderFinanceAccountInfo(){
  return html`
    <fieldset>
      <legend>Financial Account Information</legend>
      <fieldset class='fieldset--group radio'>
        <legend>Accounting String Type <span class='required'>*</span></legend>
        <ul class="list--reset">
          ${fundAccountUtils.registry.map(account => html`
            <li>
              <input
                type='radio'
                id='${idGen.get('fundAccount-' + account.value)}'
                name=${idGen.get('fundAccount')}
                required
                .checked=${this.payload.fundAccount?.fundType === account.value}
                @change=${() => this._onInput('fundAccount', account)}>
              <label for='${idGen.get('fundAccount-' + account.value)}'>${account.label}</label>
            </li>
          `)}
        </ul>
      </fieldset>
      <fieldset ?hidden=${!this.selectedFundType} class='fieldset--group fund-parts'>
        <legend>${this.selectedFundType?.label}</legend>
        ${this.selectedFundType?.components?.map( fundComponent => html`
          <div class='field-container'>
            <label for=${idGen.get(`${this.selectedFundType.value}-${fundComponent.value}`)}>${fundComponent.label} <span class='required' ?hidden=${!fundComponent.required}>*</span></label>
            <input
              id=${idGen.get(`${this.selectedFundType.value}-${fundComponent.value}`)}
              .value=${this.payload.fundAccount?.parts?.[fundComponent.value] || ''}
              @input=${e => this._onFundPartInput(fundComponent.value, e.target.value)}>
            ${when(fundComponent.length, () => html`
              <cork-character-tracker
                character-count=${this.payload.fundAccount?.parts?.[fundComponent.value]?.length}
                max-characters=${fundComponent.length}
                exact-match
                show-if-empty
              ></cork-character-tracker>
            `)}
          </div>
          `)}
      </fieldset>
      <div class='field-container'>
        <label for=${idGen.get('requestedAmount')}>Requested Amount <span class='required'>*</span></label>
        <input
          id=${idGen.get('requestedAmount')}
          .value=${this.payload.requestedAmount || ''}
          required
          inputmode='decimal'
          @input=${e => this._onInput('requestedAmount', e.target.value)}>
        <div>Max amount: $1000</div>
      </div>
    </fieldset>
  `;
}

function _renderArticleInfo(){
  return html`
    <fieldset>
      <legend>Article Information</legend>
      <div class='field-container'>
        <label for=${idGen.get('articleTitle')}>Article Title <span class='required'>*</span></label>
        <input
          id=${idGen.get('articleTitle')}
          type='text'
          required
          .value=${this.payload.articleTitle || ''}
          @input=${e => this._onInput('articleTitle', e.target.value)}>
      </div>
      <div class='field-container'>
        <label for=${idGen.get('articleJournal')}>Journal Name <span class='required'>*</span></label>
        <input
          id=${idGen.get('articleJournal')}
          type='text'
          required
          .value=${this.payload.articleJournal || ''}
          @input=${e => this._onInput('articleJournal', e.target.value)}>
      </div>
      <div class='field-container'>
        <label for=${idGen.get('articlePublisher')}>Publisher</label>
        <input
          id=${idGen.get('articlePublisher')}
          type='text'
          .value=${this.payload.articlePublisher || ''}
          @input=${e => this._onInput('articlePublisher', e.target.value)}>
      </div>
      <fieldset class='fieldset--group radio'>
        <legend>Publication Status <span class='required'>*</span></legend>
        <ul class="list--reset">
          ${DataDefinitions.ARTICLE_STATUSES.map(status => html`
            <li>
              <input
                type='radio'
                id='${idGen.get('articleStatus-' + status.value)}'
                name=${idGen.get('articleStatus')}
                required
                .checked=${this.payload.articleStatus === status.value}
                @change=${e => this._onInput('articleStatus', status.value)}>
              <label for='${idGen.get('articleStatus-' + status.value)}'>${status.label}</label>
            </li>
          `)}
        </ul>
      </fieldset>
      <div class='field-container'>
        <label for=${idGen.get('articleLink')}>URL for Article</label>
        <input
          id=${idGen.get('articleLink')}
          type='text'
          .value=${this.payload.articleLink || ''}
          @input=${e => this._onInput('articleLink', e.target.value)}>
      </div>
    </fieldset>
  `;
}
