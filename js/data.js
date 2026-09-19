// KINTU FAMILY LINEAGE & HERITAGE PORTAL
// Bunyoro-Kitara Cultural Lineage Data Store

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
    elderWelcome: "A sacred gathering place for all sons, daughters, spouses, and descendants of the Kintu lineage from Bunyoro-Kitara and across the worldwide diaspora. Here we record our ancestors, unite our branches, and pass our legacy to the next generation."
  },

  originStory: {
    summary: "The Kintu family legacy traces its origins to the historic Bunyoro-Kitara Kingdom in Western Uganda. Grounded in the deep royal traditions of Bunyoro, steadfast values of obuntubulamu, integrity, and communal solidarity, our forefathers built homesteads founded on education, agriculture, and service. This portal stands as our permanent family archive.",
    foundingPillars: [
      {
        title: "Obumu (Unity)",
        desc: "Strength lies in kinship and shared roots. We support and uplift one another across all borders and generations."
      },
      {
        title: "Engeso Nungi (Integrity & Honor)",
        desc: "Preserving the esteemed moral character of Bunyoro-Kitara. We carry our family name with dignity and humility."
      },
      {
        title: "Okusoma n'Okwekamba (Wisdom & Diligence)",
        desc: "Dedication to intellectual growth, hard work, craftsmanship, and leadership in our communities and professions."
      },
      {
        title: "Okwijuka Abakuru (Ancestral Reverence)",
        desc: "Remembering and celebrating our forebears, upholding cultural traditions like Empaako and passing oral wisdom to our children."
      }
    ]
  },

  timeline: [
    {
      year: "1898",
      title: "Establishment of the Bunyoro Ancestral Homestead",
      category: "Founding",
      description: "Founding patriarchs establish the family seat in Bunyoro-Kitara, laying the groundwork for family agriculture and community stewardship."
    },
    {
      year: "1936",
      title: "Community Education & Development",
      category: "Education",
      description: "The family elders champion local schooling and vocational training across the district, ensuring children attain literacy and formal skills."
    },
    {
      year: "1962",
      title: "Independence Era & Professional Growth",
      category: "Milestone",
      description: "Descendants graduate from national colleges and Makerere University, entering civil leadership, teaching, healthcare, and engineering."
    },
    {
      year: "1988",
      title: "Global Diaspora Expansion",
      category: "Diaspora",
      description: "Family members extend branches across East Africa, the United Kingdom, and North America, maintaining unbroken ties to Bunyoro."
    },
    {
      year: "2026",
      title: "Launch of the Living Digital Archive & Family Tree",
      category: "Innovation",
      description: "The modern generation launches this interactive family portal so all descendants worldwide can document and preserve their lineage."
    }
  ],

  // Left empty so the user and family members can add themselves and their ancestors directly from the site
  members: [],

  // Left empty so family members can upload and contribute historical photos
  gallery: [],

  upcomingReunion: {
    title: "Kintu Global Family Gathering",
    theme: "Obumu: Honoring Our Bunyoro Roots, Connecting Our Tomorrow",
    date: "December 18 – 21, 2026",
    location: "Bunyoro-Kitara Ancestral Grounds & Kampala, Uganda",
    rsvpTarget: 200,
    confirmedRsvp: 24,
    schedule: [
      { day: "Day 1 (Dec 18)", event: "Arrival, Registration & Welcome Reception" },
      { day: "Day 2 (Dec 19)", event: "Pilgrimage to Bunyoro Homestead, Clan Blessings & Heritage Feast" },
      { day: "Day 3 (Dec 20)", event: "Youth Mentorship, Career Networking & Cultural Banquet" },
      { day: "Day 4 (Dec 21)", event: "Thanksgiving Service & Family Portrait Session" }
    ]
  },

  diasporaStats: [
    { country: "Uganda", count: 0, code: "UG", cities: "Bunyoro Region, Kampala, Entebbe" },
    { country: "United Kingdom", count: 0, code: "GB", cities: "London, Oxford, Manchester" },
    { country: "United States", count: 0, code: "US", cities: "New York, Boston, Atlanta" },
    { country: "Canada", count: 0, code: "CA", cities: "Toronto, Ottawa" },
    { country: "Kenya", count: 0, code: "KE", cities: "Nairobi" },
    { country: "Other Diaspora", count: 0, code: "GLOBAL", cities: "Worldwide" }
  ]
};

// Local storage management to allow dynamic updates
const STORAGE_KEY = "kintu_family_data_v2";
const CLOUD_CONFIG_KEY = "kintu_cloud_config_v2";

function getFamilyData() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(KINTU_INITIAL_DATA));
    return KINTU_INITIAL_DATA;
  }
  try {
    const parsed = JSON.parse(local);
    // Ensure structure compatibility
    if (!parsed.members) parsed.members = [];
    if (!parsed.gallery) parsed.gallery = [];
    return parsed;
  } catch (e) {
    console.error("Failed parsing localStorage family data", e);
    return KINTU_INITIAL_DATA;
  }
}

function saveFamilyData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  syncMemberToCloudIfEnabled(data);
}

function resetFamilyDataToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(KINTU_INITIAL_DATA));
  return KINTU_INITIAL_DATA;
}

// -------------------------------------------------------------
// CLOUD DATABASE INTEGRATION (Supabase / REST)
// -------------------------------------------------------------
function getCloudConfig() {
  const local = localStorage.getItem(CLOUD_CONFIG_KEY);
  return local ? JSON.parse(local) : { supabaseUrl: "", supabaseAnonKey: "", isConnected: false };
}

function saveCloudConfig(config) {
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
}

async function syncMemberToCloudIfEnabled(data) {
  const config = getCloudConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey || !config.isConnected) {
    return;
  }

  try {
    const latestMember = data.members[data.members.length - 1];
    if (!latestMember) return;

    const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/family_members`;
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: latestMember.id,
        first_name: latestMember.firstName,
        last_name: latestMember.lastName,
        empaako: latestMember.empaako || latestMember.traditionalName || '',
        gender: latestMember.gender,
        generation: latestMember.generation,
        birth_year: latestMember.birthYear,
        branch: latestMember.branch,
        location: latestMember.location,
        country: latestMember.country,
        occupation: latestMember.occupation,
        bio: latestMember.bio,
        photo_url: latestMember.photo,
        parent_ids: latestMember.parentIds,
        spouse_ids: latestMember.spouseIds,
        children_ids: latestMember.childrenIds
      })
    });
    console.log("Synced member to cloud database successfully.");
  } catch (err) {
    console.warn("Cloud database sync notice:", err);
  }
}
