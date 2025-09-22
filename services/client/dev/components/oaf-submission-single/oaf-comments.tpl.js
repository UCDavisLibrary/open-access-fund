import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      container-type: inline-size;
    }
    .dot {
      display: none;
      width: .3rem;
      height: .3rem;
      min-width: .3rem;
      min-height: .3rem;
      border-radius: 50%;
      background-color: var(--ucd-blue-60);
    }
    .comment {
      margin-bottom: 1.5rem;
    }
    .comment-text {
      margin-bottom: .5rem;
      border-left: 4px solid var(--ucd-blue-60);
      padding-left: 1rem;
    }
    .comment-meta {
      font-size: .875rem;
      color: var(--gray);
      display: block;
    }
    .edit-button {
      background: none;
      border: none;
      color: var(--ucd-blue);
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
      font-size: .875rem;
    }
    .edit-button:hover {
      color: var(--putah-creek);
    }
    @container (width >= 500px) {
      .comment-meta {
        display: flex;
        align-items: center;
        gap: .5rem;
      }
      .dot {
        display: block;
      }
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <div>
    ${this.submission?.userComments?.map(comment => _renderComment.call(this, comment))}
  </div>
`;}

function _renderComment(comment){
  let author = comment?.user?.fullName || 'Unknown User';
  if ( comment?.isFromAuthor ) {
    author = this.submission?.authorFullName ? `${this.submission?.authorFullName} (Author)` : 'Author';
  }
  let updatedAt = comment?.updatedAt ? new Date(comment?.updatedAt).toLocaleString() : 'Unknown Date';
  let edited = comment?.createdAt !== comment?.updatedAt ? ' (edited)' : '';
  let editButton = html`
    <button class='edit-button' @click=${e => this._onEditClick(comment)}>Edit</button>
  `;
  const meta = [author, updatedAt, edited].filter(x => x);
  if ( this.AuthModel?.hasWriteAccess && comment?.user?.kerberos === this.AuthModel?.userId ) {
    meta.push(editButton);
  }
  return html`
    <div class='comment'>
      <div class='comment-text'>${comment.commentText}</div>
      <div class='comment-meta'>
        ${meta.map((m, i) => html`${i > 0 ? html`<div class='dot'></div>` : ''}<div>${m}</div>`)}
      </div>
    </div>
  `;
}
