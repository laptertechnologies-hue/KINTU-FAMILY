# Kintu Family Heritage Portal
## Bunyoro-Kitara Kingdom - Living Family Tree

A digital heritage portal and interactive family tree for the Kintu family lineage, tracing roots in Bunyoro-Kitara Kingdom, Western Uganda.

### Features
- Interactive family tree (zoom, pan, drag, search)
- Easy add-member form (one page, no wizard)
- Photo gallery archive with categories
- In Memoriam wall for departed elders
- Bunyoro-Kitara cultural heritage section with historical timeline
- Reunion RSVP system
- Neon (PostgreSQL) database backend via Vercel Serverless Functions

---

### Deployment on Vercel

1. Push this repository to GitHub
2. Connect the repository on [vercel.com](https://vercel.com)
3. **Set the Environment Variable** in Vercel project settings:

```
DATABASE_URL = postgresql://neondb_owner:...@ep-little-water-b46tku4h-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

4. Click Deploy - done! The database tables are auto-created on first request.

> **Security**: The DATABASE_URL is only accessed server-side via Vercel Serverless Functions. It is never exposed to the browser.

---

### Local Development

```bash
npm install
# Create .env file from .env.example and fill in DATABASE_URL
vercel dev
```

---

### Database Schema (auto-created)

```sql
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  first_name TEXT, last_name TEXT, empaako TEXT,
  gender TEXT, generation INT,
  birth_year INT, death_year INT, is_deceased BOOLEAN,
  branch TEXT, location TEXT, country TEXT,
  occupation TEXT, bio TEXT, photo_url TEXT,
  parent_ids TEXT[], spouse_ids TEXT[], children_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery (
  id TEXT PRIMARY KEY,
  title TEXT, category TEXT, year TEXT,
  image_url TEXT, caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsvp (
  id SERIAL PRIMARY KEY,
  name TEXT, branch TEXT, guest_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Cultural Heritage

- **Kingdom**: Bunyoro-Kitara Kingdom, Western Uganda
- **Motto**: "Obumu n'Engeso Nungi: Amabara g'Ekika Tegabura"
- **Empaako Tradition**: Abwooli, Amooti, Akiiki, Apuuli, Araali, Atwoki, Adyeri, Bbala, Acaali, Atenyi, Okali
- **Family Greeting**: "Oraire ota, Baana ba Kintu!"
- **The Four Pillars**: Obumu (Unity), Engeso Nungi (Integrity), Okusoma (Wisdom), Okwijuka Abakuru (Ancestral Reverence)

---

*Kintu Family Heritage Portal - Hosted on Vercel*
