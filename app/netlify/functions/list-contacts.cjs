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

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { ok: false, error: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    return json(500, { ok: false, error: 'DATABASE_URL is not configured.' });
  }

  try {
    const result = await pool.query(`
      SELECT
        contact_id AS "contactId",
        name,
        email,
        phone,
        title,
        account_id AS "accountId",
        assigned_to AS "assignedTo",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM contacts
      ORDER BY created_at DESC;
    `);
    return json(200, { ok: true, contacts: result.rows });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to list contacts.',
    });
  }
};
