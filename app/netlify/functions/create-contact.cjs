const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

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

function buildContactId() {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `CON-${suffix}`;
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

  const name = toNullableText(payload.name);
  const email = toNullableText(payload.email);
  const assignedTo = toNullableText(payload.assignedTo);

  if (!name) return json(400, { ok: false, error: 'Name is required.' });
  if (!email) return json(400, { ok: false, error: 'Email is required.' });
  if (!assignedTo) return json(400, { ok: false, error: 'Assigned user is required.' });

  try {
    const result = await pool.query(
      `
        INSERT INTO contacts (
          contact_id, name, email, phone, title, account_id, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          contact_id AS "contactId",
          name,
          email,
          phone,
          title,
          account_id AS "accountId",
          assigned_to AS "assignedTo",
          created_at AS "createdAt",
          updated_at AS "updatedAt";
      `,
      [
        buildContactId(),
        name,
        email,
        toNullableText(payload.phone),
        toNullableText(payload.title),
        toNullableText(payload.accountId),
        assignedTo,
      ]
    );
    return json(201, { ok: true, contact: result.rows[0] });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to create contact.',
    });
  }
};
