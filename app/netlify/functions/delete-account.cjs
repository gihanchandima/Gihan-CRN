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

function readAccountId(event) {
  if (event.queryStringParameters && event.queryStringParameters.accountId) {
    return String(event.queryStringParameters.accountId).trim();
  }

  if (event.body) {
    try {
      const payload = JSON.parse(event.body);
      return String(payload.accountId || '').trim();
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

  const accountId = readAccountId(event);
  if (!accountId) {
    return json(400, { ok: false, error: 'accountId is required.' });
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM accounts
        WHERE account_id = $1
        RETURNING account_id AS "accountId";
      `,
      [accountId]
    );

    if (result.rowCount === 0) {
      return json(404, { ok: false, error: `Account not found: ${accountId}` });
    }

    return json(200, {
      ok: true,
      deleted: true,
      accountId: result.rows[0].accountId,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to delete account.',
    });
  }
};
