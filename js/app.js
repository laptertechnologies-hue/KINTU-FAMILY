/**
 * KINTU FAMILY WEBSITE - MAIN CONTROLLER
 * Bunyoro-Kitara Cultural Lineage & Living Archive
 * Database: Neon (PostgreSQL) via Vercel Serverless API
 */

let appData = null;
let treeEngine = null;
let selectedMember = null;

document.addEventListener("DOMContentLoaded", async () => {
  appData = getFamilyData();
  initTree();
  initHistoryTimeline();
  initMemorialWall();
  initGallery();
  initDirectory();
  initReunion();
  initModalsAndForms();
  initThemeAndScroll();
  await syncFromDB();
  console.log("Kintu Family Heritage Portal initialized.");
});

async function syncFromDB() {
  const [dbMembers, dbGallery] = await Promise.all([fetchMembersFromDB(), fetchGalleryFromDB()]);
  let changed = false;
  if (dbMembers !== null && dbMembers.length > 0) { appData.members = dbMembers; changed = true; }
  if (dbGallery !== null && dbGallery.length > 0) { appData.gallery = dbGallery; changed = true; }
  if (changed) {
    saveFamilyData(appData);
    treeEngine.setData(appData);
    initDirectory(); initMemorialWall(); renderGalleryItems("all"); updateHeroCount();
  }
  const rsvpTotal = await fetchRsvpTotal();
  const rsvpEl = document.getElementById("rsvpConfirmedNumber");
  if (rsvpEl && rsvpTotal > 0) rsvpEl.textContent = rsvpTotal;
}
/* TREE */
function initTree() {
  treeEngine = new FamilyTreeEngine("treeContainer", { onNodeClick: (m) => openMemberModal(m) });
  treeEngine.setData(appData);
  const si = document.getElementById("treeSearchInput");
  const sr = document.getElementById("treeSearchResults");
  if (si && sr) {
    si.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q || !appData.members.length) { sr.classList.add("hidden"); return; }
      const matches = appData.members.filter(m =>
        (m.firstName && m.firstName.toLowerCase().includes(q)) ||
        (m.lastName && m.lastName.toLowerCase().includes(q)) ||
        (m.empaako && m.empaako.toLowerCase().includes(q)) ||
        (m.occupation && m.occupation.toLowerCase().includes(q))
      ).slice(0, 6);
      sr.innerHTML = matches.length === 0
        ? `<div class="p-3 text-xs text-slate-400">No relatives found for "${q}"</div>`
        : matches.map(m => `
            <div class="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-b border-slate-700/40 last:border-0" data-member-id="${m.id}">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold">
                  ${m.photo ? `<img src="${m.photo}" class="w-7 h-7 rounded-md object-cover">` : m.firstName[0]}
                </div>
                <div>
                  <div class="text-xs font-semibold text-white">${m.firstName} ${m.lastName}</div>
                  <div class="text-[10px] text-amber-500">Gen ${m.generation} &bull; ${m.branch || "Lineage"}</div>
                </div>
              </div>
              <span class="text-[10px] text-slate-400">Jump &rarr;</span>
            </div>`).join("");
      sr.querySelectorAll("[data-member-id]").forEach(el =>
        el.addEventListener("click", () => {
          treeEngine.focusOnMember(el.dataset.memberId);
          sr.classList.add("hidden"); si.value = "";
        })
      );
      sr.classList.remove("hidden");
    });
    document.addEventListener("click", (e) => { if (!si.contains(e.target) && !sr.contains(e.target)) sr.classList.add("hidden"); });
  }
  document.querySelectorAll(".filter-gen-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-gen-btn").forEach(b => { b.classList.remove("bg-amber-600","text-white"); b.classList.add("bg-slate-800","text-slate-300"); });
      btn.classList.add("bg-amber-600","text-white"); btn.classList.remove("bg-slate-800","text-slate-300");
      treeEngine.setFilters(btn.dataset.gen, document.getElementById("branchSelectFilter")?.value || "all");
    });
  });
  const bs = document.getElementById("branchSelectFilter");
  if (bs) { updateBranchDropdown(bs); bs.addEventListener("change", () => { const a = document.querySelector(".filter-gen-btn.bg-amber-600"); treeEngine.setFilters(a ? a.dataset.gen : "all", bs.value); }); }
}
function updateBranchDropdown(sel) {
  if (!sel) return;
  const branches = [...new Set(appData.members.map(m => m.branch).filter(Boolean))];
  sel.innerHTML = '<option value="all">All Lineage Branches</option>';
  branches.forEach(b => { const o = document.createElement("option"); o.value = b; o.textContent = b; sel.appendChild(o); });
}

