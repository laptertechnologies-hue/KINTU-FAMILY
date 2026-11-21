/**
 * KINTU FAMILY WEBSITE - MAIN CONTROLLER
 * Bunyoro-Kitara Cultural Lineage & Living Archive
 * Database: Neon (PostgreSQL) via Vercel Serverless API
 * Real-Time Synchronization Engine
 */

let appData = null;
let selectedMember = null;
let currentSlideshowIndex = 0;
let slideshowInterval = null;
let currentFilterGen = "all";
let currentSearchQuery = "";
let currentUploadedPhotoBase64 = "";
let currentEditPhotoBase64 = "";
let currentUpdatePhotoBase64 = "";
let realtimeSyncTimer = null;
let isSyncing = false;

document.addEventListener("DOMContentLoaded", async () => {
  appData = getFamilyData();
  initHeroSlideshow();
  initUpdatesSection();
  initGenerationContainers();
  initHistoryTimeline();
  initMemorialWall();
  initGallery();
  initDirectory();
  initMinutesSection();
  initReunion();
  initModalsAndForms();
  initEditMemberModal();
  initThemeAndScroll();

  // Initial sync from remote DB
  await syncFromDB(false);
  // Start automated real-time background sync
  startRealtimeSync();

  console.log("Kintu Family Heritage Portal initialized with Real-Time Sync.");
});

/* -------------------------------------------------------
   1. HERO SLIDESHOW (Dynamic with User-Added Images)
------------------------------------------------------- */
const DEFAULT_SLIDESHOW_IMAGES = [
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1920&q=80"
];

function getSlideshowImages() {
  const customSlides = (appData.gallery || [])
    .filter((g) => g.isSlideshow || g.category === "Slideshow" || g.category === "Homeland")
    .map((g) => g.image);

  const combined = [...customSlides, ...DEFAULT_SLIDESHOW_IMAGES];
  // Deduplicate
  return [...new Set(combined)];
}

function initHeroSlideshow() {
  const slider = document.getElementById("heroSlider");
  const controls = document.getElementById("heroSlideshowControls");
  if (!slider) return;

  const images = getSlideshowImages();

  // Render slides dynamically
  slider.innerHTML = images
    .map((imgUrl, i) => `
      <div class="hero-slide ${i === 0 ? "active" : ""}" style="background-image: url('${imgUrl}');"></div>
    `)
    .join("");

  // Render dots
  if (controls) {
    controls.innerHTML = images
      .map((_, i) => `
        <button class="hero-dot ${i === 0 ? "active" : ""}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>
      `)
      .join("");
  }

  const slides = slider.querySelectorAll(".hero-slide");
  const dots = controls ? controls.querySelectorAll(".hero-dot") : [];

  function goToSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    currentSlideshowIndex = index;
  }

  function nextSlide() {
    if (!slides.length) return;
    const next = (currentSlideshowIndex + 1) % slides.length;
    goToSlide(next);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.dataset.slide) || 0;
      goToSlide(idx);
      resetSlideshowTimer();
    });
  });

  function resetSlideshowTimer() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(nextSlide, 5500);
  }

  resetSlideshowTimer();

  // Wire up "Add Image to Slideshow" button
  const btnHeroAddPhoto = document.getElementById("btnHeroAddPhoto");
  if (btnHeroAddPhoto) {
    btnHeroAddPhoto.onclick = () => {
      const addModal = document.getElementById("addPhotoModal");
      const isSlideshowCheck = document.getElementById("photoIsSlideshow");
      if (isSlideshowCheck) isSlideshowCheck.checked = true;
      if (addModal) addModal.classList.remove("hidden");
    };
  }
}

/* -------------------------------------------------------
   2. RECENT FAMILY UPDATES & ANNOUNCEMENTS SECTION
------------------------------------------------------- */
function initUpdatesSection() {
  renderFamilyUpdates();

  const openBtn = document.getElementById("btnOpenPostUpdate");
  const modal = document.getElementById("postUpdateModal");
  const closeBtn = document.getElementById("btnClosePostUpdate");
  const form = document.getElementById("postUpdateForm");
  const fileInput = document.getElementById("updatePhotoFileInput");
  const chooseBtn = document.getElementById("btnChooseUpdatePhoto");
  const removeBtn = document.getElementById("btnRemoveUpdatePhoto");
  const previewImg = document.getElementById("updatePhotoPreview");
  const placeholder = document.getElementById("updatePhotoPlaceholder");

  if (openBtn && modal) {
    openBtn.onclick = () => modal.classList.remove("hidden");
  }

  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.add("hidden");
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  if (chooseBtn && fileInput) {
    chooseBtn.onclick = () => fileInput.click();
  }

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressed = await compressImage(file, 800, 0.85);
        currentUpdatePhotoBase64 = compressed;
        if (previewImg) {
          previewImg.src = compressed;
          previewImg.classList.remove("hidden");
        }
        if (placeholder) placeholder.classList.add("hidden");
        if (removeBtn) removeBtn.classList.remove("hidden");
      } catch (err) {
        alert("Could not process picture. Please try another image.");
      }
    });
  }

  if (removeBtn) {
    removeBtn.onclick = () => {
      currentUpdatePhotoBase64 = "";
      if (fileInput) fileInput.value = "";
      if (previewImg) {
        previewImg.src = "";
        previewImg.classList.add("hidden");
      }
      if (placeholder) placeholder.classList.remove("hidden");
      removeBtn.classList.add("hidden");
    };
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pin = document.getElementById("updatePin").value.trim();
      if (pin.toUpperCase() !== (appData.familyInfo?.familyPin || "KINTU2026")) {
        alert("Incorrect Family Passcode. Please enter KINTU2026.");
        return;
      }

      const title = document.getElementById("updateTitle").value.trim();
      const category = document.getElementById("updateCategory").value;
      const author = document.getElementById("updateAuthor").value.trim();
      const content = document.getElementById("updateContent").value.trim();
      const photo = currentUpdatePhotoBase64 || "";

      if (!title || !author || !content) {
        alert("Please fill in the title, author, and message fields.");
        return;
      }

      const submitBtn = document.getElementById("btnSubmitPostUpdate");
      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Publishing to family...";
      submitBtn.disabled = true;

      const newUpdate = {
        id: `upd-${Date.now()}`,
        title,
        category,
        author,
        content,
        photo,
        createdAt: new Date().toISOString()
      };

      if (!appData.updates) appData.updates = [];
      appData.updates.unshift(newUpdate);
      saveFamilyData(appData);

      await saveUpdateToDB(newUpdate);

      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;
      modal.classList.add("hidden");
      form.reset();
      currentUpdatePhotoBase64 = "";
      if (previewImg) previewImg.classList.add("hidden");
      if (placeholder) placeholder.classList.remove("hidden");
      if (removeBtn) removeBtn.classList.add("hidden");

      renderFamilyUpdates();
      fireCelebrationConfetti();
      alert("Family announcement published successfully in real time!");
    });
  }
}

