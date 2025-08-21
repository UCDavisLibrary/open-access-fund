CREATE TABLE IF NOT EXISTS user_comment (
  user_comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submission(submission_id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES app_user(app_user_id) ON DELETE SET NULL,
  is_from_author BOOLEAN NOT NULL DEFAULT FALSE,
  comment_text TEXT NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER user_comment_updated_at
  BEFORE UPDATE ON user_comment
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
