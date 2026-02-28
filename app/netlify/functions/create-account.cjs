const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

const allowedSizes = new Set(['small', 'medium', 'enterprise']);

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function buildAccountId() {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `ACC-${suffix}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    return json(500, { ok: false, error: 'DATABASE_URL is not configured.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_error) {
    return json(400, { ok: false, error: 'Invalid JSON payload.' });
  }

  const companyName = (payload.companyName || '').trim();
  const ownerId = (payload.ownerId || '').trim();
  const size = (payload.size || '').trim();

  if (!companyName) {
    return json(400, { ok: false, error: 'Company name is required.' });
  }
  if (!ownerId) {
    return json(400, { ok: false, error: 'Owner ID is required.' });
  }
  if (size && !allowedSizes.has(size)) {
    return json(400, { ok: false, error: 'Size must be small, medium, or enterprise.' });
  }

  const values = [
    buildAccountId(),
    companyName,
    (payload.industry || '').trim() || null,
    size || null,
    (payload.website || '').trim() || null,
    (payload.phone || '').trim() || null,
    (payload.street || '').trim() || null,
    (payload.city || '').trim() || null,
    (payload.state || '').trim() || null,
    (payload.zip || '').trim() || null,
    (payload.country || '').trim() || null,
    ownerId,
  ];

  try {
    const query = `
      SELECT
        account_id AS "accountId",
        company_name AS "companyName",
        industry,
        size,
        website,
        phone,
        street,
        city,
        state,
        zip,
        country,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM create_account(
        $1::text, $2::text, $3::text, $4::text, $5::text, $6::text,
        $7::text, $8::text, $9::text, $10::text, $11::text, $12::text
      );
    `;
    const result = await pool.query(query, values);
    return json(201, { ok: true, account: result.rows[0] });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to create account.',
    });
  }
};