function renderFamilyUpdates() {
  const grid = document.getElementById("familyUpdatesGrid");
  if (!grid) return;

  const updates = appData.updates || [];
  if (!updates.length) {
    grid.innerHTML = `
      <div class="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <p class="text-xs text-slate-500 mb-2">No family updates posted yet.</p>
        <button onclick="document.getElementById('btnOpenPostUpdate').click()" class="text-xs text-amber-700 font-bold underline">
          Post the First Family Update &rarr;
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = updates.map((u) => {
    let dateStr = "Recent";
    try {
      if (u.createdAt) {
        dateStr = new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch (e) {}

    return `
      <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              ${u.category || "Clan Update"}
            </span>
            <span class="text-xs font-semibold text-slate-400">${dateStr}</span>
          </div>
          <h4 class="text-base font-bold font-serif-royal text-slate-900 mb-1.5 leading-snug">${u.title}</h4>
          <p class="text-xs text-slate-500 font-medium mb-3">Posted by: <strong class="text-slate-700">${u.author}</strong></p>
          <p class="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-line">${u.content}</p>
          ${u.photo ? `
            <div class="rounded-xl overflow-hidden mb-4 border border-slate-200 aspect-[16/9] cursor-pointer" onclick="openLightbox('${u.photo}','${u.title.replace(/'/g, "\\'")}','${u.author.replace(/'/g, "\\'")}','${dateStr}')">
              <img src="${u.photo}" class="w-full h-full object-cover hover:scale-105 transition duration-300" alt="Update photo">
            </div>
          ` : ""}
        </div>
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span class="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified Family Notice
          </span>
          <span class="text-amber-700 font-bold">Kintu Lineage</span>
        </div>
      </div>
    `;
  }).join("");
}

/* -------------------------------------------------------
   3. GENERATION CONTAINERS & DIRECTORY
------------------------------------------------------- */
const GENERATION_METADATA = {
  1: {
    title: "Generation 1: Ancestral Roots",
    era: "c. 1898 &ndash; Founding Patriarchs",
    desc: "Earliest recorded forebear Banjwa, planting the bedrock of the Ababwijwa lineage in Bunyoro-Kitara.",
    accent: "gen-1-accent",
    badge: "badge-gold-light"
  },
  2: {
    title: "Generation 2: The Elders",
    era: "c. 1900 &ndash; Clan Custodians",
    desc: "Katotera (the elder), guiding the homestead through agricultural stewardship and kinship traditions.",
    accent: "gen-2-accent",
    badge: "badge-blue-light"
  },
  3: {
    title: "Generation 3: Forebears",
    era: "c. 1910 &ndash; Lineage Pillars",
    desc: "Kalyegira and forebears, laying the bridge between ancestral homesteads and emerging Ugandan society.",
    accent: "gen-3-accent",
    badge: "badge-green-light"
  },
  4: {
    title: "Generation 4: The Great Patriarchs",
    era: "c. 1920s &ndash; Era of Matia Kintu",
    desc: "Patriarch Matia Kintu, Isoke, Kasingo, Byamukama, and brothers who expanded the branches.",
    accent: "gen-4-accent",
    badge: "badge-purple-light"
  },
  5: {
    title: "Generation 5: Clan Fathers & Lineage Pillars",
    era: "c. 1921 &ndash; 1990",
    desc: "Erifazi Biferamunda, Yosiya Birihanyomyo (Heir/Mugwetwa), Yostance Rukagyaha, Tereza Nyamusisi, Manueri Kalyaisoke.",
    accent: "gen-5-accent",
    badge: "badge-gold-light"
  },
  6: {
    title: "Generation 6: Children & Lineage Elders",
    era: "c. 1950s &ndash; Contemporary Elders",
    desc: "51 documented relatives across Uganda and diaspora, expanding modern leadership, education, and family stewardship.",
    accent: "gen-6-accent",
    badge: "badge-blue-light"
  },
  7: {
    title: "Generation 7: Grandchildren & Living Descendants",
    era: "c. 1970s &ndash; 2000s",
    desc: "80 documented relatives, carrying the torch of Empaako, professional excellence, and family unity across the globe.",
    accent: "gen-7-accent",
    badge: "badge-green-light"
  },
  8: {
    title: "Generation 8: Youth & Next Generation",
    era: "c. 2000s &ndash; Present",
    desc: "Modern great-grandchildren and youth, inheriting the rich legacy and digital archive of the Kintu family.",
    accent: "gen-8-accent",
    badge: "badge-purple-light"
  }
};

function initGenerationContainers() {
  renderGenerationContainers();

  const searchInput = document.getElementById("genContainerSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderGenerationContainers(currentSearchQuery, currentFilterGen);
    });
  }

  document.querySelectorAll("#generationFilterRow .filter-gen-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#generationFilterRow .filter-gen-btn").forEach((b) => {
        b.classList.remove("bg-amber-700", "text-white", "font-bold");
        b.classList.add("bg-slate-100", "text-slate-700", "font-semibold");
      });
      btn.classList.add("bg-amber-700", "text-white", "font-bold");
      btn.classList.remove("bg-slate-100", "text-slate-700", "font-semibold");

      currentFilterGen = btn.dataset.gen || "all";
      renderGenerationContainers(currentSearchQuery, currentFilterGen);
    });
  });
}

function renderGenerationContainers(query = "", filterGen = "all") {
  const container = document.getElementById("generationContainers");
  if (!container) return;

  const members = appData.members || [];
  let html = "";
  let totalVisible = 0;

  for (let gen = 1; gen <= 8; gen++) {
    if (filterGen !== "all" && String(filterGen) !== String(gen)) {
      continue;
    }

    const genMeta = GENERATION_METADATA[gen] || {
      title: `Generation ${gen}`,
      era: "Family Lineage",
      desc: "Descendants of the Kintu Lineage.",
      accent: `gen-${gen}-accent`,
      badge: "badge-slate-light"
    };

    let genMembers = members.filter((m) => (m.generation || 1) === gen);

    if (query) {
      genMembers = genMembers.filter((m) =>
        (m.firstName && m.firstName.toLowerCase().includes(query)) ||
        (m.lastName && m.lastName.toLowerCase().includes(query)) ||
        (m.empaako && m.empaako.toLowerCase().includes(query)) ||
        (m.location && m.location.toLowerCase().includes(query)) ||
        (m.bio && m.bio.toLowerCase().includes(query))
      );
    }

    if (query && genMembers.length === 0) {
      continue;
    }

    totalVisible += genMembers.length;
    const isExpanded = query !== "" || filterGen !== "all" || gen <= 5;

    html += `
      <div class="gen-container bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden" data-gen="${gen}">
        <div class="gen-container-header p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none border-b border-slate-100" onclick="toggleGenerationContainer(${gen})">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
              G${gen}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg sm:text-xl font-bold font-serif-royal text-slate-900">${genMeta.title}</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${genMeta.badge}">
                  ${genMembers.length} ${genMembers.length === 1 ? "Relative" : "Relatives"}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${genMeta.era} &bull; ${genMeta.desc}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span class="text-xs text-amber-700 font-bold hidden sm:inline" id="genToggleLabel-${gen}">${isExpanded ? "Collapse" : "Expand"}</span>
            <svg id="genToggleIcon-${gen}" class="w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <div id="genBody-${gen}" class="p-5 sm:p-6 bg-slate-50/50 ${isExpanded ? "" : "hidden"}">
          ${genMembers.length === 0 ? `
            <div class="py-8 text-center text-xs text-slate-400">
              No relatives found matching "${query}" in Generation ${gen}.
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              ${genMembers.map((m) => renderMemberCardHTML(m, genMeta.accent)).join("")}
            </div>
          `}
        </div>
      </div>
    `;
  }

  if (totalVisible === 0) {
    html = `
      <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h4 class="text-lg font-bold text-slate-900 mb-1">No relatives found</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto mb-5">
          We couldn't find anyone matching "${query}". Try searching by first name, surname, or Empaako praise name.
        </p>
        <button onclick="document.getElementById('genContainerSearch').value = ''; renderGenerationContainers();" class="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold shadow-sm transition">
          Clear Search Filter
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderMemberCardHTML(m, accentClass) {
  const childCount = m.childrenIds ? m.childrenIds.length : 0;
  const avatarFallback = m.firstName ? m.firstName.charAt(0).toUpperCase() : "?";

  return `
    <div class="gen-member-card ${accentClass}" onclick="openMemberModalById('${m.id}')">
      <div>
        <div class="flex items-start gap-3 mb-3">
          ${m.photo ? `
            <img src="${m.photo}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0" alt="${m.firstName}">
          ` : `
            <div class="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-sm">
              ${avatarFallback}
            </div>
          `}
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-bold text-slate-900 truncate font-serif-royal">${m.firstName} ${m.lastName}</h4>
            ${m.empaako ? `
              <span class="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-0.5">
                "${m.empaako}"
              </span>
            ` : ""}
            <p class="text-[11px] text-slate-500 mt-1">
              ${m.isDeceased ? `${m.birthYear || "Unknown"} &ndash; ${m.deathYear || "Passed"}` : `b. ${m.birthYear || "Unknown"}`}
            </p>
          </div>
        </div>

        <div class="text-[11px] text-slate-600 flex items-center gap-1.5 mb-2 truncate">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="truncate">${m.location || "Bunyoro-Kitara, Uganda"}</span>
        </div>
      </div>

      <div class="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="font-semibold text-slate-600 flex items-center gap-1">
          <span class="text-amber-700 font-bold">${childCount}</span> ${childCount === 1 ? "child" : "children"}
        </span>
        <span class="text-amber-700 font-bold hover:underline flex items-center gap-1">
          View &rarr;
        </span>
      </div>
    </div>
  `;
}

function toggleGenerationContainer(gen) {
  const body = document.getElementById(`genBody-${gen}`);
  const icon = document.getElementById(`genToggleIcon-${gen}`);
  const label = document.getElementById(`genToggleLabel-${gen}`);
  if (!body) return;

  const isHidden = body.classList.contains("hidden");
  body.classList.toggle("hidden", !isHidden);
  if (icon) icon.classList.toggle("rotate-180", isHidden);
  if (label) label.textContent = isHidden ? "Collapse" : "Expand";
}

function expandAllGenerations() {
  for (let g = 1; g <= 8; g++) {
    const body = document.getElementById(`genBody-${g}`);
    const icon = document.getElementById(`genToggleIcon-${g}`);
    const label = document.getElementById(`genToggleLabel-${g}`);
    if (body) body.classList.remove("hidden");
    if (icon) icon.classList.add("rotate-180");
    if (label) label.textContent = "Collapse";
  }
}

function collapseAllGenerations() {
  for (let g = 1; g <= 8; g++) {
    const body = document.getElementById(`genBody-${g}`);
    const icon = document.getElementById(`genToggleIcon-${g}`);
    const label = document.getElementById(`genToggleLabel-${g}`);
    if (body) body.classList.add("hidden");
    if (icon) icon.classList.remove("rotate-180");
    if (label) label.textContent = "Expand";
  }
}

function openMemberModalById(id) {
  const member = appData.members.find((m) => m.id === id);
  if (member) openMemberModal(member);
}

/* -------------------------------------------------------
   4. MEMBER PROFILE MODAL & CONTEXTUAL ACTIONS
------------------------------------------------------- */
function openMemberModal(member) {
  selectedMember = member;
  const modal = document.getElementById("memberProfileModal");
  if (!modal) return;

  const pe = document.getElementById("modalMemberPhoto");
  const fe = document.getElementById("modalMemberPhotoFallback");
  if (member.photo) {
    pe.src = member.photo;
    pe.classList.remove("hidden");
    fe?.classList.add("hidden");
  } else {
    pe.classList.add("hidden");
    if (fe) {
      fe.classList.remove("hidden");
      fe.textContent = member.firstName ? member.firstName.charAt(0).toUpperCase() : "?";
    }
  }

  document.getElementById("modalMemberName").textContent = `${member.firstName} ${member.lastName}`;
  const ee = document.getElementById("modalMemberTradName");
  if (member.empaako) {
    ee.textContent = `Empaako: "${member.empaako}"`;
    ee.classList.remove("hidden");
  } else {
    ee.classList.add("hidden");
  }

  const locEl = document.getElementById("modalMemberLocationText");
  if (locEl) locEl.textContent = member.location || "Bunyoro-Kitara, Uganda";

  document.getElementById("modalMemberGenBadge").textContent = `Generation ${member.generation}`;
  const bb = document.getElementById("modalMemberBranchBadge");
  if (bb) bb.textContent = member.branch || "Ababwijwa Lineage";

  document.getElementById("modalMemberDates").innerHTML = member.isDeceased
    ? `Born ${member.birthYear || "Unknown"} &ndash; Passed ${member.deathYear || "Passed"}`
    : `Born ${member.birthYear || "Unknown"}`;

  const bioContainer = document.getElementById("modalMemberBioContainer");
  const bioText = document.getElementById("modalMemberBioText");
  if (bioContainer && bioText) {
    if (member.bio) {
      bioText.textContent = member.bio;
      bioContainer.classList.remove("hidden");
    } else {
      bioContainer.classList.add("hidden");
    }
  }

  const rc = document.getElementById("modalMemberRelations");
  let html = "";

  if (member.parentIds && member.parentIds.length) {
    const parents = member.parentIds.map((id) => appData.members.find((m) => m.id === id)).filter(Boolean);
    if (parents.length) {
      html += buildInteractiveRelSection("Parents", parents);
    }
  }

  if (member.spouseIds && member.spouseIds.length) {
    const spouses = member.spouseIds.map((id) => appData.members.find((m) => m.id === id)).filter(Boolean);
    if (spouses.length) {
      html += buildInteractiveRelSection("Spouse / Partner", spouses);
    }
  }

  if (member.childrenIds && member.childrenIds.length) {
    const children = member.childrenIds.map((id) => appData.members.find((m) => m.id === id)).filter(Boolean);
    if (children.length) {
      html += buildInteractiveChildrenSection(`Direct Children (${children.length})`, children);
    }
  }

  rc.innerHTML = html || '<p class="text-xs text-slate-400 italic">No direct connections recorded yet.</p>';

  const btnAddChild = document.getElementById("btnModalAddChild");
  const btnAddSpouse = document.getElementById("btnModalAddSpouse");
  const btnEditMember = document.getElementById("btnModalEditMember");

  if (btnAddChild) {
    btnAddChild.onclick = () => {
      modal.classList.add("hidden");
      triggerAddChildToMember(member);
    };
  }

  if (btnAddSpouse) {
    btnAddSpouse.onclick = () => {
      modal.classList.add("hidden");
      triggerAddSpouseToMember(member);
    };
  }

  if (btnEditMember) {
    btnEditMember.onclick = () => {
      modal.classList.add("hidden");
      openEditMemberModal(member);
    };
  }

  modal.classList.remove("hidden");
}

function buildInteractiveRelSection(label, people) {
  return `
    <div class="mb-3">
      <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">${label}</span>
      <div class="flex flex-wrap gap-2">
        ${people.map(p => `
          <button class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-200 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm" onclick="openMemberModalById('${p.id}')">
            <span>${p.firstName} ${p.lastName}</span>
            ${p.empaako ? `<span class="text-[10px] text-amber-800 font-bold">(${p.empaako})</span>` : ""}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function buildInteractiveChildrenSection(label, children) {
  return `
    <div class="mb-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">${label}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        ${children.map(c => `
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition flex items-center justify-between" onclick="openMemberModalById('${c.id}')">
            <div class="min-w-0 pr-2">
              <span class="text-xs font-bold text-slate-900 block truncate">${c.firstName} ${c.lastName}</span>
              <span class="text-[10px] text-slate-500 block">Gen ${c.generation}${c.empaako ? ` &bull; "${c.empaako}"` : ""}</span>
            </div>
            <span class="text-[11px] text-amber-700 font-bold shrink-0">&rarr;</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function triggerAddChildToMember(parent) {
  populateParentDropdowns();
  const parentSelect = document.getElementById("regParent");
  if (parentSelect) {
    parentSelect.value = parent.id;
  }
  const notice = document.getElementById("regParentNotice");
  if (notice) {
    notice.textContent = `Adding child of ${parent.firstName} ${parent.lastName}. Generation will be auto-set to Gen ${Math.min((parent.generation || 1) + 1, 8)}.`;
  }
  const addModalTitle = document.getElementById("addMemberModalTitle");
  if (addModalTitle) {
    addModalTitle.textContent = `Add Child to ${parent.firstName} ${parent.lastName}`;
  }
  document.getElementById("addMemberModal").classList.remove("hidden");
}

function triggerAddSpouseToMember(spouse) {
  populateParentDropdowns();
  const spouseSelect = document.getElementById("regSpouse");
  if (spouseSelect) {
    spouseSelect.value = spouse.id;
  }
  const addModalTitle = document.getElementById("addMemberModalTitle");
  if (addModalTitle) {
    addModalTitle.textContent = `Add Spouse / Wife to ${spouse.firstName} ${spouse.lastName}`;
  }
  document.getElementById("addMemberModal").classList.remove("hidden");
}

/* -------------------------------------------------------
   5. EDIT MEMBER MODAL & HANDLERS
------------------------------------------------------- */
function initEditMemberModal() {
  const modal = document.getElementById("editMemberModal");
  const closeBtn = document.getElementById("btnCloseEditMember");
  const form = document.getElementById("editMemberForm");
  const fileInput = document.getElementById("editPhotoFileInput");
  const chooseBtn = document.getElementById("btnChooseEditPhoto");
  const removeBtn = document.getElementById("btnRemoveEditPhoto");
  const previewImg = document.getElementById("editPhotoPreview");
  const placeholder = document.getElementById("editPhotoPlaceholder");
  const deceasedCheck = document.getElementById("editIsDeceased");
  const deathDiv = document.getElementById("editDeathYearField");

  if (closeBtn) closeBtn.onclick = () => modal.classList.add("hidden");

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  if (deceasedCheck && deathDiv) {
    deceasedCheck.addEventListener("change", () => {
      deathDiv.classList.toggle("hidden", !deceasedCheck.checked);
    });
  }

  if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressed = await compressImage(file, 500, 0.82);
        currentEditPhotoBase64 = compressed;
        if (previewImg) {
          previewImg.src = compressed;
          previewImg.classList.remove("hidden");
        }
        if (placeholder) placeholder.classList.add("hidden");
        if (removeBtn) removeBtn.classList.remove("hidden");
      } catch (err) {
        alert("Could not process picture. Please try another image.");
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      currentEditPhotoBase64 = "";
      if (fileInput) fileInput.value = "";
      if (previewImg) {
        previewImg.src = "";
        previewImg.classList.add("hidden");
      }
      if (placeholder) placeholder.classList.remove("hidden");
      removeBtn.classList.add("hidden");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pin = document.getElementById("editPin").value.trim();
      if (pin.toUpperCase() !== (appData.familyInfo?.familyPin || "KINTU2026")) {
        alert("Incorrect Family Passcode. Please enter KINTU2026.");
        return;
      }

      const memberId = document.getElementById("editMemberId").value;
      const member = appData.members.find((m) => m.id === memberId);
      if (!member) {
        alert("Member record not found.");
        return;
      }

      member.firstName = document.getElementById("editFirstName").value.trim();
      member.lastName = document.getElementById("editLastName").value.trim();
      member.empaako = document.getElementById("editEmpaako").value.trim();
      member.gender = document.getElementById("editGender").value;
      member.birthYear = parseInt(document.getElementById("editBirthYear").value) || member.birthYear;
      member.location = document.getElementById("editAddress").value.trim() || member.location;
      member.bio = document.getElementById("editBio").value.trim();
      member.isDeceased = document.getElementById("editIsDeceased").checked;
      member.deathYear = member.isDeceased ? parseInt(document.getElementById("editDeathYear").value) || null : null;

      if (currentEditPhotoBase64) {
        member.photo = currentEditPhotoBase64;
      }

      const submitBtn = document.getElementById("btnSubmitEditMember");
      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Saving changes...";
      submitBtn.disabled = true;

      saveFamilyData(appData);
      await saveMemberToDB(member);

      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;
      modal.classList.add("hidden");

      renderGenerationContainers(currentSearchQuery, currentFilterGen);
      initDirectory();
      initMemorialWall();
      openMemberModal(member);

      alert(`${member.firstName} ${member.lastName}'s information updated successfully!`);
    });
  }
}

function openEditMemberModal(member) {
  const modal = document.getElementById("editMemberModal");
  if (!modal) return;

  document.getElementById("editMemberId").value = member.id;
  document.getElementById("editFirstName").value = member.firstName || "";
  document.getElementById("editLastName").value = member.lastName || "";
  document.getElementById("editEmpaako").value = member.empaako || "";
  document.getElementById("editGender").value = member.gender || "male";
  document.getElementById("editBirthYear").value = member.birthYear || "";
  document.getElementById("editAddress").value = member.location || "";
  document.getElementById("editBio").value = member.bio || "";
  document.getElementById("editPin").value = "KINTU2026";

  const decCheck = document.getElementById("editIsDeceased");
  const deathDiv = document.getElementById("editDeathYearField");
  const deathYearInput = document.getElementById("editDeathYear");

  decCheck.checked = !!member.isDeceased;
  deathDiv.classList.toggle("hidden", !member.isDeceased);
  deathYearInput.value = member.deathYear || "";

  currentEditPhotoBase64 = member.photo || "";
  const previewImg = document.getElementById("editPhotoPreview");
  const placeholder = document.getElementById("editPhotoPlaceholder");
  const removeBtn = document.getElementById("btnRemoveEditPhoto");

  if (member.photo) {
    previewImg.src = member.photo;
    previewImg.classList.remove("hidden");
    placeholder.classList.add("hidden");
    removeBtn.classList.remove("hidden");
  } else {
    previewImg.src = "";
    previewImg.classList.add("hidden");
    placeholder.classList.remove("hidden");
    removeBtn.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

/* -------------------------------------------------------
   6. MINUTES & CLAN DOCUMENT ARCHIVE SECTION
------------------------------------------------------- */
let currentSelectedMinute = null;

function initMinutesSection() {
  const grid = document.getElementById("minutesGrid");
  if (!grid) return;

  const minutes = appData.minutes || [];
  grid.innerHTML = minutes.map((doc) => {
    const attendeeCount = (doc.attendees || []).length;
    return `
      <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              ${doc.category}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">${doc.date}</span>
              ${attendeeCount > 0 ? `<span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">${attendeeCount} Attendees</span>` : ""}
            </div>
          </div>
          <h4 class="text-base sm:text-lg font-bold font-serif-royal text-slate-900 mb-1.5 leading-snug">${doc.title}</h4>
          <p class="text-xs text-slate-500 font-medium mb-1">
            <span class="text-slate-400">Venue:</span> <strong class="text-slate-700 font-semibold">${doc.venue || "Bunyoro-Kitara"}</strong>
          </p>
          <p class="text-xs text-slate-500 font-medium mb-3">
            <span class="text-slate-400">Recorded by:</span> <strong class="text-slate-700">${doc.recordedBy}</strong>
          </p>
          <p class="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">${doc.summary}</p>
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${(doc.tags || []).map(t => `<span class="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">#${t}</span>`).join("")}
          </div>
        </div>
        <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="text-emerald-700 font-bold flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${doc.status}
          </span>
          <div class="flex items-center gap-2">
            <button onclick="downloadSingleMinutePDF('${doc.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>PDF</span>
            </button>
            <button onclick="openMinuteDetail('${doc.id}')" class="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5">
              <span>View Full Minutes &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  initMinuteDetailModal();
}

function initMinuteDetailModal() {
  const modal = document.getElementById("minuteDetailModal");
  if (!modal) return;

  const closeBtn = document.getElementById("btnCloseMinuteDetail");
  const closeBottomBtn = document.getElementById("btnCloseMinuteDetailBottom");
  const searchInput = document.getElementById("minuteAttendeeSearch");
  const downloadBtn = document.getElementById("btnDownloadMinuteRecord");

  const closeModal = () => modal.classList.add("hidden");

  if (closeBtn) closeBtn.onclick = closeModal;
  if (closeBottomBtn) closeBottomBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      renderMinuteAttendees(currentSelectedMinute, q);
    };
  }

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      if (currentSelectedMinute) {
        downloadSingleMinutePDF(currentSelectedMinute.id);
      }
    };
  }
}

function openMinuteDetail(docId) {
  const minutes = appData.minutes || [];
  const doc = minutes.find(m => m.id === docId);
  if (!doc) return;

  currentSelectedMinute = doc;
  const modal = document.getElementById("minuteDetailModal");
  if (!modal) return;

  // Header
  const catEl = document.getElementById("minuteDetailCategory");
  const statEl = document.getElementById("minuteDetailStatus");
  const dateEl = document.getElementById("minuteDetailDate");
  const titleEl = document.getElementById("minuteDetailTitle");
  if (catEl) catEl.textContent = doc.category || "Clan Record";
  if (statEl) statEl.textContent = doc.status || "Archived";
  if (dateEl) dateEl.textContent = doc.date || "";
  if (titleEl) titleEl.textContent = doc.title || "";

  // Metadata cards
  const venueEl = document.getElementById("minuteDetailVenue");
  const chairEl = document.getElementById("minuteDetailChairperson");
  const recEl = document.getElementById("minuteDetailRecordedBy");
  const prayersEl = document.getElementById("minuteDetailPrayers");
  if (venueEl) venueEl.textContent = doc.venue || "Bunyoro-Kitara";
  if (chairEl) chairEl.textContent = doc.chairperson || "Council of Elders";
  if (recEl) recEl.textContent = doc.recordedBy || "Clan Secretariat";
  if (prayersEl) prayersEl.textContent = doc.openingPrayer ? `Open: ${doc.openingPrayer}` : "Opening & Closing Prayers observed";

  // Summary
  const sumEl = document.getElementById("minuteDetailSummary");
  if (sumEl) sumEl.textContent = doc.summary || "";

  // Agenda
  const agendaEl = document.getElementById("minuteDetailAgenda");
  if (agendaEl) {
    const agendaList = doc.agenda && doc.agenda.length ? doc.agenda : ["Family lineage preservation", "General assembly deliberations"];
    agendaEl.innerHTML = agendaList.map((item, idx) => `
      <li class="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-100">
        <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
        <span class="leading-relaxed">${item}</span>
      </li>
    `).join("");
  }

  // Discussions
  const discEl = document.getElementById("minuteDetailDiscussions");
  if (discEl) {
    const discList = doc.keyDiscussions && doc.keyDiscussions.length ? doc.keyDiscussions : ["Matters arising and historical verification discussed thoroughly."];
    discEl.innerHTML = discList.map((item) => `
      <li class="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
        <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/></svg>
        <span class="leading-relaxed">${item}</span>
      </li>
    `).join("");
  }

  // Resolutions
  const resEl = document.getElementById("minuteDetailResolutions");
  if (resEl) {
    const resList = doc.resolutions && doc.resolutions.length ? doc.resolutions : ["Resolutions unanimously endorsed by the council."];
    resEl.innerHTML = resList.map((item) => `
      <li class="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
        <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">&check;</span>
        <span class="leading-relaxed font-medium text-slate-800">${item}</span>
      </li>
    `).join("");
  }

  // Reset attendee search input
  const searchInput = document.getElementById("minuteAttendeeSearch");
  if (searchInput) searchInput.value = "";

  // Render Attendees
  renderMinuteAttendees(doc, "");

  modal.classList.remove("hidden");
}

function renderMinuteAttendees(doc, filterQuery = "") {
  if (!doc) return;
  const listEl = document.getElementById("minuteDetailAttendeesList");
  const countEl = document.getElementById("minuteDetailAttendeeCount");
  if (!listEl) return;

  const rawAttendees = doc.attendees || [];
  let filtered = rawAttendees;

  if (filterQuery) {
    filtered = rawAttendees.filter(a => {
      const text = typeof a === "string" ? a : `${a.name || ""} ${a.phone || ""} ${a.branch || ""}`;
      return text.toLowerCase().includes(filterQuery);
    });
  }

  if (countEl) countEl.textContent = `${filtered.length} of ${rawAttendees.length}`;

  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="col-span-full py-6 text-center text-xs text-slate-400">
        No attendees matched "${filterQuery}".
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map((item) => {
    let name = "";
    let phone = "";
    let extra = "";

    if (typeof item === "string") {
      name = item;
      const phoneMatch = item.match(/\((07[0-9]{8}[^\)]*)\)/);
      if (phoneMatch) {
        phone = phoneMatch[1];
        name = item.replace(/\(07[0-9]{8}[^\)]*\)/, "").trim();
      }
    } else if (item && typeof item === "object") {
      name = item.name || "";
      phone = item.phone || "";
      extra = item.branch || item.role || "";
    }

    return `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200 transition flex items-center justify-between gap-2">
        <div class="truncate">
          <p class="text-xs font-bold text-slate-900 truncate">${name}</p>
          ${extra ? `<p class="text-[10px] text-slate-500 font-medium truncate">${extra}</p>` : ""}
        </div>
        ${phone ? `
          <a href="tel:${phone.split('/')[0].trim()}" class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 shrink-0 hover:bg-amber-200 transition">
            ${phone.split('/')[0].trim()}
          </a>
        ` : `
          <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">Present</span>
        `}
      </div>
    `;
  }).join("");
}

