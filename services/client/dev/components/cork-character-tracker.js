import { LitElement } from 'lit';
import {render, styles} from "./cork-character-tracker.tpl.js";

export default class CorkCharacterTracker extends LitElement {

  static get properties() {
    return {
      characterCount: { type: Number, attribute: 'character-count' },
      maxCharacters: { type: Number, attribute: 'max-characters' },
      exactMatch: { type: Boolean, attribute: 'exact-match' },
      warningThreshold: { type: Number, attribute: 'warning-threshold' },
      showIfEmpty: { type: Boolean, attribute: 'show-if-empty' },
      pastWarningThreshold: {state: true},
      overLimit: {state: true},
      isExactMatch: {state: true}
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.characterCount = 0;
    this.maxCharacters = null;
    this.exactMatch = false;
    this.warningThreshold = null;
    this.showIfEmpty = false;
    this._resetState();
  }

  willUpdate(props){
    if ( props.has('characterCount') && !this.characterCount ){
      this.characterCount = 0;
    }
    const watchedProps = ['characterCount', 'maxCharacters', 'exactMatch', 'warningThreshold'];
    if ( watchedProps.some( p => props.has(p) ) ){
      this._resetState();
      if ( !this.maxCharacters ) {
        return;
      }
      if ( this.warningThreshold ) {
        this.pastWarningThreshold = this.characterCount >= (this.maxCharacters * (this.warningThreshold / 100));
      }
      this.overLimit = this.characterCount > this.maxCharacters;

      if ( this.exactMatch ) {
        this.isExactMatch = this.characterCount === this.maxCharacters;
      }
    }
  }

  _resetState(){
    this.pastWarningThreshold = false;
    this.overLimit = false;
    this.isExactMatch = false;
  }

}

customElements.define('cork-character-tracker', CorkCharacterTracker);
