import { html, css } from 'lit';

import formStyles from '@ucd-lib/theme-sass/1_base_html/_forms.css.js';
import buttonStyles from '@ucd-lib/theme-sass/2_base_class/_buttons.css.js';
import { styles as corkFieldContainerStyles } from '../cork-field-container.tpl.js';

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
    .write-container {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    .avatar {
      width: 2.5rem;
      height: 2.5rem;
      min-width: 2.5rem;
      min-height: 2.5rem;
      border-radius: 50%;
      background-color: var(--ucd-gold);
      color: var(--ucd-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }
    .add-button {
      margin: 0;
      padding: .25rem .75rem;
      border: 1px solid #999;
      border-radius: 0;
      background-color: #fff;
      background-image: none;
      box-shadow: 0 1px 1px #00000013 inset;
      color: #13639e;
      font-family: inherit;
      outline: 0;
      height: 2.5rem;
      width: 100%;
      text-align: left;
      cursor: text;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    button {
      box-sizing: border-box;
      font-size: 1rem;
    }
    textarea {
      width: 100%;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
    }
    cork-field-container {
      margin-bottom: 1rem;
    }
    .write-input-container {
      width: 100%;
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

  return [
    formStyles,
    buttonStyles,
    ...corkFieldContainerStyles(),
    elementStyles
  ];
}

export function render() {
return html`
  <div>
    ${this.submission?.userComments?.map(comment => _renderComment.call(this, comment))}
  </div>
  <div class='write-container' ?hidden=${!this.AuthModel.userHasWriteAccess}>
    <div class='avatar' ?hidden=${!this.AuthModel.userInitials}>${this.AuthModel.userInitials}</div>
    <button class='add-button' @click=${this._onAddClick} ?hidden=${this.showWriteInput}>Add Comment</button>
    <div class='write-input-container' ?hidden=${!this.showWriteInput}>
      <cork-field-container schema='comment' path='commentText' class='field-container'>
        <textarea
          placeholder='Add Comment'
          .value=${this.writeInputValue}
          rows='4'
          @input=${e => this.writeInputValue = e.target.value}>
        </textarea>
      </cork-field-container>
      <div>
        <button class='btn btn--primary' @click=${this._onWriteSubmit}>${this.editedCommentId ? 'Update' : 'Submit'}</button>
        <button class='btn btn--invert' @click=${this._onWriteCancel}>Cancel</button>
      </div>

    </div>
  </div>
`;}

function _renderComment(comment){
  let author = comment?.user?.fullName || 'Unknown User';
  if ( comment?.isFromAuthor ) {
    author = this.submission?.authorFullName ? `${this.submission?.authorFullName} (Author)` : 'Author';
  }
  let createdAt = comment?.createdAt ? new Date(`${comment.createdAt}Z`).toLocaleString() : 'Unknown Date';
  let edited = comment?.createdAt !== comment?.updatedAt ? ' (edited)' : '';
  let editButton = html`
    <button class='edit-button' @click=${e => this._onEditClick(comment)}>Edit</button>
  `;
  const meta = [author, createdAt, edited].filter(x => x);
  if ( this.AuthModel?.userHasWriteAccess && comment?.user?.kerberos === this.AuthModel.userId ) {
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