/* TIMELINE */
function initHistoryTimeline() {
  const c = document.getElementById("timelineList"); if (!c) return;
  c.innerHTML = appData.timeline.map(item => `
    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
      <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-600 bg-slate-900 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
        <span class="text-xs font-bold">${item.year.slice(-2)}</span>
      </div>
      <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-slate-900 border border-slate-700/60 shadow group-hover:border-amber-600/40 transition">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-600/15 border border-amber-600/30 text-amber-500">${item.year}</span>
          <span class="text-[11px] text-slate-400 font-medium">${item.category}</span>
        </div>
        <h4 class="text-base font-semibold text-white mb-1.5">${item.title}</h4>
        <p class="text-xs text-slate-400 leading-relaxed">${item.description}</p>
      </div>
    </div>`).join("");
}

/* MEMORIAL */
function initMemorialWall() {
  const c = document.getElementById("memorialGrid"); if (!c) return;
  const deceased = appData.members.filter(m => m.isDeceased);
  if (!deceased.length) {
    c.innerHTML = `<div class="col-span-full text-center py-12 px-4 bg-slate-900 rounded-2xl border border-slate-800">
      <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h4 class="text-base font-bold text-white mb-1">In Memory of Departed Elders</h4>
      <p class="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">Departed ancestors will appear here when added to the tree with "Deceased" checked.</p>
      <button onclick="document.getElementById('btnOpenAddMember').click()" class="text-xs text-amber-500 hover:text-amber-400 underline font-semibold">Add an Ancestor &rarr;</button>
    </div>`; return;
  }
  c.innerHTML = deceased.map(m => `
    <div class="bg-slate-900 rounded-2xl border border-slate-700/60 p-6 flex flex-col justify-between hover:border-slate-600 transition group">
      <div>
        <div class="flex items-center gap-4 mb-4">
          ${m.photo ? `<img src="${m.photo}" class="w-16 h-16 rounded-full object-cover border-2 border-slate-600 grayscale group-hover:grayscale-0 transition duration-500">` : `<div class="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg">${m.firstName[0]}</div>`}
          <div>
            <h4 class="text-base font-bold text-white">${m.firstName} ${m.lastName}</h4>
            <p class="text-xs text-amber-500 font-medium">${m.birthYear || ""} &ndash; ${m.deathYear || "Passed"}</p>
            ${m.empaako ? `<p class="text-[11px] text-slate-400">Empaako: ${m.empaako}</p>` : ""}
            <p class="text-xs text-slate-400">${m.occupation || "Elder"}</p>
          </div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">${m.bio || "Remembered with love by the Kintu family."}</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>In Perpetual Memory</span><span class="text-amber-500 font-medium">Kintu Family</span>
      </div>
    </div>`).join("");
}

