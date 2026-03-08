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

function readLeadId(event) {
  if (event.queryStringParameters && event.queryStringParameters.leadId) {
    return String(event.queryStringParameters.leadId).trim();
  }
  if (event.body) {
    try {
      const payload = JSON.parse(event.body);
      return String(payload.leadId || '').trim();
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

  const leadId = readLeadId(event);
  if (!leadId) return json(400, { ok: false, error: 'leadId is required.' });

  try {
    const result = await pool.query(
      `DELETE FROM leads WHERE lead_id = $1 RETURNING lead_id AS "leadId";`,
      [leadId]
    );
    if (result.rowCount === 0) return json(404, { ok: false, error: `Lead not found: ${leadId}` });
    return json(200, { ok: true, deleted: true, leadId: result.rows[0].leadId });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to delete lead.',
    });
  }
};
