import { css } from 'lit';

export default function styles() {
  const styles = css`
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
    fieldset.fieldset--group {
      border: unset;
      padding: 0;
      margin: 0;
    }
    .fieldset--group > legend {
      display: block;
      padding: 0 0 .25rem;
      color: rgb(2, 40, 81);
      font-weight: 700;
      font-size: 1rem;
    }
    fieldset.no-legend {
      border-top: 0px;
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

  `;
  return [
    styles
  ];
}
