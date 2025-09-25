import { html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import IdGenerator from '../../utils/IdGenerator.js';

import { live } from 'lit/directives/live.js';

const idGen = new IdGenerator();

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      container-type: inline-size;
      margin-bottom: 1rem;
    }
    .container {
      padding: 1rem;
      background-color: #c6007e2e;
    }
    .container.is-active {
      background-color: var(--ucd-gold-40);
    }
    .container.is-successful {
      background-color: #aada9178;
    }
    .title {
      font-style: normal;
      font-weight: 800;
      line-height: 1.2;
      font-size: 1.2rem;
      color: var(--ucd-blue);
      margin-bottom: .5rem;
    }
    .status-container {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-bottom: 1rem;
    }
    .status-container .status-label {
      font-size: 1rem;
      color: var(--ucd-blue);
    }
    .status-container cork-icon {
      color: var(--ucd-gold);
      --cork-icon-size: .75rem;
    }
  `;

  return [
    elementStyles,
  ]
}

export function render() {
  const status = this.submission?.status;
  const containerClasses = {
    container: true,
    'is-active': status?.submissionActive,
    'is-successful': status?.submissionSuccessful
  }
  return html`
    <div class=${classMap(containerClasses)}>
      <div class='title'>Submission Status</div>
      <div class='status-container'>
        <cork-icon icon='fas.chevron-right'></cork-icon>
        <div class='status-label'>${status?.label || 'Unknown'}</div>
      </div>
      <cork-prefixed-icon-button @click=${this._onUpdateClick} icon='fas.pen-to-square' color='dark'>Update</cork-prefixed-icon-button>
    </div>
  `;
}

export function renderUpdateForm(){
  return html`
  <form @submit=${this._onFormSubmit} novalidate>
    <cork-field-container schema='status' path='status' class='field-container'>
      <label for=${idGen.get('status')}>Status</label>
      <select id=${idGen.get('status')} .value=${live(this.payload.status || '')} @input=${e => this._onPayloadInput('status', e.target.value)} required>
        ${this.statusOptions?.map(s => html`
          <option value=${s.name}>${s.label}</option>
        `)}
      </select>
    </cork-field-container>
    <div class='field-container checkbox' ?hidden=${!['completed', 'accounting'].includes(this.payload.status)}>
      <input id=${idGen.get('disable-email')} name=${idGen.get('disable-email')} type="checkbox" .checked=${this.payload.disableEmail} @input=${() => this._onPayloadInput('disableEmail', !this.payload.disableEmail)}><label for=${idGen.get('disable-email')}>Do not send any email notifications</label>
    </div>
    <cork-field-container schema='status' path='comment' class='field-container'>
      <label for=${idGen.get('comment')}>Comment (optional)</label>
      <textarea id=${idGen.get('comment')} .value=${this.payload.comment || ''} @input=${e => this._onPayloadInput('comment', e.target.value)} rows="4" ></textarea>
    </cork-field-container>
    <div ?hidden=${!['completed', 'accounting'].includes(this.payload.status)}>
      <cork-field-container schema='status' path='awardAmount' class='field-container'>
        <label for=${idGen.get('awardAmount')}>Award Amount</label>
        <input
          id=${idGen.get('awardAmount')}
          .value=${this.payload.awardAmount || ''}
          inputmode='decimal'
          @input=${e => this._onPayloadInput('awardAmount', e.target.value)}>
      </cork-field-container>
    </div>
    <div ?hidden=${this.payload.status !== 'completed'}>
      <cork-field-container schema='status' path='accountingSystemNumber' class='field-container'>
        <label for=${idGen.get('accountingSystemNumber')}>Accounting System Number</label>
        <input
          id=${idGen.get('accountingSystemNumber')}
          .value=${this.payload.accountingSystemNumber || ''}
          @input=${e => this._onPayloadInput('accountingSystemNumber', e.target.value)}>
      </cork-field-container>
    </div>
  </form>
  `;
}
