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
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER submission_updated_at
  BEFORE UPDATE ON submission
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
