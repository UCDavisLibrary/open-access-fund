CREATE TABLE IF NOT EXISTS submission_transaction (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submission(submission_id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES app_user(app_user_id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL,
  transaction_subtype TEXT,
  user_comment_id UUID REFERENCES user_comment(user_comment_id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);