/* GALLERY */
function initGallery() {
  renderGalleryItems("all");
  document.querySelectorAll(".gallery-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gallery-filter-btn").forEach(b => { b.classList.remove("bg-slate-600","text-white"); b.classList.add("bg-slate-800","text-slate-300"); });
      btn.classList.add("bg-slate-600","text-white"); btn.classList.remove("bg-slate-800","text-slate-300");
      renderGalleryItems(btn.dataset.cat);
    });
  });
  const pf = document.getElementById("addPhotoForm");
  if (pf) {
    pf.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("photoTitle").value.trim();
      const image = document.getElementById("photoUrl").value.trim();
      if (!title || !image) { alert("Please provide a photo title and image URL."); return; }
      const newPhoto = { id: `img-${Date.now()}`, title, category: document.getElementById("photoCategory").value, year: document.getElementById("photoYear").value.trim() || String(new Date().getFullYear()), image, caption: document.getElementById("photoCaption").value.trim() };
      appData.gallery.push(newPhoto); saveFamilyData(appData);
      await savePhotoToDB(newPhoto);
      renderGalleryItems("all"); document.getElementById("addPhotoModal").classList.add("hidden"); pf.reset();
      alert("Photo added to the family archive!");
    });
  }
}
function renderGalleryItems(category) {
  const grid = document.getElementById("galleryGrid"); if (!grid) return;
  if (!appData.gallery.length) {
    grid.innerHTML = `<div class="col-span-full text-center py-16 px-4 bg-slate-900 rounded-2xl border border-slate-800">
      <div class="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-3">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      </div>
      <h4 class="text-base font-bold text-white mb-1">Gallery Ready for Photos</h4>
      <p class="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">No photos yet. Upload ancestral portraits, celebrations, and family moments.</p>
      <button onclick="document.getElementById('addPhotoModal').classList.remove('hidden')" class="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition">Upload First Photo</button>
    </div>`; return;
  }
  const items = category === "all" ? appData.gallery : appData.gallery.filter(g => g.category.toLowerCase() === category.toLowerCase());
  grid.innerHTML = items.map(img => `
    <div class="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 aspect-[4/3] cursor-pointer hover:border-slate-500 transition duration-300" onclick="openLightbox('${img.image}','${img.title}','${img.caption}','${img.year}')">
      <img src="${img.image}" alt="${img.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">${img.category}</span>
          <span class="text-[11px] text-amber-500 font-semibold">${img.year}</span>
        </div>
        <h5 class="text-sm font-bold text-white truncate">${img.title}</h5>
        <p class="text-xs text-slate-300 line-clamp-1">${img.caption || ""}</p>
      </div>
    </div>`).join("");
}
function openLightbox(src, title, caption, year) {
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightboxTitle").textContent = title;
  document.getElementById("lightboxCaption").textContent = caption || "";
  document.getElementById("lightboxYear").textContent = year || "";
  document.getElementById("lightboxModal").classList.remove("hidden");
}

/* DIRECTORY */
function initDirectory() {
  const grid = document.getElementById("directoryGrid");
  const si = document.getElementById("directorySearch");
  const rs = document.getElementById("directoryRoleFilter");
  function render(list) {
    if (!grid) return;
    document.getElementById("directoryTotalCount").textContent = `${list.length} Relatives Recorded`;
    if (!list.length) { grid.innerHTML = `<div class="col-span-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center"><p class="text-xs text-slate-400 mb-3">No relatives yet.</p><button onclick="document.getElementById('btnOpenAddMember').click()" class="text-xs text-amber-500 font-semibold underline">Add a Member &rarr;</button></div>`; return; }
    grid.innerHTML = list.map(m => `
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between">
        <div>
          <div class="flex items-start gap-3 mb-3">
            ${m.photo ? `<img src="${m.photo}" class="w-14 h-14 rounded-xl object-cover border border-slate-700">` : `<div class="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg">${m.firstName[0]}</div>`}
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-white truncate">${m.firstName} ${m.lastName}</h4>
              ${m.empaako ? `<p class="text-xs text-amber-500 font-medium">"${m.empaako}"</p>` : ""}
              <p class="text-xs text-slate-300 font-medium truncate mt-0.5">${m.occupation || "Family Member"}</p>
              <p class="text-[11px] text-slate-500 truncate">${m.location || "Location Not Specified"}</p>
            </div>
          </div>
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">${m.bio || "Proud member of the Kintu family."}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">Gen ${m.generation} &bull; ${m.branch || "Lineage"}</span>
          <button class="text-xs text-amber-500 hover:text-amber-400 font-semibold" onclick="viewMemberDetail('${m.id}')">View Profile &rarr;</button>
        </div>
      </div>`).join("");
  }
  function filter() {
    const q = (si?.value || "").toLowerCase().trim();
    const role = (rs?.value || "all").toLowerCase();
    render(appData.members.filter(m => {
      const t = `${m.firstName} ${m.lastName} ${m.empaako||""} ${m.location||""} ${m.occupation||""}`.toLowerCase();
      return t.includes(q) && (role === "all" || (m.occupation && m.occupation.toLowerCase().includes(role)));
    }));
  }
  if (si) si.addEventListener("input", filter);
  if (rs) rs.addEventListener("change", filter);
  render(appData.members);
}
function viewMemberDetail(id) {
  const m = appData.members.find(m => m.id === id);
  if (m) { openMemberModal(m); document.getElementById("treeSection")?.scrollIntoView({behavior:"smooth"}); treeEngine.focusOnMember(id); }
}

