import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import IdGenerator from '../utils/IdGenerator.js';
import { DataDefinitions } from '../../../lib/utils/DataDefinitions.js';

const idGen = new IdGenerator();

/**
 * @description Renders the author information fieldset section of the form
 * @returns {TemplateResult}
 */
export function authorInfo(hideLegend){

  const legendText = 'Author Information';
  return html`
    <fieldset aria-label=${ifDefined(hideLegend ? legendText : undefined)} class='${hideLegend ? 'no-legend' : ''}'>
      <legend ?hidden=${hideLegend}>${legendText}</legend>
      <div class='flex-fields'>
        <cork-field-container schema='submission' path='authorFirstName' class='field-container flex-field-grow'>
          <label for='${idGen.get('authorFirstName')}'>First Name <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorFirstName')}'
            required
            type='text'
            .value=${this.payload.authorFirstName || ''}
            @input=${e => this._onInput('authorFirstName', e.target.value)}>
        </cork-field-container>
        <cork-field-container schema='submission' path='authorLastName' class='field-container flex-field-grow'>
          <label for='${idGen.get('authorLastName')}'>Last Name <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorLastName')}'
            required
            type='text'
            .value=${this.payload.authorLastName || ''}
            @input=${e => this._onInput('authorLastName', e.target.value)}>
        </cork-field-container>
        <cork-field-container schema='submission' path='authorMiddleInitial' class='field-container flex-field-small'>
          <label for='${idGen.get('authorMiddleInitial')}'>M.I.</label>
          <input
            id='${idGen.get('authorMiddleInitial')}'
            type='text'
            .value=${this.payload.authorMiddleInitial || ''}
            @input=${e => this._onInput('authorMiddleInitial', e.target.value)}>
        </cork-field-container>
      </div>
      <cork-field-container schema='submission' path='authorAffiliation' class='field-container'>
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
      </cork-field-container>
      <cork-field-container schema='submission' path='authorAffiliationOther' class='field-container' ?hidden=${this.payload.authorAffiliation !== 'other'}>
        <label for='${idGen.get('authorAffiliationOther')}'>Please describe affiliation <span class='required'>*</span></label>
        <input
          id='${idGen.get('authorAffiliationOther')}'
          type='text'
          required
          .value=${this.payload.authorAffiliationOther || ''}
          @input=${e => this._onInput('authorAffiliationOther', e.target.value)}>
      </cork-field-container>
      <div class='flex-fields'>
        <cork-field-container schema='submission' path='authorEmail' class='field-container flex-field-grow'>
          <label for='${idGen.get('authorEmail')}'>Email <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorEmail')}'
            type='email'
            required
            .value=${this.payload.authorEmail || ''}
            @input=${e => this._onInput('authorEmail', e.target.value)}>
        </cork-field-container>
        <cork-field-container schema='submission' path='authorPhone' class='field-container flex-field-grow'>
          <label for='${idGen.get('authorPhone')}'>Phone <span class='required'>*</span></label>
          <input
            id='${idGen.get('authorPhone')}'
            type='tel'
            required
            .value=${this.payload.authorPhone || ''}
            @input=${e => this._onInput('authorPhone', e.target.value)}>
        </cork-field-container>
      </div>

      <cork-field-container schema='submission' path='authorDepartment' class='field-container'>
        <label for=${idGen.get('authorDepartment')}>UC Davis Department <span class='required'>*</span></label>
        <input
          id='${idGen.get('authorDepartment')}'
          type='text'
          required
          .value=${this.payload.authorDepartment || ''}
          @input=${e => this._onInput('authorDepartment', e.target.value)}>
      </cork-field-container>
      <cork-field-container schema='submission' path='otherAuthors' class='field-container'>
        <label for=${idGen.get('otherAuthors')}>Other Author(s)</label>
        <textarea
          id='${idGen.get('otherAuthors')}'
          rows='4'
          .value=${this.payload.otherAuthors || ''}
          @input=${e => this._onInput('otherAuthors', e.target.value)}></textarea>
      </cork-field-container>
    </fieldset>
  `;
}
