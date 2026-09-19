# KINTU FAMILY HERITAGE & LIVING TREE PORTAL
> *Orulyango rw'eka ya Kintu &mdash; Bunyoro-Kitara Kingdom & Worldwide Diaspora*

A modern, culturally rich web application celebrating the ancestral background, history, and living lineage of the **Kintu Family** from **Bunyoro-Kitara Kingdom**, Western Uganda. Built for fast performance and seamless zero-configuration deployment on **Vercel**.

---

## Features Included

### 1. Ancestral Origin & Bunyoro-Kitara Heritage ("Enono n'Ebyafaayo")
- **Kingdom Heritage**: Bunyoro-Kitara Kingdom, Western Uganda.
- **Empaako Tradition**: Celebrates the honorific praise names (Abwooli, Amooti, Akiiki, Apuuli, Araali, Atwoki, Adyeri, Bbala, Acaali, Atenyi).
- **Clan Totem**: Engabi (Bushbuck) & Clan Totems.
- **The 4 Cultural Pillars**:
  - *Obumu* (Unbreakable Unity)
  - *Engeso Nungi* (Integrity, Honor & Dignity)
  - *Okusoma n'Okwekamba* (Wisdom, Diligence & Craftsmanship)
  - *Okwijuka Abakuru* (Ancestral Reverence)
- **Interactive Historical Timeline**: Chronicling foundational homesteads, education, and diaspora journeys.

### 2. Interactive Family Tree ("Orulyango rw'eka ya Kintu")
- **Clean Canvas**: Ready for you and family members to add the founding ancestor and all relatives directly through the website.
- **Interactive Controls**: Drag to pan across branches, zoom in and out, and filter by generation or lineage branch.
- **Animated Lineage Currents**: Living flowing curves showing connection between parents and children.
- **Search & Auto-focus**: Jump directly to any relative's card with glowing highlight.

### 3. "Add Member to Tree" (Self-Registration Wizard)
- A 4-step wizard modal allowing relatives or administrators to add members:
  1. **Personal Information**: First Name, Last Name, Empaako (Praise Name), Gender, Birth Year, and optional Deceased/Memorial toggle.
  2. **Lineage Connection**: Connect to an existing parent in the tree (or leave blank to establish a Generation 1 root node).
  3. **Location & Bio**: City, Country, Occupation, Life Story, and Photo URL.
  4. **Passcode Verification**: Protects against unauthorized edits (Default passcode: `KINTU2026`).

### 4. Living Photo Archives & In Memoriam Wall
- **Photo Archive**: Upload historical portraits, homestead pictures, and family events.
- **In Memoriam Wall**: Honoring departed elders and ancestors recorded with memorial years.

### 5. Global Diaspora & Searchable Directory
- Visual distribution of family members across Uganda and the global diaspora.
- Searchable directory filterable by professional fields.

---

## How to Run Locally

You can preview the website locally on your computer with **no dependencies needed**:
1. Open the folder: `c:\Users\TEKGO\Documents\antigravity\fervent-pascal\`
2. Double-click **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
3. Click **"Add Member to Tree"** to start populating your family lineage!

---

## Deploying to Vercel

This repository includes `vercel.json` for 1-click zero-config deployment:

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: Kintu family website for Bunyoro-Kitara with empty living tree and vector icons"
   git push origin main
   ```
2. Log in to [vercel.com](https://vercel.com).
3. Select **"Add New..." &rarr; "Project"**, pick **`KINTU-FAMILY`**, and click **"Deploy"**!

---

## Database Architecture (Local + Cloud Sync)

- **Local Storage (Default)**: All members you add are saved immediately in your browser (`localStorage`).
- **Cloud Database (Supabase / PostgreSQL)**:
  To synchronize live across all family members' phones and laptops worldwide:
  1. Create a free project at [supabase.com](https://supabase.com).
  2. Run this SQL query in the Supabase SQL editor:
     ```sql
     CREATE TABLE family_members (
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
       parent_ids TEXT[],
       spouse_ids TEXT[],
       children_ids TEXT[],
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
  3. In the website navigation, click **Database** and paste your Supabase Project URL and Anon API Key.
