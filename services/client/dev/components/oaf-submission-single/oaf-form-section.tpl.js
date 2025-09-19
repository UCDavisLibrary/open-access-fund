import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
    .heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .heading-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `;

  return [elementStyles];
}

export function render() {
  return html`
  <div class='heading'>
    <div class='heading-left'>
      <cork-icon icon="${this.headingIcon}"></cork-icon>
      <div class='heading-text'>${this.headingText}</div>
    </div>
    <cork-icon-button icon='fas.pen-to-square'></cork-icon-button>
  </div>


  `;}