/* REUNION RSVP */
function initReunion() {
  fetchRsvpTotal().then(total => { if (total > 0) { const el = document.getElementById("rsvpConfirmedNumber"); if (el) el.textContent = total; } });
  const f = document.getElementById("reunionRsvpForm");
  if (f) {
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("rsvpName").value.trim();
      const branch = document.getElementById("rsvpBranch").value.trim();
      const count = parseInt(document.getElementById("rsvpCount").value) || 1;
      const total = await submitRsvpToDB(name, branch, count);
      if (total !== null) { const el = document.getElementById("rsvpConfirmedNumber"); if (el) el.textContent = total; }
      alert(`Thank you, ${name}! RSVP for ${count} guest(s) recorded.`);
      f.reset();
    });
  }
}

/* ADD MEMBER FORM (single form, no wizard) */
function initModalsAndForms() {
  const openAddBtn = document.getElementById("btnOpenAddMember");
  const openAddHeroBtn = document.getElementById("btnHeroAddMember");
  const addModal = document.getElementById("addMemberModal");
  const closeAddBtn = document.getElementById("btnCloseAddMember");
  const openAdd = () => { populateParentDropdowns(); addModal.classList.remove("hidden"); };
  if (openAddBtn) openAddBtn.addEventListener("click", openAdd);
  if (openAddHeroBtn) openAddHeroBtn.addEventListener("click", openAdd);
  if (closeAddBtn) closeAddBtn.addEventListener("click", () => addModal.classList.add("hidden"));
  window.addEventListener("click", (e) => {
    if (e.target === addModal) addModal.classList.add("hidden");
    const mm = document.getElementById("memberProfileModal"); if (e.target === mm) mm.classList.add("hidden");
    const lb = document.getElementById("lightboxModal"); if (e.target === lb) lb.classList.add("hidden");
    const pm = document.getElementById("addPhotoModal"); if (e.target === pm) pm.classList.add("hidden");
  });
  const decCheck = document.getElementById("regIsDeceased");
  const deathDiv = document.getElementById("deathYearField");
  if (decCheck && deathDiv) decCheck.addEventListener("change", () => deathDiv.classList.toggle("hidden", !decCheck.checked));

  const form = document.getElementById("addMemberForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pin = document.getElementById("regPin").value.trim();
      if (pin.toUpperCase() !== (appData.familyInfo?.familyPin || "KINTU2026")) {
        alert("Incorrect Family Passcode."); return;
      }
      const firstName = document.getElementById("regFirstName").value.trim();
      const lastName = document.getElementById("regLastName").value.trim();
      if (!firstName || !lastName) { alert("Please enter first and last name."); return; }
      const empaako = document.getElementById("regEmpaako").value.trim();
      const gender = document.getElementById("regGender").value;
      const birthYear = parseInt(document.getElementById("regBirthYear").value) || 2000;
      const isDeceased = document.getElementById("regIsDeceased").checked;
      const deathYear = isDeceased ? parseInt(document.getElementById("regDeathYear").value) || null : null;
      const parentId = document.getElementById("regParent").value;
      const spouseId = document.getElementById("regSpouse").value;
      const branch = document.getElementById("regBranch").value.trim() || "Main Lineage";
      const occupation = document.getElementById("regOccupation").value.trim() || "Family Member";
      const city = document.getElementById("regCity").value.trim() || "Bunyoro";
      const country = document.getElementById("regCountry").value.trim() || "Uganda";
      const bio = document.getElementById("regBio").value.trim() || "Descendant of the Kintu family lineage.";
      const photo = document.getElementById("regPhotoUrl").value.trim() || "";
      let generation = 1;
      if (parentId) { const p = appData.members.find(m => m.id === parentId); if (p) generation = Math.min((p.generation||1)+1, 8); }
      else if (spouseId) { const s = appData.members.find(m => m.id === spouseId); if (s) generation = s.generation || 1; }
      const newId = `member-${Date.now()}`;
      const newMember = { id:newId, firstName, lastName, empaako, traditionalName:empaako, gender, generation, birthYear, deathYear, isDeceased, branch, location:`${city}, ${country}`, country, occupation, bio, photo, parentIds:parentId?[parentId]:[], spouseIds:spouseId?[spouseId]:[], childrenIds:[] };
      if (parentId) { const p = appData.members.find(m => m.id === parentId); if (p) { if (!p.childrenIds) p.childrenIds=[]; p.childrenIds.push(newId); } }
      if (spouseId) { const s = appData.members.find(m => m.id === spouseId); if (s) { if (!s.spouseIds) s.spouseIds=[]; if (!s.spouseIds.includes(newId)) s.spouseIds.push(newId); } }
      appData.members.push(newMember); saveFamilyData(appData);
      const btn = form.querySelector("button[type=submit]");
      const orig = btn.textContent; btn.textContent = "Saving to database..."; btn.disabled = true;
      await saveMemberToDB(newMember);
      btn.textContent = orig; btn.disabled = false;
      addModal.classList.add("hidden"); form.reset(); deathDiv?.classList.add("hidden");
      treeEngine.setData(appData); initDirectory(); initMemorialWall(); updateHeroCount();
      updateBranchDropdown(document.getElementById("branchSelectFilter"));
      fireCelebrationConfetti(); treeEngine.focusOnMember(newId);
      setTimeout(() => alert(`${firstName} has been added to the Kintu Family Tree!`), 350);
    });
  }
}
function updateHeroCount() { const el = document.getElementById("heroMemberCount"); if (el) el.textContent = appData.members.length; }
function populateParentDropdowns() {
  const ps = document.getElementById("regParent"); const ss = document.getElementById("regSpouse"); const pn = document.getElementById("regParentNotice");
  if (!ps) return;
  if (!appData.members.length) {
    ps.innerHTML = '<option value="">First Root Member (Generation 1)</option>'; ps.disabled = true;
    if (ss) { ss.innerHTML = '<option value="">None (First Member)</option>'; ss.disabled = true; }
    if (pn) pn.textContent = "You are planting the first root of the family tree! This person will be Generation 1.";
  } else {
    ps.disabled = false; ps.innerHTML = '<option value="">-- None (Root Member / G1) --</option>';
    if (ss) { ss.disabled = false; ss.innerHTML = '<option value="">-- None / Unmarried --</option>'; }
    appData.members.forEach(m => {
      const label = `${m.firstName} ${m.lastName} (Gen ${m.generation} - ${m.branch || "Lineage"})`;
      const o = document.createElement("option"); o.value = m.id; o.textContent = label; ps.appendChild(o);
      if (ss) { const os = document.createElement("option"); os.value = m.id; os.textContent = label; ss.appendChild(os); }
    });
    if (pn) pn.textContent = "Select this member's parent in the tree. Generation is set automatically.";
  }
}

