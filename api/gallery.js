// api/gallery.js - Vercel Serverless Function
// GET  /api/gallery - return all photos
// POST /api/gallery - insert a photo entry

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
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'Ancestral',
      year TEXT,
      image_url TEXT NOT NULL,
      caption TEXT,
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
      const result = await client.query("SELECT * FROM gallery ORDER BY created_at DESC");
      const photos = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category || "Ancestral",
        year: row.year || "",
        image: row.image_url,
        caption: row.caption || "",
      }));
      return res.status(200).json({ photos });
    }

    if (req.method === "POST") {
      const p = req.body;
      if (!p || !p.id || !p.title || !p.image) {
        return res.status(400).json({ error: "Missing required fields: id, title, image" });
      }

      await client.query(
        `INSERT INTO gallery (id, title, category, year, image_url, caption)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, category = EXCLUDED.category,
           year = EXCLUDED.year, image_url = EXCLUDED.image_url, caption = EXCLUDED.caption`,
        [p.id, p.title, p.category || "Ancestral", p.year || "", p.image, p.caption || ""]
      );

      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("DB error in /api/gallery:", err);
    return res.status(500).json({ error: "Database error", detail: err.message });
  } finally {
    client.release();
  }
}
