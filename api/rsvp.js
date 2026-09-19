// api/rsvp.js - Vercel Serverless Function
// POST /api/rsvp - insert an RSVP
// GET  /api/rsvp - return total confirmed count

import { Pool } from "pg";

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS rsvp (
      id SERIAL PRIMARY KEY,
      name TEXT,
      branch TEXT,
      guest_count INT DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const client = await getPool().connect();
  try {
    await ensureTable(client);

    if (req.method === "GET") {
      const result = await client.query("SELECT SUM(guest_count) AS total FROM rsvp");
      const total = parseInt(result.rows[0]?.total || "0", 10);
      return res.status(200).json({ total });
    }

    if (req.method === "POST") {
      const { name, branch, guestCount } = req.body || {};
      await client.query(
        "INSERT INTO rsvp (name, branch, guest_count) VALUES ($1, $2, $3)",
        [name || "Anonymous", branch || "Uganda", parseInt(guestCount) || 1]
      );
      const countResult = await client.query("SELECT SUM(guest_count) AS total FROM rsvp");
      const total = parseInt(countResult.rows[0]?.total || "0", 10);
      return res.status(201).json({ success: true, total });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("DB error in /api/rsvp:", err);
    return res.status(500).json({ error: "Database error", detail: err.message });
  } finally {
    client.release();
  }
}