/* MEMBER PROFILE MODAL */
function openMemberModal(member) {
  selectedMember = member;
  const modal = document.getElementById("memberProfileModal"); if (!modal) return;
  const pe = document.getElementById("modalMemberPhoto"); const fe = document.getElementById("modalMemberPhotoFallback");
  if (member.photo) { pe.src = member.photo; pe.classList.remove("hidden"); fe?.classList.add("hidden"); }
  else { pe.classList.add("hidden"); if (fe) { fe.classList.remove("hidden"); fe.textContent = member.firstName[0]; } }
  document.getElementById("modalMemberName").textContent = `${member.firstName} ${member.lastName}`;
  const ee = document.getElementById("modalMemberTradName");
  if (member.empaako) { ee.textContent = `Empaako: "${member.empaako}"`; ee.classList.remove("hidden"); } else ee.classList.add("hidden");
  document.getElementById("modalMemberOccupation").textContent = member.occupation || "Family Member";
  document.getElementById("modalMemberLocation").textContent = member.location || "Location Not Specified";
  document.getElementById("modalMemberGenBadge").textContent = `Generation ${member.generation} - ${member.branch || "Lineage"}`;
  document.getElementById("modalMemberBio").textContent = member.bio || "No biography provided yet.";
  document.getElementById("modalMemberDates").innerHTML = member.isDeceased ? `Born ${member.birthYear||"Unknown"} &ndash; Passed ${member.deathYear||"Unknown"}` : `Born ${member.birthYear||"Unknown"}`;
  const rc = document.getElementById("modalMemberRelations"); let html = "";
  if (member.parentIds?.length) { const pr = member.parentIds.map(id=>appData.members.find(m=>m.id===id)).filter(Boolean); if (pr.length) html+=buildRelSection("Parents",pr); }
  if (member.spouseIds?.length) { const sr = member.spouseIds.map(id=>appData.members.find(m=>m.id===id)).filter(Boolean); if (sr.length) html+=buildRelSection("Spouse",sr); }
  if (member.childrenIds?.length) { const cr = member.childrenIds.map(id=>appData.members.find(m=>m.id===id)).filter(Boolean); if (cr.length) html+=buildRelSection(`Children (${cr.length})`,cr); }
  rc.innerHTML = html || '<p class="text-xs text-slate-500 italic">No family links recorded yet.</p>';
  modal.classList.remove("hidden");
}
function buildRelSection(label, people) {
  return `<div class="mb-3"><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">${label}</span><div class="flex flex-wrap gap-2">${people.map(p=>`<button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-xs text-slate-200 border border-slate-700 transition" onclick="viewMemberDetail('${p.id}')">${p.firstName} ${p.lastName}</button>`).join("")}</div></div>`;
}

