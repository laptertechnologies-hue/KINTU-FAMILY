// api/updates.js - Vercel Serverless Function
// Manages Recent Family Updates & Announcements
// Connects to Neon PostgreSQL via DATABASE_URL

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
    CREATE TABLE IF NOT EXISTS family_updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      photo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let client;
  try {
    client = await getPool().connect();
    await ensureTable(client);

    if (req.method === "GET") {
      const result = await client.query(
        "SELECT * FROM family_updates ORDER BY created_at DESC LIMIT 50"
      );
      const updates = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category || "General",
        author: row.author,
        content: row.content,
        photo: row.photo_url || "",
        createdAt: row.created_at,
      }));
      return res.status(200).json({ updates });
    }

    if (req.method === "POST") {
      const { id, title, category, author, content, photo, pin } = req.body || {};
      if (!pin || pin.toUpperCase() !== "KINTU2026") {
        return res.status(403).json({ error: "Invalid family passcode." });
      }
      if (!title || !content || !author) {
        return res.status(400).json({ error: "Missing required fields: title, author, content." });
      }

      const updateId = id || `update-${Date.now()}`;
      await client.query(
        `INSERT INTO family_updates (id, title, category, author, content, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           author = EXCLUDED.author,
           content = EXCLUDED.content,
           photo_url = EXCLUDED.photo_url`,
        [updateId, title, category || "General", author, content, photo || ""]
      );

      return res.status(201).json({ success: true, id: updateId });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("DB error in /api/updates:", err);
    return res.status(500).json({ error: "Database error", detail: err.message });
  } finally {
    if (client) client.release();
  }
}
