import { html, css } from 'lit';
import { when } from 'lit/directives/when.js';

import buttonStyles from '@ucd-lib/theme-sass/2_base_class/_buttons.css.js';
import panelStyles from '@ucd-lib/theme-sass/4_component/_panel.css.js';


export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      border-bottom: 2px dotted var(--ucd-gold);
      margin-bottom: 2rem;
      container-type: inline-size;
    }
    [hidden] {
      display: none !important;
    }
    .heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      gap: 1rem;
    }
    .heading-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .heading-text {
      margin: 0;
    }
    .heading-left cork-icon {
      --cork-icon-size: 2rem;
    }
    button {
      box-sizing: border-box;
      font-size: 1rem;
    }
    .content {
      padding: 0 1rem 2rem 1rem;
    }
    @container (width < 350px) {
      .heading-left cork-icon {
        display: none;
      }
    }
  `;

  return [
    buttonStyles,
    panelStyles,
    elementStyles
  ];
}

export function render() {
  return html`
    ${when(this._brandColorObj, () => html`
      <style>
        .heading-left cork-icon {
          color: ${this._brandColorObj.hex};
        }
      </style>
    `)}
    <div class='heading'>
      <div class='heading-left'>
        <cork-icon icon="${this.headingIcon}"></cork-icon>
        <div class='panel__title heading-text'>${this.headingText}</div>
      </div>
      <cork-icon-button
        @click=${this._onEditClick}
        title=${this.showForm ? 'Cancel Edit' : 'Edit Data'}
        ?hidden=${!this.AuthModel.userHasWriteAccess || this.disableFormView}
        icon='${this.showForm ? "fas.xmark" : "fas.pen-to-square"}'>
      </cork-icon-button>
    </div>
    <div class='content'>
      <div ?hidden=${!this.showForm}>
        <slot name="form"></slot>
        <button class="btn btn--primary" @click=${this._onSaveClick}>Save</button>
      </div>
      <div ?hidden=${this.showForm}>
        <slot name="read-only"></slot>
      </div>
    </div>

  `;}
