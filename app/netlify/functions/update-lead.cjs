const { Pool } = require('pg');

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

async function ensureAssignee(client, uid) {
  const teamId = 'team-default';
  await client.query(
    `INSERT INTO teams (team_id, name, manager_id) VALUES ($1, $2, NULL) ON CONFLICT (team_id) DO NOTHING;`,
    [teamId, 'Default Team']
  );
  await client.query(
    `INSERT INTO users (uid, name, email, role, team_id) VALUES ($1, $2, $3, 'sales', $4) ON CONFLICT (uid) DO NOTHING;`,
    [uid, `User ${uid}`, `${uid}@example.local`, teamId]
  );
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

  const leadId = toNullableText(payload.leadId);
  if (!leadId) return json(400, { ok: false, error: 'leadId is required.' });

  const setClauses = [];
  const values = [];
  let assignedTo = null;

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
  if (Object.prototype.hasOwnProperty.call(payload, 'company')) pushField('company', toNullableText(payload.company));
  if (Object.prototype.hasOwnProperty.call(payload, 'source')) {
    const source = toNullableText(payload.source);
    if (!source) return json(400, { ok: false, error: 'Source cannot be empty.' });
    pushField('source', source);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    const status = toNullableText(payload.status);
    if (!status || !allowedStatuses.has(status)) return json(400, { ok: false, error: 'Invalid lead status.' });
    pushField('status', status);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'score')) {
    const score = Number(payload.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) return json(400, { ok: false, error: 'Score must be between 0 and 100.' });
    pushField('score', score);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'notes')) pushField('notes', toNullableText(payload.notes));
  if (Object.prototype.hasOwnProperty.call(payload, 'lastContacted')) {
    pushField('last_contacted', payload.lastContacted ? new Date(payload.lastContacted) : null);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'estimatedValue')) {
    const raw = payload.estimatedValue;
    const estimated = raw === null || raw === undefined || raw === '' ? null : Number(raw);
    if (estimated !== null && (!Number.isFinite(estimated) || estimated < 0)) {
      return json(400, { ok: false, error: 'Estimated value must be a non-negative number.' });
    }
    pushField('estimated_value', estimated);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'assignedTo')) {
    assignedTo = toNullableText(payload.assignedTo);
    if (!assignedTo) return json(400, { ok: false, error: 'assignedTo cannot be empty.' });
    pushField('assigned_to', assignedTo);
  }

  if (setClauses.length === 0) return json(400, { ok: false, error: 'No updatable fields were provided.' });

  values.push(leadId);
  const idParam = `$${values.length}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (assignedTo) await ensureAssignee(client, assignedTo);

    const result = await client.query(
      `
        UPDATE leads
        SET ${setClauses.join(', ')}
        WHERE lead_id = ${idParam}
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
      values
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return json(404, { ok: false, error: `Lead not found: ${leadId}` });
    }

    await client.query('COMMIT');
    return json(200, { ok: true, lead: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    return json(500, {
      ok: false,
      error: error && error.message ? error.message : 'Failed to update lead.',
    });
  } finally {
    client.release();
  }
};
