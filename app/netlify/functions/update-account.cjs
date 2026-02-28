const { Pool } = require('pg');

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

function toNullableText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT' && event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST') {
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

  const accountId = toNullableText(payload.accountId);
  if (!accountId) {
    return json(400, { ok: false, error: 'accountId is required.' });
  }

  const setClauses = [];
  const values = [];

  const pushField = (column, value) => {
    values.push(value);
    setClauses.push(`${column} = $${values.length}`);
  };

  if (Object.prototype.hasOwnProperty.call(payload, 'companyName')) {
    const companyName = toNullableText(payload.companyName);
    if (!companyName) {
      return json(400, { ok: false, error: 'companyName cannot be empty.' });
    }
    pushField('company_name', companyName);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'industry')) {
    pushField('industry', toNullableText(payload.industry));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'size')) {
    const size = toNullableText(payload.size);
    if (size && !allowedSizes.has(size)) {
      return json(400, { ok: false, error: 'Size must be small, medium, or enterprise.' });
    }
    pushField('size', size);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'website')) {
    pushField('website', toNullableText(payload.website));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
    pushField('phone', toNullableText(payload.phone));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'street')) {
    pushField('street', toNullableText(payload.street));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'city')) {
    pushField('city', toNullableText(payload.city));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'state')) {
    pushField('state', toNullableText(payload.state));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'zip')) {
    pushField('zip', toNullableText(payload.zip));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'country')) {
    pushField('country', toNullableText(payload.country));
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'ownerId')) {
    const ownerId = toNullableText(payload.ownerId);
    if (!ownerId) {
      return json(400, { ok: false, error: 'ownerId cannot be empty.' });
    }
    pushField('owner_id', ownerId);
  }

  if (setClauses.length === 0) {
    return json(400, { ok: false, error: 'No updatable fields were provided.' });
  }

  values.push(accountId);
  const idParam = `$${values.length}`;

  const query = `
    UPDATE accounts
    SET ${setClauses.join(', ')}
    WHERE account_id = ${idParam}
    RETURNING
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
      updated_at AS "updatedAt";
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return json(404, { ok: false, error: `Account not found: ${accountId}` });
    }
    return json(200, { ok: true, account: result.rows[0] });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to update account.',
    });
  }
};
