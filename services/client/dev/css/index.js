// all global styles should be imported here
import sharedStyles from '@ucd-lib/theme-sass/style-ucdlib.css';
import brandCssProps from '@ucd-lib/theme-sass/css-properties.css';
import fonts from './fonts.css';

// mainDomElement styles from lit elements
// if done in the element itself, it creates a style tag for each instance
import { styles as oafStatusSubnavStyles } from '../components/oaf-status-subnav.tpl.js';

function getLitStyles(styles){
  return styles().map(s => s.cssText).join('\n');
}

const styles = `
  [hidden] {
    display: none !important;
  }
  ${sharedStyles}
  ${brandCssProps}
  ${fonts}
  ${getLitStyles(oafStatusSubnavStyles)}
`;

let sharedStyleElement = document.createElement('style');
sharedStyleElement.innerHTML = styles;
document.head.appendChild(sharedStyleElement);
