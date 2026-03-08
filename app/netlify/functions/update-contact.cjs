const { Pool } = require('pg');

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

exports.handler = async (event) => {
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
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

  const contactId = toNullableText(payload.contactId);
  if (!contactId) return json(400, { ok: false, error: 'contactId is required.' });

  const setClauses = [];
  const values = [];
  const pushField = (column, value) => {
    values.push(value);
    setClauses.push(`${column} = $${values.length}`);
  };

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    const name = toNullableText(payload.name);
    if (!name) return json(400, { ok: false, error: 'Name cannot be empty.' });
    pushField('name', name);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
    const email = toNullableText(payload.email);
    if (!email) return json(400, { ok: false, error: 'Email cannot be empty.' });
    pushField('email', email);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'phone')) pushField('phone', toNullableText(payload.phone));
  if (Object.prototype.hasOwnProperty.call(payload, 'title')) pushField('title', toNullableText(payload.title));
  if (Object.prototype.hasOwnProperty.call(payload, 'accountId')) pushField('account_id', toNullableText(payload.accountId));

  if (Object.prototype.hasOwnProperty.call(payload, 'assignedTo')) {
    const assignedTo = toNullableText(payload.assignedTo);
    if (!assignedTo) return json(400, { ok: false, error: 'assignedTo cannot be empty.' });
    pushField('assigned_to', assignedTo);
  }

  if (setClauses.length === 0) {
    return json(400, { ok: false, error: 'No updatable fields were provided.' });
  }

  values.push(contactId);
  const idParam = `$${values.length}`;

  try {
    const result = await pool.query(
      `
        UPDATE contacts
        SET ${setClauses.join(', ')}
        WHERE contact_id = ${idParam}
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
      values
    );

    if (result.rowCount === 0) return json(404, { ok: false, error: `Contact not found: ${contactId}` });
    return json(200, { ok: true, contact: result.rows[0] });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to update contact.',
    });
  }
};
