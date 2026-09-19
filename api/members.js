// api/members.js - Vercel Serverless Function
// Connects to Neon PostgreSQL via DATABASE_URL environment variable
// GET  /api/members  - return all family members
// POST /api/members  - insert or upsert a member

import { Pool } from "pg";

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      empaako TEXT,
      gender TEXT,
      generation INT DEFAULT 1,
      birth_year INT,
      death_year INT,
      is_deceased BOOLEAN DEFAULT FALSE,
      branch TEXT,
      location TEXT,
      country TEXT,
      occupation TEXT,
      bio TEXT,
      photo_url TEXT,
      parent_ids TEXT[] DEFAULT '{}',
      spouse_ids TEXT[] DEFAULT '{}',
      children_ids TEXT[] DEFAULT '{}',
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
      const result = await client.query(
        "SELECT * FROM family_members ORDER BY generation ASC, created_at ASC"
      );
      const members = result.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        empaako: row.empaako || "",
        traditionalName: row.empaako || "",
        gender: row.gender || "male",
        generation: row.generation || 1,
        birthYear: row.birth_year,
        deathYear: row.death_year,
        isDeceased: row.is_deceased || false,
        branch: row.branch || "Main Lineage",
        location: row.location || "",
        country: row.country || "Uganda",
        occupation: row.occupation || "",
        bio: row.bio || "",
        photo: row.photo_url || "",
        parentIds: row.parent_ids || [],
        spouseIds: row.spouse_ids || [],
        childrenIds: row.children_ids || [],
      }));
      return res.status(200).json({ members });
    }

    if (req.method === "POST") {
      const m = req.body;
      if (!m || !m.id || !m.firstName || !m.lastName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await client.query(
        `INSERT INTO family_members (
          id, first_name, last_name, empaako, gender, generation,
          birth_year, death_year, is_deceased, branch, location, country,
          occupation, bio, photo_url, parent_ids, spouse_ids, children_ids
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          empaako = EXCLUDED.empaako,
          gender = EXCLUDED.gender,
          generation = EXCLUDED.generation,
          birth_year = EXCLUDED.birth_year,
          death_year = EXCLUDED.death_year,
          is_deceased = EXCLUDED.is_deceased,
          branch = EXCLUDED.branch,
          location = EXCLUDED.location,
          country = EXCLUDED.country,
          occupation = EXCLUDED.occupation,
          bio = EXCLUDED.bio,
          photo_url = EXCLUDED.photo_url,
          parent_ids = EXCLUDED.parent_ids,
          spouse_ids = EXCLUDED.spouse_ids,
          children_ids = EXCLUDED.children_ids`,
        [
          m.id, m.firstName, m.lastName, m.empaako || "",
          m.gender || "male", m.generation || 1,
          m.birthYear || null, m.deathYear || null,
          m.isDeceased || false, m.branch || "Main Lineage",
          m.location || "", m.country || "Uganda",
          m.occupation || "", m.bio || "",
          m.photo || "", m.parentIds || [],
          m.spouseIds || [], m.childrenIds || [],
        ]
      );

      if (m.parentIds && m.parentIds.length > 0) {
        for (const parentId of m.parentIds) {
          await client.query(
            `UPDATE family_members SET children_ids = array_append(array_remove(children_ids, $1), $1) WHERE id = $2`,
            [m.id, parentId]
          );
        }
      }

      if (m.spouseIds && m.spouseIds.length > 0) {
        for (const spouseId of m.spouseIds) {
          await client.query(
            `UPDATE family_members SET spouse_ids = array_append(array_remove(spouse_ids, $1), $1) WHERE id = $2`,
            [m.id, spouseId]
          );
        }
      }

      return res.status(201).json({ success: true, id: m.id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("DB error in /api/members:", err);
    return res.status(500).json({ error: "Database error", detail: err.message });
  } finally {
    client.release();
  }
}
