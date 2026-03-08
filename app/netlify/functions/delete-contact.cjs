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

function readContactId(event) {
  if (event.queryStringParameters && event.queryStringParameters.contactId) {
    return String(event.queryStringParameters.contactId).trim();
  }
  if (event.body) {
    try {
      const payload = JSON.parse(event.body);
      return String(payload.contactId || '').trim();
    } catch (_error) {
      return '';
    }
  }
  return '';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE' && event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    return json(500, { ok: false, error: 'DATABASE_URL is not configured.' });
  }

  const contactId = readContactId(event);
  if (!contactId) return json(400, { ok: false, error: 'contactId is required.' });

  try {
    const result = await pool.query(
      `
        DELETE FROM contacts
        WHERE contact_id = $1
        RETURNING contact_id AS "contactId";
      `,
      [contactId]
    );
    if (result.rowCount === 0) return json(404, { ok: false, error: `Contact not found: ${contactId}` });
    return json(200, { ok: true, deleted: true, contactId: result.rows[0].contactId });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to delete contact.',
    });
  }
};
