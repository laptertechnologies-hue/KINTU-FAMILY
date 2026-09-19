// KINTU FAMILY LINEAGE & HERITAGE PORTAL
// Bunyoro-Kitara Cultural Lineage Data Store
// Database: Neon (PostgreSQL) via /api/ serverless functions

const KINTU_INITIAL_DATA = {
  familyInfo: {
    title: "The Kintu Family Heritage & Lineage",
    runyoroTitle: "Orulyango rw'eka ya Kintu",
    kingdom: "Bunyoro-Kitara Kingdom",
    motto: "Rooted in Honor, United Across Generations",
    runyoroMotto: "Obumu n'Engeso Nungi: Amabara g'Ekika Tegabura",
    originHomeland: "Bunyoro-Kitara, Western Uganda",
    foundingYear: 1898,
    clanName: "Kintu Lineage / Bunyoro-Kitara Clan",
    totem: "Engabi (Bushbuck) / Clan Totem",
    secondaryTotem: "Empango",
    clanGreeting: "Oraire ota, Baana ba Kintu!",
    empaakoNote: "Empaako Tradition: Abwooli, Amooti, Akiiki, Apuuli, Araali, Atwoki, Adyeri, Bbala, Acaali, Atenyi",
    familyPin: "KINTU2026",
    elderWelcome: "A sacred gathering place for all sons, daughters, spouses, and descendants of the Kintu lineage from Bunyoro-Kitara."
  },

  originStory: {
    summary: "The Kintu family legacy traces its origins to the historic Bunyoro-Kitara Kingdom in Western Uganda. Grounded in the deep royal traditions of Bunyoro, steadfast values of obuntubulamu, integrity, and communal solidarity, our forefathers built homesteads founded on education, agriculture, and service.",
    foundingPillars: [
      { title: "Obumu (Unity)", desc: "Strength lies in kinship and shared roots. We support and uplift one another across all borders and generations." },
      { title: "Engeso Nungi (Integrity & Honor)", desc: "Preserving the esteemed moral character of Bunyoro-Kitara. We carry our family name with dignity and humility." },
      { title: "Okusoma n'Okwekamba (Wisdom & Diligence)", desc: "Dedication to intellectual growth, hard work, craftsmanship, and leadership in our communities and professions." },
      { title: "Okwijuka Abakuru (Ancestral Reverence)", desc: "Remembering and celebrating our forebears, upholding cultural traditions like Empaako and passing oral wisdom to our children." }
    ]
  },

  timeline: [
    { year: "1898", title: "Establishment of the Bunyoro Ancestral Homestead", category: "Founding", description: "Founding patriarchs establish the family seat in Bunyoro-Kitara, laying the groundwork for family agriculture and community stewardship." },
    { year: "1936", title: "Community Education & Development", category: "Education", description: "The family elders champion local schooling and vocational training across the district, ensuring children attain literacy and formal skills." },
    { year: "1962", title: "Independence Era & Professional Growth", category: "Milestone", description: "Descendants graduate from national colleges and Makerere University, entering civil leadership, teaching, healthcare, and engineering." },
    { year: "2026", title: "Launch of the Living Digital Archive & Family Tree", category: "Innovation", description: "The modern generation launches this interactive family portal so all descendants can document and preserve their lineage." }
  ],

  members: [],
  gallery: [],

  upcomingReunion: {
    title: "Kintu Family Gathering",
    theme: "Obumu: Honoring Our Bunyoro Roots, Connecting Our Tomorrow",
    date: "December 18 - 21, 2026",
    location: "Bunyoro-Kitara Ancestral Grounds & Kampala, Uganda",
    rsvpTarget: 200,
    confirmedRsvp: 0,
  }
};

const STORAGE_KEY = "kintu_family_data_v3";

// -------------------------------------------------------
// LOCAL STORAGE (client-side cache / offline fallback)
// -------------------------------------------------------
function getFamilyData() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(KINTU_INITIAL_DATA));
    return JSON.parse(JSON.stringify(KINTU_INITIAL_DATA));
  }
  try {
    const parsed = JSON.parse(local);
    if (!parsed.members) parsed.members = [];
    if (!parsed.gallery) parsed.gallery = [];
    if (!parsed.upcomingReunion) parsed.upcomingReunion = KINTU_INITIAL_DATA.upcomingReunion;
    return parsed;
  } catch (e) {
    console.error("Failed parsing localStorage family data", e);
    return JSON.parse(JSON.stringify(KINTU_INITIAL_DATA));
  }
}

function saveFamilyData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetFamilyDataToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(KINTU_INITIAL_DATA));
  return JSON.parse(JSON.stringify(KINTU_INITIAL_DATA));
}

// -------------------------------------------------------
// NEON DATABASE API CALLS (via Vercel Serverless Functions)
// -------------------------------------------------------

async function fetchMembersFromDB() {
  try {
    const resp = await fetch("/api/members");
    if (!resp.ok) throw new Error("GET /api/members " + resp.status);
    const { members } = await resp.json();
    return members || [];
  } catch (err) {
    console.warn("Could not load members from DB (offline or local dev?):", err.message);
    return null; // null = use local cache
  }
}

async function saveMemberToDB(member) {
  try {
    const resp = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    if (!resp.ok) throw new Error("POST /api/members " + resp.status);
    return true;
  } catch (err) {
    console.warn("Could not save member to DB:", err.message);
    return false;
  }
}

async function fetchGalleryFromDB() {
  try {
    const resp = await fetch("/api/gallery");
    if (!resp.ok) throw new Error("GET /api/gallery " + resp.status);
    const { photos } = await resp.json();
    return photos || [];
  } catch (err) {
    console.warn("Could not load gallery from DB:", err.message);
    return null;
  }
}

async function savePhotoToDB(photo) {
  try {
    const resp = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(photo),
    });
    if (!resp.ok) throw new Error("POST /api/gallery " + resp.status);
    return true;
  } catch (err) {
    console.warn("Could not save photo to DB:", err.message);
    return false;
  }
}

async function fetchRsvpTotal() {
  try {
    const resp = await fetch("/api/rsvp");
    if (!resp.ok) throw new Error("GET /api/rsvp " + resp.status);
    const { total } = await resp.json();
    return total || 0;
  } catch (err) {
    return 0;
  }
}

async function submitRsvpToDB(name, branch, guestCount) {
  try {
    const resp = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, branch, guestCount }),
    });
    if (!resp.ok) throw new Error("POST /api/rsvp " + resp.status);
    const { total } = await resp.json();
    return total;
  } catch (err) {
    console.warn("Could not submit RSVP:", err.message);
    return null;
  }
}
