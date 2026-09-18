# 👑 KINTU FAMILY HERITAGE & LIVING TREE PORTAL
> *Omulyango gw'Obukomera bwa Kintu — Katende, Mpigi & Worldwide Diaspora*

A modern, culturally rich, and interactive web application celebrating the background, ancestral origin, and living lineage of the **Kintu Family**, built for high performance and seamless zero-configuration deployment on **Vercel**.

---

## 🌟 Features Included

### 1. 🏺 Ancestral Origin & Clan Heritage ("Enono n'Ebyafaayo")
- **Clan Totem**: *Omuziro gw'Olugave* (Pangolin) and *Akabbiro k'Akanfuka*.
- **Ancestral Seat**: Historical founding in Katende, Mpigi district, Buganda Kingdom (1898).
- **The 4 Founding Pillars**:
  - *Obumu* (Unbreakable Unity)
  - *Obuntubulamu* (Honor, Dignity & Modesty)
  - *Okusoma* (Lifelong Wisdom & Pursuit of Knowledge)
  - *Okujjukira* (Ancestral Reverence)
- **Interactive Historical Timeline**: Chronicle spanning 1898 to 2026, marking education milestones, independence era, international migration, and centenary reunions.

### 2. 🌳 Interactive Family Tree ("Omuti gw'Ekika")
- **Interactive Hierarchical Engine**:
  - Drag to pan across branches.
  - Mouse-wheel / pinch-to-zoom controls (+ / - / reset view).
  - Multi-generational layout: Generation 1 (Founders) $\rightarrow$ Generation 2 (Elders) $\rightarrow$ Generation 3 (Grandchildren) $\rightarrow$ Generation 4 (Youth).
  - Curved Bezier lineage connectors linking parents, spouses, and children.
  - Search bar with instant autocomplete to jump directly to any relative's card with glowing pulse highlighting.
  - Generation and Branch filtering pills.
- **Member Detail Profile Drawer**:
  - Click any card to inspect full bio, portrait, cultural name (*erinnya ly'ekika*), occupation, dates, and direct links to jump to parents, spouse, or children.

### 3. ✍️ "Add Yourself to the Tree" (Self-Registration Wizard)
- A 4-step interactive modal wizard enabling any family member to join the living tree:
  1. **Personal Information**: First Name, Surname, Cultural Name, Gender, Birth Year.
  2. **Lineage Connection**: Select Father or Mother from existing tree members (automatically computes generational hierarchy and links family relations).
  3. **Location & Story**: City, Country, Profession, Short Bio, and Photo URL / avatar.
  4. **Family PIN Verification**: Protects the tree from unauthorized edits (Default passcode: `KINTU2026`).
- **Instant Live Update**: Upon submission, the new node immediately connects to the visual tree and persists in the visitor's local database!

### 4. 🌍 Global Diaspora Reach & Directory
- Real-time percentage distribution of family members across Uganda, UK, USA, Canada, Kenya, and beyond.
- Searchable Member Directory with filters by profession (Technology, Healthcare, Law, Business, Agriculture, Youth/Students) to foster youth mentorship and networking.

### 5. 📸 Living Archives & Photo Gallery ("Ebiwandiiko n'Ebifaananyi")
- Historical vintage photographs, wedding introductions (*Kwanjula*), centenary reunions, and ancestral groves.
- Lightbox view with captions, dates, and historical context.

### 6. 🕊️ In Memoriam Wall ("Abaatusooka")
- Dignified memorial space celebrating departed patriarchs, matriarchs, and ancestors with words of wisdom, years of life, and candle lighting.

### 7. 📅 Grand Reunion 2026 & RSVP
- Countdown to the December 2026 Gathering in Kampala & Katende.
- RSVP registration system with guest counter.

---

## 🚀 How to Run Locally

You can run this project locally on your computer with **no dependencies needed**:
1. Open the folder: `c:\Users\TEKGO\Documents\antigravity\fervent-pascal\`
2. Double-click **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Safari, Firefox).
3. Everything is fully functional immediately!

---

## 🌐 Deploying to Vercel

This repository is pre-configured with `vercel.json` for 1-click zero-config deployment:

### Option A: Via GitHub (Recommended)
1. Commit and push these files to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Kintu family heritage website and interactive tree"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..." $\rightarrow$ "Project"**.
4. Select the repository: `laptertechnologies-hue/KINTU-FAMILY`.
5. Click **"Deploy"**! Vercel will launch your site live with a free SSL domain (e.g., `kintu-family.vercel.app`).

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🗄️ Database Architecture & Cloud Roadmap

Currently, the application uses an in-browser persistent store (`localStorage`) loaded from `js/data.js`. Any member added through the **"Add Yourself"** form persists on that device.

### Upgrading to Cloud Database (Supabase / Vercel Postgres)
For full multi-user cloud synchronization across all family members worldwide:
1. Create a free project at [Supabase](https://supabase.com).
2. Run this SQL migration:
```sql
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  traditional_name TEXT,
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
  parent_ids TEXT[],
  spouse_ids TEXT[],
  children_ids TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
3. Connect your frontend fetch requests to Supabase REST API or serverless Next.js / Edge routes on Vercel.

---

## 🛡️ Administration & Customization
- **Family PIN**: The default verification passcode is configured as `KINTU2026` in `js/data.js`. You can change it anytime to any secret word.
- **Reset Demo Data**: If you want to reset the tree back to the original 25 members, click the **"Reset Demo Data"** link in the footer.

---
*Developed with pride for the Kintu Family.*
