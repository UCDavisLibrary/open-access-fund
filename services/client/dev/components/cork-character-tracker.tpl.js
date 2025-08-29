import { html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
    [hidden] {
      display: none !important;
    }
    .exact-match--true {
      color: var(--cork-character-tracker-exact-match-color, #3DAE2B);
    }
    .has-characters.exact-match--false {
      color: var(--cork-character-tracker-exact-not-match-color, #C10230);
    }
    .over-warning-threshold {
      color: var(--cork-character-tracker-warning-threshold-color, #F18A00);
    }
    .over-limit {
      color: var(--cork-character-tracker-over-limit-color, #C10230);
    }
  `;

  return [elementStyles];
}

export function render() {
  if ( !this.showIfEmpty && !this.characterCount ) {
    return html``;
  }
  let classes = {
    'has-characters': this.characterCount,
    'no-characters': !this.characterCount
  };
  if ( this.exactMatch ) {
    classes['exact-match'] = true;
    classes['exact-match--true'] = this.isExactMatch;
    classes['exact-match--false'] = !this.isExactMatch;
  } else {
    classes['over-limit'] = this.overLimit;
    classes['over-warning-threshold'] = this.pastWarningThreshold;
  }
  return html`
    <div class=${classMap(classes)}>
      <div class='message' ?hidden=${!this.exactMatch}>Must be ${this.maxCharacters} characters (current: ${this.characterCount})</div>
      <div class='message' ?hidden=${this.exactMatch}>
        <span>${this.characterCount} / ${this.maxCharacters} characters</span>
        <span ?hidden=${!this.overLimit}> (Over Limit)</span>
      </div>
    </div>
  `;
}
