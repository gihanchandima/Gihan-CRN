-- Parameterized insert query for account creation
-- Params:
-- 1  account_id
-- 2  company_name (required)
-- 3  industry
-- 4  size (small|medium|enterprise)
-- 5  website
-- 6  phone
-- 7  street
-- 8  city
-- 9  state
-- 10 zip
-- 11 country
-- 12 owner_id (required)

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
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11,
  $12
)
RETURNING *;
