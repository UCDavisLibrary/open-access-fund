import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      padding: 1rem;
      margin-bottom: 1rem;
      border-left: 1px solid #ffbf00;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      container-type: inline-size;
    }
    [hidden] {
      display: none !important;
    }
    .article-title {
      display: inline-block;
      font-weight: 700;
      color: var(--ucd-blue-100);
      text-decoration: none;
      margin-bottom: 1rem;
    }
    .article-title:hover {
      text-decoration: underline;
    }
    .badge {
      display: block;
      font-size: .875rem;
      padding: .1rem .5rem;
      background-color: #DBEAF7;
      border-radius: .5rem;
      color:white;
    }
    .badge.status {
      background-color: var(--ucd-blue-40);
      color: var(--ucd-blue-100);
    }
    .badge.submitted {
      background-color: var(--ucd-gold-40);
      color: var(--ucd-blue-100);
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      margin-bottom: 1rem;
    }
    .dot {
      display: block;
      width: .3rem;
      height: .3rem;
      min-width: .3rem;
      min-height: .3rem;
      border-radius: 50%;
      background-color: var(--ucd-blue-60);
    }
    .field {
      margin-bottom: .25rem;
      font-size: .875rem;
    }
    .field .dot {
      display: none;
    }
    .field-first-line {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .author-container {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .field-subsequent-line {
      margin-left: 1.5rem;
    }
    cork-icon.field-prefix {
      color: var(--ucd-blue-100);
    }
    @container (width > 700px) {
      .field .dot {
        display: block;
      }
      .field {
        display: flex;
        gap: .5rem;
        align-items: center;
      }
      .field-subsequent-line {
        margin-left: 0;
      }
    }

  `;

  return [elementStyles];
}

export function render() {
return html`
  <section>
    <div class="badges">
      <div
        class="badge status"
        title="Submission Status"
        ?hidden=${!this.submission?.status?.label}>${this.submission?.status?.label}
      </div>
      <div
        class="badge submitted"
        title="Submission Date"
        ?hidden=${!this.submissionDate}>Submitted: ${this.submissionDate}
      </div>
    </div>
    <a class="article-title">${this.submission.articleTitle || ''}</a>
    <div class='journal-info field' ?hidden=${!this.submission?.articleJournal}>
      <div class='field-first-line'>
        <cork-icon class='field-prefix' icon='fas.book'></cork-icon>
        <div>${this.submission?.articleJournal}</div>
      </div>
      <div class='dot' ?hidden=${!this.submission?.articlePublisher}></div>
      <div class='field-subsequent-line' ?hidden=${!this.submission?.articlePublisher}>${this.submission?.articlePublisher}</div>
    </div>
    <div class='authors field' ?hidden=${!this.submission?.authorFullName}>
      <div class='field-first-line'>
        <cork-icon class='field-prefix' icon='fas.user'></cork-icon>
        <div>${this.submission?.authorFullName}</div>
      </div>
      <div class='dot' ?hidden=${!this.submission?.authorDepartment}></div>
      <div class='field-subsequent-line' ?hidden=${!this.submission?.authorDepartment}>${this.submission?.authorDepartment}</div>
    </div>
  </section>
`;}