/* SCROLL, MENU, UTILS */
function initThemeAndScroll() {
  initScrollAnimations(); updateHeroCount();
  const mb = document.getElementById("mobileMenuBtn"); const mn = document.getElementById("mobileNav");
  if (mb && mn) { mb.addEventListener("click", () => mn.classList.toggle("hidden")); mn.querySelectorAll("a").forEach(l => l.addEventListener("click", () => mn.classList.add("hidden"))); }
  const rb = document.getElementById("btnResetDatabase");
  if (rb) rb.addEventListener("click", () => { if (confirm("Reset local cache? DB data remains intact.")) { resetFamilyDataToDefault(); location.reload(); } });
}
function initScrollAnimations() {
  const els = document.querySelectorAll(".reveal-fade-up,.reveal-fade-left,.reveal-fade-right,.reveal-zoom-in");
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("reveal-visible")); return; }
  const obs = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("reveal-visible"); obs.unobserve(entry.target); } }), {threshold:0.12, rootMargin:"0px 0px -40px 0px"});
  els.forEach(el => obs.observe(el));
}
function fireCelebrationConfetti() {
  if (typeof confetti === "function") {
    confetti({particleCount:80, spread:65, origin:{y:0.6}, colors:["#d97706","#ffffff","#fbbf24"]});
    setTimeout(() => { confetti({particleCount:45, angle:60, spread:55, origin:{x:0}, colors:["#d97706","#fbbf24"]}); confetti({particleCount:45, angle:120, spread:55, origin:{x:1}, colors:["#d97706","#fbbf24"]}); }, 280);
  }
}
