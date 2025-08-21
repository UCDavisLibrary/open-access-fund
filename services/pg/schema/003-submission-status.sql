CREATE TABLE IF NOT EXISTS submission_status (
  status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  label TEXT NOT NULL,
  submission_active BOOLEAN NOT NULL DEFAULT FALSE,
  submission_successful BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER submission_status_updated_at
  BEFORE UPDATE ON submission_status
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION get_submission_status_id(status_or_id TEXT)
RETURNS UUID AS $$
  DECLARE
    status_id UUID;
  BEGIN
    SELECT status_id INTO status_id FROM submission_status
    WHERE status = status_or_id OR status_id = try_cast_uuid(status_or_id);
    IF status_id IS NULL THEN
      RAISE EXCEPTION 'Submission status not found: %', status_or_id;
    END IF;
    RETURN status_id;
  END;
$$ LANGUAGE plpgsql;

INSERT INTO submission_status (status, label, submission_active, submission_successful)
  SELECT
    s.status, s.label, s.submission_active, s.submission_successful
  FROM (
    VALUES
      ('completed', 'Completed', FALSE, TRUE),
      ('denied', 'Denied', FALSE, FALSE),
      ('deleted', 'Deleted', FALSE, FALSE),
      ('pending', 'In Process by Collection Strategies', TRUE, FALSE),
      ('accounting', 'Sent to Accounting', TRUE, FALSE),
      ('submitted', 'Submitted', TRUE, FALSE),
      ('withdrawn', 'Withdrawn', FALSE, FALSE)
  ) AS s(status, label, submission_active, submission_successful)
WHERE NOT EXISTS (
  SELECT 1 FROM submission_status WHERE status = s.status
);
