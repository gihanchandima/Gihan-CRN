-- PostgreSQL migration: create write function for accounts

CREATE OR REPLACE FUNCTION create_account(
  p_account_id TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_industry TEXT DEFAULT NULL,
  p_size TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_street TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zip TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_owner_id TEXT DEFAULT NULL
)
RETURNS accounts
LANGUAGE plpgsql
AS $$
DECLARE
  v_account accounts;
  v_account_id TEXT;
BEGIN
  IF p_company_name IS NULL OR btrim(p_company_name) = '' THEN
    RAISE EXCEPTION 'company_name is required';
  END IF;

  IF p_owner_id IS NULL OR btrim(p_owner_id) = '' THEN
    RAISE EXCEPTION 'owner_id is required';
  END IF;

  v_account_id := COALESCE(
    NULLIF(p_account_id, ''),
    'account-' || floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint::text
  );

  INSERT INTO accounts (
    account_id,
    company_name,
    industry,
    size,
    website,
    phone,
    street,
    city,
    state,
    zip,
    country,
    owner_id
  ) VALUES (
    v_account_id,
    btrim(p_company_name),
    NULLIF(btrim(p_industry), ''),
    NULLIF(btrim(p_size), ''),
    NULLIF(btrim(p_website), ''),
    NULLIF(btrim(p_phone), ''),
    NULLIF(btrim(p_street), ''),
    NULLIF(btrim(p_city), ''),
    NULLIF(btrim(p_state), ''),
    NULLIF(btrim(p_zip), ''),
    NULLIF(btrim(p_country), ''),
    btrim(p_owner_id)
  )
  RETURNING * INTO v_account;

  RETURN v_account;
END;
$$;