function downloadSingleMinutePDF(minuteId) {
  const minutes = appData.minutes || [];
  const doc = minutes.find(m => m.id === minuteId);
  if (!doc) return;

  let printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups in your browser to view and print the minutes record.");
    return;
  }

  const exportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const attendees = doc.attendees || [];

  const agendaHTML = (doc.agenda && doc.agenda.length) 
    ? doc.agenda.map((a, i) => `<li style="margin-bottom: 6px;"><strong>${i+1}.</strong> ${a}</li>`).join("")
    : "<li>Lineage preservation & clan council matters.</li>";

  const discHTML = (doc.keyDiscussions && doc.keyDiscussions.length)
    ? doc.keyDiscussions.map(d => `<li style="margin-bottom: 6px;">${d}</li>`).join("")
    : "<li>Detailed deliberations recorded in clan archives.</li>";

  const resHTML = (doc.resolutions && doc.resolutions.length)
    ? doc.resolutions.map(r => `<li style="margin-bottom: 6px; color: #065f46; font-weight: 600;">&bull; ${r}</li>`).join("")
    : "<li>Resolutions confirmed by council consensus.</li>";

  const attendeesHTML = attendees.map((item, idx) => {
    const text = typeof item === "string" ? item : `${item.name}${item.phone ? ` (${item.phone})` : ""}`;
    return `<div style="padding: 4px 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10px;">${idx + 1}. ${text}</div>`;
  }).join("");

  const docHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${doc.title} - Official Minutes Record</title>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 24px; background: #ffffff; }
        @media print { body { padding: 12px; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; padding: 12px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
        <span style="font-weight: bold; font-size: 13px; color: #92400e;">Official Clan Minutes Document</span>
        <button onclick="window.print()" style="margin-left: 14px; padding: 6px 16px; background-color: #b45309; color: #ffffff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Print / Save PDF
        </button>
      </div>

      <div style="text-align: center; border-bottom: 3px double #b45309; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #b45309;">
          Bunyoro-Kitara Kingdom &bull; Ababwijwa Clan &bull; Kintu Family
        </span>
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #0f172a; margin: 6px 0 4px 0;">
          ${doc.title}
        </h1>
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          <strong>Date:</strong> ${doc.date} &bull; <strong>Venue:</strong> ${doc.venue || "Bunyoro"} &bull; <strong>Status:</strong> ${doc.status}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 18px; background-color: #fffbeb; border: 1px solid #fde68a;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #fde68a;"><strong>Chairperson:</strong> ${doc.chairperson || "Clan Elders"}</td>
          <td style="padding: 8px 12px; border: 1px solid #fde68a;"><strong>Recorded By:</strong> ${doc.recordedBy}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #fde68a;"><strong>Opening Prayer:</strong> ${doc.openingPrayer || "Observed"}</td>
          <td style="padding: 8px 12px; border: 1px solid #fde68a;"><strong>Closing Prayer:</strong> ${doc.closingPrayer || "Observed"}</td>
        </tr>
      </table>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
          Executive Summary &amp; Historical Context
        </h3>
        <p style="font-size: 12px; line-height: 1.6; color: #334155;">${doc.summary}</p>
      </div>

      <div style="display: flex; gap: 20px; margin-bottom: 18px;">
        <div style="flex: 1;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
            Meeting Agenda
          </h3>
          <ul style="font-size: 11px; padding-left: 18px; margin: 0; line-height: 1.5; color: #334155;">
            ${agendaHTML}
          </ul>
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
            Key Discussions &amp; Deliberations
          </h3>
          <ul style="font-size: 11px; padding-left: 18px; margin: 0; line-height: 1.5; color: #334155;">
            ${discHTML}
          </ul>
        </div>
      </div>

      <div style="margin-bottom: 20px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px;">
        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #065f46; margin: 0 0 8px 0;">
          Official Approved Resolutions &amp; Directives
        </h3>
        <ul style="font-size: 11px; padding-left: 18px; margin: 0; line-height: 1.5;">
          ${resHTML}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
          Registered Attendees &amp; Family Representatives (${attendees.length})
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          ${attendeesHTML}
        </div>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 10px; color: #94a3b8;">
        Official Clan Minutes Record &bull; Certified by Kintu Family Council Secretariat &bull; Exported on ${exportDate}
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(docHTML);
  printWindow.document.close();
}

/* -------------------------------------------------------
   7. PDF EXPORT OF COMPLETE FAMILY REGISTRY & MINUTES
------------------------------------------------------- */
function downloadFamilyPDF() {
  const members = appData.members || [];
  const minutes = appData.minutes || [];
  const exportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups in your browser to view and download the official PDF registry.");
    return;
  }

  let generationsHTML = "";
  for (let g = 1; g <= 8; g++) {
    const meta = GENERATION_METADATA[g];
    const genList = members.filter(m => (m.generation || 1) === g);
    if (!genList.length) continue;

    generationsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 4px; margin-bottom: 8px;">
          ${meta.title} (${genList.length} Relatives)
        </h3>
        <p style="font-size: 11px; color: #64748b; margin-top: 0; margin-bottom: 12px; font-style: italic;">
          ${meta.era} &mdash; ${meta.desc}
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">#</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Full Name</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Empaako</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Birth/Death</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Location</th>
              <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Children Recorded</th>
            </tr>
          </thead>
          <tbody>
            ${genList.map((m, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 5px 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 30px;">${idx + 1}</td>
                <td style="padding: 5px 8px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${m.firstName} ${m.lastName}</td>
                <td style="padding: 5px 8px; border: 1px solid #e2e8f0; color: #b45309; font-weight: bold;">${m.empaako ? `"${m.empaako}"` : "&mdash;"}</td>
                <td style="padding: 5px 8px; border: 1px solid #e2e8f0; color: #475569;">${m.isDeceased ? `${m.birthYear || "?"} - ${m.deathYear || "Passed"}` : `b. ${m.birthYear || "?"}`}</td>
                <td style="padding: 5px 8px; border: 1px solid #e2e8f0; color: #475569;">${m.location || "Bunyoro-Kitara"}</td>
                <td style="padding: 5px 8px; border: 1px solid #e2e8f0; color: #475569;">${m.childrenIds ? m.childrenIds.length : 0}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  let minutesHTML = "";
  minutes.forEach((doc) => {
    const attendees = doc.attendees || [];
    const agendaList = (doc.agenda && doc.agenda.length) 
      ? doc.agenda.map((a, i) => `<li style="margin-bottom: 4px;"><strong>${i+1}.</strong> ${a}</li>`).join("")
      : "<li>Clan lineage preservation & agenda.</li>";
    const resList = (doc.resolutions && doc.resolutions.length)
      ? doc.resolutions.map(r => `<li style="margin-bottom: 4px; color: #065f46; font-weight: 600;">&bull; ${r}</li>`).join("")
      : "<li>Resolutions endorsed by family council.</li>";
    const attendeesSample = attendees.slice(0, 30).map((a, i) => {
      const text = typeof a === "string" ? a : `${a.name}${a.phone ? ` (${a.phone})` : ""}`;
      return `<span style="display: inline-block; margin: 2px 4px; padding: 2px 6px; background-color: #f1f5f9; border-radius: 4px; font-size: 9px;">${i+1}. ${text}</span>`;
    }).join("");
    const moreAttendees = attendees.length > 30 ? `<span style="font-size: 9px; color: #64748b; font-style: italic;">...and ${attendees.length - 30} more registered attendees.</span>` : "";

    minutesHTML += `
      <div style="margin-bottom: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
          <strong style="color: #92400e; text-transform: uppercase;">${doc.category}</strong>
          <span style="color: #64748b;">${doc.date} &bull; ${doc.status}</span>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: bold; color: #0f172a; margin: 4px 0 6px 0;">${doc.title}</h3>
        <p style="font-size: 11px; color: #475569; margin: 2px 0 8px 0;">
          <strong>Venue:</strong> ${doc.venue || "Bunyoro-Kitara"} &bull; 
          <strong>Chairperson:</strong> ${doc.chairperson || "Council of Elders"} &bull; 
          <strong>Recorded by:</strong> ${doc.recordedBy}
        </p>
        <p style="font-size: 11px; color: #334155; line-height: 1.5; margin: 0 0 10px 0;">${doc.summary}</p>
        
        <div style="margin-bottom: 10px;">
          <strong style="font-size: 10px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Key Agenda &amp; Deliberations:</strong>
          <ul style="font-size: 10px; margin: 0; padding-left: 16px; color: #334155;">${agendaList}</ul>
        </div>

        <div style="margin-bottom: 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px 12px;">
          <strong style="font-size: 10px; text-transform: uppercase; color: #065f46; display: block; margin-bottom: 4px;">Approved Resolutions &amp; Directives:</strong>
          <ul style="font-size: 10px; margin: 0; padding-left: 16px;">${resList}</ul>
        </div>

        <div>
          <strong style="font-size: 10px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Registered Attendees (${attendees.length}):</strong>
          <div>${attendeesSample} ${moreAttendees}</div>
        </div>
      </div>
    `;
  });

  const fullDocumentHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kintu Family Heritage Registry &amp; Minutes Book</title>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 24px; background: #ffffff; }
        @media print { body { padding: 12px; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; padding: 12px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
        <span style="font-weight: bold; font-size: 13px; color: #92400e;">Official Clan Documentation Export</span>
        <button onclick="window.print()" style="margin-left: 14px; padding: 6px 16px; background-color: #b45309; color: #ffffff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Print or Save as PDF
        </button>
      </div>
      <div style="text-align: center; border-bottom: 3px double #b45309; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #b45309;">
          Bunyoro-Kitara Kingdom &bull; Western Uganda
        </span>
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #0f172a; margin: 6px 0 4px 0;">
          The Kintu Family Heritage Registry &amp; Lineage Record
        </h1>
        <p style="font-size: 13px; font-style: italic; color: #475569; margin: 0 0 6px 0;">
          "Obumu n'Engeso Nungi: Amabara g'Ekika Tegabura"
        </p>
        <p style="font-size: 11px; color: #64748b; margin: 0;">
          Official Clan Registry Preserving <strong>${members.length} Documented Relatives</strong> across 8 Generations &bull; Exported on ${exportDate}
        </p>
      </div>
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
        <strong style="color: #92400e; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">
          Historical Citation: Endugiiro yoruganda rwaba - Isiitwe: Ababwijwa (1986)
        </strong>
        <p style="font-size: 11px; color: #334155; margin: 0; line-height: 1.45;">
          Recorded in 1986 by clan historians <strong>Mr. Mbabazi Twesige Tadeo (Amooti)</strong> and <strong>Mr. Katotera Jonathan Biferamunda (Akiiki)</strong>. Preserving ancestral roots from patriarch Banjwa, through the elders, patriarchs, clan fathers, and modern descendants.
        </p>
      </div>
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #0f172a; margin-bottom: 16px;">
        Generational Directory of All Family Members (Gen 1 &ndash; Gen 8)
      </h2>
      ${generationsHTML}
      <div style="margin-top: 32px; page-break-before: always;">
        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #0f172a; border-bottom: 2px solid #b45309; padding-bottom: 6px; margin-bottom: 16px;">
          Family Assembly Minutes &amp; Council Resolutions
        </h2>
        ${minutesHTML}
      </div>
      <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        &copy; 2026 The Kintu Family Lineage &bull; Bunyoro-Kitara Kingdom &bull; Official Digital Heritage Archive
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(fullDocumentHTML);
  printWindow.document.close();
}

/* -------------------------------------------------------
   8. GALLERY & PHOTO ARCHIVE
------------------------------------------------------- */
function initGallery() {
  renderGalleryItems("all");

  document.querySelectorAll(".gallery-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gallery-filter-btn").forEach((b) => {
        b.classList.remove("bg-amber-700", "text-white", "font-bold");
        b.classList.add("bg-slate-100", "text-slate-700", "font-semibold");
      });
      btn.classList.add("bg-amber-700", "text-white", "font-bold");
      btn.classList.remove("bg-slate-100", "text-slate-700", "font-semibold");
      renderGalleryItems(btn.dataset.cat);
    });
  });

  const fileInput = document.getElementById("archivePhotoFileInput");
  const chooseBtn = document.getElementById("btnChooseArchivePhoto");
  const removeBtn = document.getElementById("btnRemoveArchivePhoto");
  const previewImg = document.getElementById("archivePhotoPreview");
  const placeholder = document.getElementById("archivePhotoPlaceholder");
  let archiveBase64 = "";

  if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressed = await compressImage(file, 900, 0.85);
        archiveBase64 = compressed;
        if (previewImg) {
          previewImg.src = compressed;
          previewImg.classList.remove("hidden");
        }
        if (placeholder) placeholder.classList.add("hidden");
        if (removeBtn) removeBtn.classList.remove("hidden");
      } catch (err) {
        alert("Could not process picture.");
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      archiveBase64 = "";
      if (fileInput) fileInput.value = "";
      if (previewImg) {
        previewImg.src = "";
        previewImg.classList.add("hidden");
      }
      if (placeholder) placeholder.classList.remove("hidden");
      removeBtn.classList.add("hidden");
    });
  }

  const form = document.getElementById("addPhotoForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("photoTitle").value.trim();
      const urlInput = document.getElementById("photoUrl")?.value.trim() || "";
      const isSlideshow = document.getElementById("photoIsSlideshow")?.checked || false;
      const image = archiveBase64 || urlInput;
      if (!title || !image) {
        alert("Please select a photo or enter an image URL.");
        return;
      }
      const newPhoto = {
        id: `img-${Date.now()}`,
        title,
        category: document.getElementById("photoCategory").value,
        year: document.getElementById("photoYear").value.trim() || String(new Date().getFullYear()),
        image,
        caption: document.getElementById("photoCaption").value.trim(),
        isSlideshow: Boolean(isSlideshow)
      };

      const btn = document.getElementById("btnSubmitArchivePhoto");
      btn.innerHTML = "Saving to archive...";
      btn.disabled = true;

      appData.gallery.push(newPhoto);
      saveFamilyData(appData);
      await savePhotoToDB(newPhoto);

      btn.innerHTML = "Save Photo to Archive";
      btn.disabled = false;

      renderGalleryItems("all");
      // If photo is marked for slideshow, refresh slideshow immediately!
      if (isSlideshow) {
        initHeroSlideshow();
      }

      document.getElementById("addPhotoModal").classList.add("hidden");
      form.reset();
      archiveBase64 = "";
      if (previewImg) previewImg.classList.add("hidden");
      if (placeholder) placeholder.classList.remove("hidden");
      if (removeBtn) removeBtn.classList.add("hidden");
      alert(isSlideshow ? "Photo added to archive and featured on the Hero Slideshow!" : "Photo contributed to the family archive!");
    });
  }
}

