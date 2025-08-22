CREATE TABLE IF NOT EXISTS submission (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at timestamp NOT NULL DEFAULT now(),
  author_last_name TEXT NOT NULL,
  author_first_name TEXT NOT NULL,
  author_middle_initial TEXT,
  other_authors TEXT,
  author_affiliation TEXT,
  author_department TEXT,
  author_email TEXT NOT NULL,
  author_phone TEXT,
  financial_contact_first_name TEXT NOT NULL,
  financial_contact_last_name TEXT NOT NULL,
  financial_contact_email TEXT NOT NULL,
  financial_contact_phone TEXT NOT NULL,
  fund_account JSONB NOT NULL,
  requested_amount NUMERIC(10, 2) NOT NULL,
  article_title TEXT NOT NULL,
  article_journal TEXT NOT NULL,
  article_status TEXT NOT NULL,
  article_publisher TEXT NOT NULL,
  article_link TEXT,
  submission_status_id UUID NOT NULL REFERENCES submission_status(status_id) ON DELETE RESTRICT,
  award_amount NUMERIC(10, 2),
  accounting_system_number TEXT,
  tsv_content tsvector,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE submission
  DROP COLUMN IF EXISTS author_full_name,
  ADD COLUMN author_full_name text GENERATED ALWAYS AS (
    make_full_name(author_first_name, author_middle_initial, author_last_name) COLLATE "C"
  ) STORED;

ALTER TABLE submission
  DROP COLUMN IF EXISTS financial_contact_full_name,
  ADD COLUMN financial_contact_full_name text GENERATED ALWAYS AS (
    make_full_name(financial_contact_first_name, NULL, financial_contact_last_name) COLLATE "C"
  ) STORED;

CREATE OR REPLACE TRIGGER submission_updated_at
  BEFORE UPDATE ON submission
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE submission
  DROP COLUMN IF EXISTS tsv_content,
  ADD COLUMN tsv_content tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', unaccent(
      make_full_name(author_first_name, author_middle_initial, author_last_name) COLLATE "C"
    )), 'A') ||
    setweight(to_tsvector('simple', lower(coalesce(author_email,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(
      make_full_name(financial_contact_first_name, NULL, financial_contact_last_name) COLLATE "C"
    )), 'A') ||
    setweight(to_tsvector('simple', lower(coalesce(financial_contact_email,''))), 'A') ||
    setweight(to_tsvector('english', coalesce(article_title,'')), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(other_authors,''))), 'B') ||
    setweight(to_tsvector('english', coalesce(author_department,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(article_journal,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(article_publisher,'')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS submission_tsv_content_idx
  ON submission USING gin(tsv_content);
