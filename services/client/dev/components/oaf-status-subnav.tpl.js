import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    oaf-status-subnav {
      display: block;
    }
    oaf-status-subnav .sub-nav a {
      gap: .5rem;
    }
    oaf-status-subnav .sub-nav__count {
      background-color: var(--ucd-blue);
      border-radius: 50%;
      color: white;
      width: 1.5rem;
      height: 1.5rem;
      min-width: 1.5rem;
      min-height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400;
      font-size: .75rem;
    }
  `;
  return [elementStyles];
}


export function render() {
  return html`
  <nav class="sub-nav">
    <h2 class="sub-nav__title">Submissions by Status</h2>
    <ul class="sub-nav__menu">
      ${this.statuses.map(s => html`
        <li>
          <a href='/?status=${s.name}'>
            <div>${s.label}</div>
            <div class="sub-nav__count" ?hidden=${!s.submissionActive}>${s.count > 100 ? '!' : s.count}</div>
          </a>
        </li>
      `)}
    </ul>
  </nav>
  `;}
