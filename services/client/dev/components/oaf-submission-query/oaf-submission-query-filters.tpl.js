import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    oaf-submission-query-filters {
      display: block;
      container-type: inline-size;
      container-name: submission-filters;
    }
    oaf-submission-query-filters .field-container {
      margin-bottom: 1rem;
    }
    @container submission-filters (width > 600px) {
      oaf-submission-query-filters .filter-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    }

  `;

  return [elementStyles];
}

export function render() {
return html`
  <form @submit=${this._onSubmit}>
    <div class='filter-row'>
      <div class='field-container'>
        <label>Status</label>
        <ucd-theme-slim-select @change=${e => this._onFilterUpdate('status', e.detail.map(d => d.value))}>
          <select multiple>
            ${this.statusOptions.map(d => html`
              <option value=${d.name} ?selected=${this.qsCtl.query.status.includes(d.name)}>${d.label}</option>`
            )}
          </select>
        </ucd-theme-slim-select>
      </div>
      <div class='field-container'>
        <label>Keyword Search</label>
        <input type='text' @input=${e => this._onFilterUpdate('keyword', e.target.value)} .value=${this.qsCtl.query.keyword || ''} />
      </div>
    </div>
    <div class='filter-row'>
      <div class='field-container'>
        <label>Submitted After</label>
        <input type='date' @input=${e => this._onFilterUpdate('submittedAfter', e.target.value)} .value=${this.qsCtl.query.submittedAfter || ''} />
      </div>
      <div class='field-container'>
        <label>Submitted Before</label>
        <input type='date' @input=${e => this._onFilterUpdate('submittedBefore', e.target.value)} .value=${this.qsCtl.query.submittedBefore || ''} />
      </div>

    </div>
  </form>
`;}
