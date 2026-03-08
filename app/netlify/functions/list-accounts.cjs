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
      FROM accounts
      ORDER BY created_at DESC;
    `);

    return json(200, { ok: true, accounts: result.rows });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to list accounts.',
    });
  }
};
