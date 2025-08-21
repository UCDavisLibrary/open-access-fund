CREATE TABLE IF NOT EXISTS app_user (
  app_user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kerberos TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER app_user_updated_at
  BEFORE UPDATE ON app_user
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION get_app_user_id(kerberos_or_id TEXT)
  RETURNS UUID AS $$
DECLARE
  uid UUID;
BEGIN
  SELECT app_user_id INTO uid
  FROM app_user
  WHERE kerberos = kerberos_or_id
     OR app_user_id = try_cast_uuid(kerberos_or_id);

  IF uid IS NULL THEN
    RAISE EXCEPTION 'User not found: %', kerberos_or_id;
  END IF;

  RETURN uid;
END;
$$ LANGUAGE plpgsql;