function renderGalleryItems(category) {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  if (!appData.gallery || !appData.gallery.length) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h4 class="text-base font-bold text-slate-900 mb-1">Gallery Ready for Memories</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto mb-4">No photos uploaded yet. Be the first to contribute a family moment.</p>
        <button onclick="document.getElementById('addPhotoModal').classList.remove('hidden')" class="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold shadow-sm transition">
          Upload First Photo
        </button>
      </div>
    `;
    return;
  }

  const items = category === "all" ? appData.gallery : appData.gallery.filter((g) => g.category.toLowerCase() === category.toLowerCase());
  grid.innerHTML = items.map((img) => `
    <div class="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm aspect-[4/3] cursor-pointer hover:border-amber-400 transition" onclick="openLightbox('${img.image}','${img.title.replace(/'/g, "\\'")}','${(img.caption || "").replace(/'/g, "\\'")}','${img.year}')">
      <img src="${img.image}" alt="${img.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-4 flex flex-col justify-end">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-800 shadow-sm">${img.category}</span>
          <span class="text-[11px] text-amber-300 font-bold">${img.year}</span>
        </div>
        <h5 class="text-sm font-bold text-white truncate">${img.title}</h5>
        <p class="text-xs text-slate-200 line-clamp-1">${img.caption || ""}</p>
      </div>
    </div>
  `).join("");
}

function openLightbox(src, title, caption, year) {
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightboxTitle").textContent = title;
  document.getElementById("lightboxCaption").textContent = caption || "";
  document.getElementById("lightboxYear").textContent = year || "";
  document.getElementById("lightboxModal").classList.remove("hidden");
}

/* -------------------------------------------------------
   9. TIMELINE, MEMORIAL, DIRECTORY & REUNION
------------------------------------------------------- */
function initHistoryTimeline() {
  const c = document.getElementById("timelineList");
  if (!c) return;
  c.innerHTML = appData.timeline.map((item) => `
    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
      <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-600 bg-white group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
        <span class="text-xs font-bold">${item.year.slice(-2)}</span>
      </div>
      <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm group-hover:border-amber-400 transition">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">${item.year}</span>
          <span class="text-[11px] text-slate-500 font-semibold">${item.category}</span>
        </div>
        <h4 class="text-base font-bold text-slate-900 mb-1.5 font-serif-royal">${item.title}</h4>
        <p class="text-xs text-slate-600 leading-relaxed">${item.description}</p>
      </div>
    </div>
  `).join("");
}

function initMemorialWall() {
  const c = document.getElementById("memorialGrid");
  if (!c) return;
  const deceased = appData.members.filter((m) => m.isDeceased);

  if (!deceased.length) {
    c.innerHTML = `
      <div class="col-span-full text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h4 class="text-base font-bold text-slate-900 mb-1">In Memory of Departed Elders</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto mb-4">Departed forebears will appear here when recorded with "Deceased" checked.</p>
      </div>
    `;
    return;
  }

  c.innerHTML = deceased.map((m) => `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-amber-300 transition shadow-sm group">
      <div>
        <div class="flex items-center gap-4 mb-4">
          ${m.photo ? `
            <img src="${m.photo}" class="w-16 h-16 rounded-full object-cover border-2 border-slate-300 grayscale group-hover:grayscale-0 transition duration-500 shadow-sm">
          ` : `
            <div class="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm">
              ${m.firstName[0]}
            </div>
          `}
          <div>
            <h4 class="text-base font-bold text-slate-900 font-serif-royal">${m.firstName} ${m.lastName}</h4>
            <p class="text-xs text-amber-800 font-bold">${m.birthYear || ""} &ndash; ${m.deathYear || "Passed"}</p>
            ${m.empaako ? `<p class="text-[11px] text-slate-600 font-semibold">Empaako: "${m.empaako}"</p>` : ""}
            <p class="text-xs text-slate-500">${m.location || "Bunyoro-Kitara"}</p>
          </div>
        </div>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>In Perpetual Memory</span>
        <span class="text-amber-800 font-bold">Kintu Lineage</span>
      </div>
    </div>
  `).join("");
}

function initDirectory() {
  const grid = document.getElementById("directoryGrid");
  const si = document.getElementById("directorySearch");
  const rf = document.getElementById("directoryRoleFilter");

  function render(list) {
    if (!grid) return;
    document.getElementById("directoryTotalCount").textContent = `${list.length} Relatives Recorded`;
    if (!list.length) {
      grid.innerHTML = `
        <div class="col-span-full p-8 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <p class="text-xs text-slate-500 mb-3">No relatives found matching your filter.</p>
          <button onclick="document.getElementById('btnOpenAddMember').click()" class="text-xs text-amber-700 font-bold underline">Add a Member &rarr;</button>
        </div>
      `;
      return;
    }
    grid.innerHTML = list.map((m) => `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between" onclick="openMemberModalById('${m.id}')">
        <div>
          <div class="flex items-start gap-3 mb-2.5">
            ${m.photo ? `
              <img src="${m.photo}" class="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0">
            ` : `
              <div class="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-base shadow-sm shrink-0">
                ${m.firstName[0]}
              </div>
            `}
            <div class="min-w-0 flex-1">
              <h5 class="text-sm font-bold text-slate-900 truncate font-serif-royal">${m.firstName} ${m.lastName}</h5>
              ${m.empaako ? `<span class="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">"${m.empaako}"</span>` : ""}
              <p class="text-[11px] text-slate-500 mt-1">Generation ${m.generation || 1}</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-600 truncate flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${m.location || "Bunyoro-Kitara"}</span>
          </p>
        </div>
        <div class="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span class="text-slate-500">${m.childrenIds ? m.childrenIds.length : 0} children</span>
          <span class="text-amber-700 font-bold">Details &rarr;</span>
        </div>
      </div>
    `).join("");
  }

  function filterAndRender() {
    const q = si ? si.value.trim().toLowerCase() : "";
    const role = rf ? rf.value : "all";
    let list = appData.members || [];
    if (role !== "all") list = list.filter((m) => String(m.generation) === String(role));
    if (q) {
      list = list.filter((m) =>
        (m.firstName && m.firstName.toLowerCase().includes(q)) ||
        (m.lastName && m.lastName.toLowerCase().includes(q)) ||
        (m.empaako && m.empaako.toLowerCase().includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q))
      );
    }
    render(list);
  }

  if (si) si.addEventListener("input", filterAndRender);
  if (rf) rf.addEventListener("change", filterAndRender);
  filterAndRender();
}

function initReunion() {
  fetchRsvpTotal().then((total) => {
    if (total > 0) {
      const el = document.getElementById("rsvpConfirmedNumber");
      if (el) el.textContent = total;
    }
  });

  const f = document.getElementById("reunionRsvpForm");
  if (f) {
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("rsvpName").value.trim();
      const branch = document.getElementById("rsvpBranch").value.trim();
      const count = parseInt(document.getElementById("rsvpCount").value) || 1;
      const total = await submitRsvpToDB(name, branch, count);
      if (total !== null) {
        const el = document.getElementById("rsvpConfirmedNumber");
        if (el) el.textContent = total;
      }
      alert(`Thank you, ${name}! RSVP for ${count} guest(s) recorded in real time.`);
      f.reset();
    });
  }
}

/* -------------------------------------------------------
   10. REAL-TIME SYNCHRONIZATION ENGINE
------------------------------------------------------- */
function startRealtimeSync() {
  if (realtimeSyncTimer) clearInterval(realtimeSyncTimer);

  // Background polling every 8 seconds
  realtimeSyncTimer = setInterval(async () => {
    if (document.visibilityState === "visible") {
      await syncFromDB(true);
    }
  }, 8000);

  // Immediate sync when tab regains focus
  window.addEventListener("focus", () => syncFromDB(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncFromDB(true);
  });
}

async function syncFromDB(isBackground = false) {
  if (isSyncing) return;
  isSyncing = true;

  const liveBadge = document.getElementById("liveSyncBadge");

  try {
    const [dbMembers, dbGallery, dbUpdates, dbRsvp] = await Promise.all([
      fetchMembersFromDB(),
      fetchGalleryFromDB(),
      fetchUpdatesFromDB(),
      fetchRsvpTotal()
    ]);

    let changed = false;

    // 1. Members
    if (dbMembers !== null) {
      const memberMap = new Map();
      (KINTU_INITIAL_DATA.members || []).forEach((m) => memberMap.set(m.id, { ...m }));
      dbMembers.forEach((m) => {
        if (memberMap.has(m.id)) {
          const initM = memberMap.get(m.id);
          const mergedChildren = Array.from(new Set([...(initM.childrenIds || []), ...(m.childrenIds || [])]));
          const mergedParents = Array.from(new Set([...(initM.parentIds || []), ...(m.parentIds || [])]));
          memberMap.set(m.id, {
            ...initM,
            ...m,
            childrenIds: mergedChildren,
            parentIds: mergedParents,
          });
        } else {
          memberMap.set(m.id, { ...m });
        }
      });
      const merged = Array.from(memberMap.values());

      if (merged.length !== appData.members.length || JSON.stringify(merged) !== JSON.stringify(appData.members)) {
        appData.members = merged;
        changed = true;
        if (dbMembers.length < KINTU_INITIAL_DATA.members.length) {
          saveMembersBatchToDB(KINTU_INITIAL_DATA.members).catch(console.warn);
        }
      }
    }

    // 2. Gallery
    if (dbGallery !== null && dbGallery.length > 0) {
      if (JSON.stringify(dbGallery) !== JSON.stringify(appData.gallery)) {
        appData.gallery = dbGallery;
        changed = true;
      }
    }

    // 3. Family Updates
    if (dbUpdates !== null && dbUpdates.length > 0) {
      if (JSON.stringify(dbUpdates) !== JSON.stringify(appData.updates)) {
        appData.updates = dbUpdates;
        changed = true;
        renderFamilyUpdates();
      }
    }

    // 4. RSVP Total
    if (dbRsvp > 0) {
      const rsvpEl = document.getElementById("rsvpConfirmedNumber");
      if (rsvpEl && rsvpEl.textContent !== String(dbRsvp)) {
        rsvpEl.textContent = dbRsvp;
      }
    }

    if (changed) {
      saveFamilyData(appData);
      renderGenerationContainers(currentSearchQuery, currentFilterGen);
      initDirectory();
      initMemorialWall();
      renderGalleryItems("all");
      updateHeroCount();
      initHeroSlideshow();
    }

    // Update live badge status
    if (liveBadge) {
      liveBadge.classList.remove("bg-amber-50", "text-amber-800", "border-amber-200");
      liveBadge.classList.add("bg-emerald-50", "text-emerald-800", "border-emerald-200");
    }
  } catch (err) {
    if (!isBackground) console.warn("Sync error:", err.message);
  } finally {
    isSyncing = false;
  }
}

function updateHeroCount() {
  const el = document.getElementById("heroMemberCount");
  if (el) el.textContent = appData.members.length;
}

/* -------------------------------------------------------
   11. ADD MEMBER FORM LOGIC
------------------------------------------------------- */
function initModalsAndForms() {
  const openAddBtn = document.getElementById("btnOpenAddMember");
  const openAddHeroBtn = document.getElementById("btnHeroAddMember");
  const openAddMobileBtn = document.getElementById("btnMobileAddMember");
  const addModal = document.getElementById("addMemberModal");
  const closeAddBtn = document.getElementById("btnCloseAddMember");

  const openAdd = () => {
    populateParentDropdowns();
    const title = document.getElementById("addMemberModalTitle");
    if (title) title.textContent = "Add Member to Family Records";
    addModal.classList.remove("hidden");
  };

  if (openAddBtn) openAddBtn.addEventListener("click", openAdd);
  if (openAddHeroBtn) openAddHeroBtn.addEventListener("click", openAdd);
  if (openAddMobileBtn) openAddMobileBtn.addEventListener("click", openAdd);
  if (closeAddBtn) closeAddBtn.addEventListener("click", () => addModal.classList.add("hidden"));

  window.addEventListener("click", (e) => {
    if (e.target === addModal) addModal.classList.add("hidden");
    const mm = document.getElementById("memberProfileModal");
    if (e.target === mm) mm.classList.add("hidden");
    const lb = document.getElementById("lightboxModal");
    if (e.target === lb) lb.classList.add("hidden");
    const pm = document.getElementById("addPhotoModal");
    if (e.target === pm) pm.classList.add("hidden");
    const um = document.getElementById("postUpdateModal");
    if (e.target === um) um.classList.add("hidden");
  });

  const decCheck = document.getElementById("regIsDeceased");
  const deathDiv = document.getElementById("deathYearField");
  if (decCheck && deathDiv) {
    decCheck.addEventListener("change", () => deathDiv.classList.toggle("hidden", !decCheck.checked));
  }

  // File Upload
  const fileInput = document.getElementById("regPhotoFileInput");
  const btnChoosePhoto = document.getElementById("btnChoosePhoto");
  const btnRemovePhoto = document.getElementById("btnRemovePhoto");
  const previewImg = document.getElementById("regPhotoPreview");
  const previewPlaceholder = document.getElementById("regPhotoPlaceholder");

  const resetPhotoUpload = () => {
    currentUploadedPhotoBase64 = "";
    if (fileInput) fileInput.value = "";
    if (previewImg) {
      previewImg.src = "";
      previewImg.classList.add("hidden");
    }
    if (previewPlaceholder) previewPlaceholder.classList.remove("hidden");
    if (btnRemovePhoto) btnRemovePhoto.classList.add("hidden");
  };

  if (btnChoosePhoto && fileInput) {
    btnChoosePhoto.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressedBase64 = await compressImage(file, 500, 0.82);
        currentUploadedPhotoBase64 = compressedBase64;
        if (previewImg) {
          previewImg.src = compressedBase64;
          previewImg.classList.remove("hidden");
        }
        if (previewPlaceholder) previewPlaceholder.classList.add("hidden");
        if (btnRemovePhoto) btnRemovePhoto.classList.remove("hidden");
      } catch (err) {
        alert("Could not process picture. Please try another image.");
      }
    });
  }

  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener("click", resetPhotoUpload);
  }

  const form = document.getElementById("addMemberForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pin = document.getElementById("regPin").value.trim();
      if (pin.toUpperCase() !== (appData.familyInfo?.familyPin || "KINTU2026")) {
        alert("Incorrect Family Passcode. Please enter KINTU2026.");
        return;
      }

      const firstName = document.getElementById("regFirstName").value.trim();
      const lastName = document.getElementById("regLastName").value.trim();
      if (!firstName || !lastName) {
        alert("Please enter first and last name.");
        return;
      }

      const empaako = document.getElementById("regEmpaako").value.trim();
      const gender = document.getElementById("regGender").value;
      const birthYear = parseInt(document.getElementById("regBirthYear").value) || 2000;
      const isDeceased = document.getElementById("regIsDeceased").checked;
      const deathYear = isDeceased ? parseInt(document.getElementById("regDeathYear").value) || null : null;
      const parentId = document.getElementById("regParent").value;
      const spouseId = document.getElementById("regSpouse").value;
      const address = document.getElementById("regAddress")?.value.trim() || "Bunyoro-Kitara, Uganda";
      const photo = currentUploadedPhotoBase64 || "";

      let generation = 1;
      if (parentId) {
        const p = appData.members.find((m) => m.id === parentId);
        if (p) generation = Math.min((p.generation || 1) + 1, 8);
      } else if (spouseId) {
        const s = appData.members.find((m) => m.id === spouseId);
        if (s) generation = s.generation || 1;
      }

      const newId = `member-${Date.now()}`;
      const newMember = {
        id: newId,
        firstName,
        lastName,
        empaako,
        traditionalName: empaako,
        gender,
        generation,
        birthYear,
        deathYear,
        isDeceased,
        branch: "Ababwijwa Lineage",
        location: address,
        country: "Uganda",
        occupation: "",
        bio: "",
        photo,
        parentIds: parentId ? [parentId] : [],
        spouseIds: spouseId ? [spouseId] : [],
        childrenIds: []
      };

      if (parentId) {
        const p = appData.members.find((m) => m.id === parentId);
        if (p) {
          if (!p.childrenIds) p.childrenIds = [];
          p.childrenIds.push(newId);
        }
      }
      if (spouseId) {
        const s = appData.members.find((m) => m.id === spouseId);
        if (s) {
          if (!s.spouseIds) s.spouseIds = [];
          if (!s.spouseIds.includes(newId)) s.spouseIds.push(newId);
        }
      }

      appData.members.push(newMember);
      saveFamilyData(appData);

      const submitBtn = document.getElementById("btnSubmitAddMember");
      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Saving to database...";
      submitBtn.disabled = true;

      await saveMemberToDB(newMember);

      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;

      addModal.classList.add("hidden");
      form.reset();
      resetPhotoUpload();
      deathDiv?.classList.add("hidden");

      renderGenerationContainers(currentSearchQuery, currentFilterGen);
      initDirectory();
      initMemorialWall();
      updateHeroCount();
      fireCelebrationConfetti();

      setTimeout(() => alert(`${firstName} ${lastName} added to the Kintu family registry in real time!`), 250);
    });
  }
}

function populateParentDropdowns() {
  const ps = document.getElementById("regParent");
  const ss = document.getElementById("regSpouse");
  const pn = document.getElementById("regParentNotice");
  if (!ps) return;

  ps.innerHTML = '<option value="">-- None (Root Member / G1) --</option>';
  if (ss) ss.innerHTML = '<option value="">-- None / Unmarried --</option>';

  appData.members.forEach((m) => {
    const label = `${m.firstName} ${m.lastName} (Gen ${m.generation}${m.empaako ? ` - "${m.empaako}"` : ""})`;
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = label;
    ps.appendChild(o);
    if (ss) {
      const os = document.createElement("option");
      os.value = m.id;
      os.textContent = label;
      ss.appendChild(os);
    }
  });

  if (pn) pn.textContent = "Select parent in tree. Generation is set automatically.";
}

/* -------------------------------------------------------
   12. UTILITIES, IMAGE COMPRESSION & CONFETTI
------------------------------------------------------- */
function compressImage(file, maxDimension = 500, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function initThemeAndScroll() {
  initScrollAnimations();
  updateHeroCount();
  const mb = document.getElementById("mobileMenuBtn");
  const mn = document.getElementById("mobileNav");
  if (mb && mn) {
    mb.addEventListener("click", () => mn.classList.toggle("hidden"));
    mn.querySelectorAll("a").forEach((l) => l.addEventListener("click", () => mn.classList.add("hidden")));
  }
  const rb = document.getElementById("btnResetDatabase");
  if (rb) {
    rb.addEventListener("click", () => {
      if (confirm("Reset local cache to default historical records? DB records remain intact.")) {
        resetFamilyDataToDefault();
        location.reload();
      }
    });
  }
}

function initScrollAnimations() {
  const els = document.querySelectorAll(".reveal-fade-up,.reveal-fade-left,.reveal-fade-right,.reveal-zoom-in");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("reveal-visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => obs.observe(el));
}

function fireCelebrationConfetti() {
  if (typeof confetti === "function") {
    confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 }, colors: ["#d97706", "#ffffff", "#fbbf24"] });
    setTimeout(() => {
      confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#d97706", "#fbbf24"] });
      confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#d97706", "#fbbf24"] });
    }, 280);
  }
}
