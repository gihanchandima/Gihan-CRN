const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

const allowedStatuses = new Set(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']);

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

function buildLeadId() {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `LEAD-${suffix}`;
}

async function ensureAssignee(client, uid) {
  const teamId = 'team-default';
  await client.query(
    `
      INSERT INTO teams (team_id, name, manager_id)
      VALUES ($1, $2, NULL)
      ON CONFLICT (team_id) DO NOTHING;
    `,
    [teamId, 'Default Team']
  );

  await client.query(
    `
      INSERT INTO users (uid, name, email, role, team_id)
      VALUES ($1, $2, $3, 'sales', $4)
      ON CONFLICT (uid) DO NOTHING;
    `,
    [uid, `User ${uid}`, `${uid}@example.local`, teamId]
  );
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
  const source = toNullableText(payload.source) || 'manual';
  const status = toNullableText(payload.status) || 'new';
  const assignedTo = toNullableText(payload.assignedTo);
  const scoreRaw = payload.score;
  const score = Number.isFinite(Number(scoreRaw)) ? Number(scoreRaw) : 0;
  const estimatedRaw = payload.estimatedValue;
  const estimatedValue = estimatedRaw === null || estimatedRaw === undefined || estimatedRaw === ''
    ? null
    : Number(estimatedRaw);

  if (!name) return json(400, { ok: false, error: 'Name is required.' });
  if (!email) return json(400, { ok: false, error: 'Email is required.' });
  if (!assignedTo) return json(400, { ok: false, error: 'Assigned user is required.' });
  if (!allowedStatuses.has(status)) return json(400, { ok: false, error: 'Invalid lead status.' });
  if (!Number.isFinite(score) || score < 0 || score > 100) return json(400, { ok: false, error: 'Score must be between 0 and 100.' });
  if (estimatedValue !== null && (!Number.isFinite(estimatedValue) || estimatedValue < 0)) {
    return json(400, { ok: false, error: 'Estimated value must be a non-negative number.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureAssignee(client, assignedTo);

    const result = await client.query(
      `
        INSERT INTO leads (
          lead_id, name, email, phone, company, source, status, score, assigned_to, notes, last_contacted, estimated_value
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING
          lead_id AS "leadId",
          name,
          email,
          phone,
          company,
          source,
          status,
          score,
          assigned_to AS "assignedTo",
          notes,
          last_contacted AS "lastContacted",
          estimated_value AS "estimatedValue",
          created_at AS "createdAt",
          updated_at AS "updatedAt";
      `,
      [
        buildLeadId(),
        name,
        email,
        toNullableText(payload.phone),
        toNullableText(payload.company),
        source,
        status,
        score,
        assignedTo,
        toNullableText(payload.notes),
        payload.lastContacted ? new Date(payload.lastContacted) : null,
        estimatedValue,
      ]
    );

    await client.query('COMMIT');
    return json(201, { ok: true, lead: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to create lead.',
    });
  } finally {
    client.release();
  }
};
