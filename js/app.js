/**
 * KINTU FAMILY WEBSITE - MAIN CONTROLLER
 * Bunyoro-Kitara Cultural Lineage & Living Archive
 * Clean vector UI, zero emojis, dynamic member additions, and photo uploads.
 */

let appData = null;
let treeEngine = null;
let selectedMember = null;

document.addEventListener('DOMContentLoaded', () => {
  appData = getFamilyData();

  initTree();
  initHistoryTimeline();
  initMemorialWall();
  initGallery();
  initDiasporaStats();
  initDirectory();
  initReunion();
  initModalsAndForms();
  initThemeAndScroll();

  console.log("Kintu Family Heritage Portal initialized for Bunyoro-Kitara.");
});

/* -------------------------------------------------------------
 * 1. TREE INITIALIZATION & CONTROLS
 * ------------------------------------------------------------- */
function initTree() {
  treeEngine = new FamilyTreeEngine('treeContainer', {
    onNodeClick: (member) => openMemberModal(member)
  });

  treeEngine.setData(appData);

  // Search input for Tree
  const searchInput = document.getElementById('treeSearchInput');
  const searchResults = document.getElementById('treeSearchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q || appData.members.length === 0) {
        searchResults.classList.add('hidden');
        return;
      }

      const matches = appData.members.filter(m => 
        (m.firstName && m.firstName.toLowerCase().includes(q)) ||
        (m.lastName && m.lastName.toLowerCase().includes(q)) ||
        (m.empaako && m.empaako.toLowerCase().includes(q)) ||
        (m.traditionalName && m.traditionalName.toLowerCase().includes(q)) ||
        (m.occupation && m.occupation.toLowerCase().includes(q))
      ).slice(0, 6);

      if (matches.length === 0) {
        searchResults.innerHTML = `<div class="p-3 text-xs text-slate-400">No relatives found matching "${q}"</div>`;
      } else {
        searchResults.innerHTML = matches.map(m => `
          <div class="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-b border-slate-700/40 last:border-0" data-member-id="${m.id}">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold">
                ${m.photo ? `<img src="${m.photo}" class="w-7 h-7 rounded-md object-cover">` : m.firstName[0]}
              </div>
              <div>
                <div class="text-xs font-semibold text-white">${m.firstName} ${m.lastName}</div>
                <div class="text-[10px] text-amber-400">${m.branch || 'Lineage'} • Gen ${m.generation}</div>
              </div>
            </div>
            <span class="text-[10px] text-slate-400">Jump &rarr;</span>
          </div>
        `).join('');

        searchResults.querySelectorAll('[data-member-id]').forEach(el => {
          el.addEventListener('click', () => {
            const id = el.getAttribute('data-member-id');
            treeEngine.focusOnMember(id);
            searchResults.classList.add('hidden');
            searchInput.value = '';
          });
        });
      }
      searchResults.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }

  // Generation filter buttons
  document.querySelectorAll('.filter-gen-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-gen-btn').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.remove('bg-slate-800', 'text-slate-300');
      btn.classList.add('bg-amber-500', 'text-slate-950', 'font-semibold');

      const gen = btn.getAttribute('data-gen');
      const branch = document.getElementById('branchSelectFilter')?.value || 'all';
      treeEngine.setFilters(gen, branch);
    });
  });

  // Branch filter dropdown
  const branchSelect = document.getElementById('branchSelectFilter');
  if (branchSelect) {
    updateBranchDropdown(branchSelect);
    branchSelect.addEventListener('change', () => {
      const activeGenBtn = document.querySelector('.filter-gen-btn.bg-amber-500');
      const gen = activeGenBtn ? activeGenBtn.getAttribute('data-gen') : 'all';
      treeEngine.setFilters(gen, branchSelect.value);
    });
  }
}

function updateBranchDropdown(selectEl) {
  if (!selectEl) return;
  const branches = Array.from(new Set(appData.members.map(m => m.branch).filter(Boolean)));
  selectEl.innerHTML = '<option value="all">All Lineage Branches</option>';
  branches.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    selectEl.appendChild(opt);
  });
}

/* -------------------------------------------------------------
 * 2. HISTORICAL TIMELINE
 * ------------------------------------------------------------- */
function initHistoryTimeline() {
  const container = document.getElementById('timelineList');
  if (!container) return;

  container.innerHTML = appData.timeline.map((item, idx) => {
    return `
      <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
        <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-500 bg-slate-900 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
          <span class="text-xs font-bold">${item.year.slice(-2)}</span>
        </div>
        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl glass-panel border border-slate-700/60 shadow-xl group-hover:border-amber-500/40 transition">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold px-2.5 py-1 rounded-full badge-gold">${item.year}</span>
            <span class="text-[11px] text-amber-400 font-medium">${item.category}</span>
          </div>
          <h4 class="text-base font-semibold text-white mb-1.5">${item.title}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">${item.description}</p>
        </div>
      </div>
    `;
  }).join('');
}

/* -------------------------------------------------------------
 * 3. MEMORIAL WALL ("OKWIJUKA ABAATWESIZE")
 * ------------------------------------------------------------- */
function initMemorialWall() {
  const container = document.getElementById('memorialGrid');
  if (!container) return;

  const deceased = appData.members.filter(m => m.isDeceased);

  if (deceased.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 px-4 glass-panel rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h4 class="text-base font-bold text-white mb-1">In Memory of Departed Elders & Forebears</h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
          Departed ancestors and family members will appear here automatically when added to the family tree with memorial dates.
        </p>
        <button onclick="document.getElementById('btnOpenAddMember').click()" class="text-xs text-amber-400 hover:text-amber-300 underline font-semibold">
          Add an Ancestor or Loved One to the Tree &rarr;
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = deceased.map(member => `
    <div class="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 p-6 flex flex-col justify-between hover:border-amber-500/40 transition group">
      <div>
        <div class="flex items-center gap-4 mb-4">
          <div class="relative shrink-0">
            ${member.photo 
              ? `<img src="${member.photo}" class="w-16 h-16 rounded-full object-cover border-2 border-amber-500/60 grayscale group-hover:grayscale-0 transition duration-500">`
              : `<div class="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg">${member.firstName[0]}</div>`
            }
          </div>
          <div>
            <h4 class="text-base font-bold text-white">${member.firstName} ${member.lastName}</h4>
            <p class="text-xs text-amber-400 font-medium">${member.birthYear || ''} &ndash; ${member.deathYear || 'Passed'}</p>
            ${member.empaako ? `<p class="text-[11px] text-slate-300 font-medium">Empaako: ${member.empaako}</p>` : ''}
            <p class="text-xs text-slate-400">${member.occupation || 'Elder'}</p>
          </div>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${member.bio || 'Remembered with deep love and reverence by the Kintu family.'}</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>In Perpetual Memory</span>
        <button class="text-amber-400 hover:text-amber-300 font-medium" onclick="alert('Thank you for honoring the memory of ${member.firstName} ${member.lastName}. Their legacy endures.')">
          Honor Memory
        </button>
      </div>
    </div>
  `).join('');
}

/* -------------------------------------------------------------
 * 4. LIVING ARCHIVES & PHOTO GALLERY
 * ------------------------------------------------------------- */
function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  renderGalleryItems('all');

  document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filter-btn').forEach(b => {
        b.classList.remove('bg-emerald-600', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.remove('bg-slate-800', 'text-slate-300');
      btn.classList.add('bg-emerald-600', 'text-white');

      const cat = btn.getAttribute('data-cat');
      renderGalleryItems(cat);
    });
  });

  // Photo Contribution Form
  const photoForm = document.getElementById('addPhotoForm');
  if (photoForm) {
    photoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('photoTitle').value.trim();
      const image = document.getElementById('photoUrl').value.trim();
      const year = document.getElementById('photoYear').value.trim() || new Date().getFullYear().toString();
      const category = document.getElementById('photoCategory').value;
      const caption = document.getElementById('photoCaption').value.trim();

      if (!title || !image) {
        alert("Please provide an image title and a valid image URL.");
        return;
      }

      appData.gallery.push({
        id: `img-${Date.now()}`,
        title,
        category,
        year,
        image,
        caption
      });

      saveFamilyData(appData);
      renderGalleryItems('all');
      document.getElementById('addPhotoModal').classList.add('hidden');
      photoForm.reset();
      alert("Photo memory successfully added to the family archive!");
    });
  }
}

function renderGalleryItems(category) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (appData.gallery.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 px-4 glass-panel rounded-2xl border border-slate-800">
        <div class="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h4 class="text-base font-bold text-white mb-1">Archival Gallery is Ready for Photos</h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          No photos have been uploaded yet. Family members can upload ancestral portraits, celebrations, and historical landmarks.
        </p>
        <button onclick="document.getElementById('addPhotoModal').classList.remove('hidden')" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition">
          Contribute First Photo
        </button>
      </div>
    `;
    return;
  }

  const items = category === 'all' 
    ? appData.gallery 
    : appData.gallery.filter(g => g.category.toLowerCase() === category.toLowerCase());

  grid.innerHTML = items.map(img => `
    <div class="group relative rounded-2xl overflow-hidden glass-panel border border-slate-700/60 aspect-[4/3] cursor-pointer shadow-lg hover:shadow-2xl transition duration-300" onclick="openLightbox('${img.image}', '${img.title}', '${img.caption}', '${img.year}')">
      <img src="${img.image}" alt="${img.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-90 group-hover:opacity-100 transition p-4 flex flex-col justify-end">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">${img.category}</span>
          <span class="text-[11px] text-amber-300 font-semibold">${img.year}</span>
        </div>
        <h5 class="text-sm font-bold text-white truncate">${img.title}</h5>
        <p class="text-xs text-slate-300 line-clamp-1">${img.caption || ''}</p>
      </div>
    </div>
  `).join('');
}

function openLightbox(src, title, caption, year) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const tit = document.getElementById('lightboxTitle');
  const cap = document.getElementById('lightboxCaption');
  const yr = document.getElementById('lightboxYear');

  img.src = src;
  tit.textContent = title;
  cap.textContent = caption || '';
  yr.textContent = year || '';

  modal.classList.remove('hidden');
}

/* -------------------------------------------------------------
 * 5. DIASPORA DISTRIBUTION & STATS
 * ------------------------------------------------------------- */
function initDiasporaStats() {
  const container = document.getElementById('diasporaStatsList');
  if (!container) return;

  const totalMembers = appData.members.length;

  if (totalMembers === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl glass-panel border border-slate-800 text-center">
        <p class="text-xs text-slate-400">Diaspora statistics will populate automatically as family members register their cities and countries.</p>
      </div>
    `;
    return;
  }

  // Calculate live counts per country
  const counts = {};
  appData.members.forEach(m => {
    const c = m.country ? m.country.trim() : 'Uganda';
    counts[c] = (counts[c] || 0) + 1;
  });

  const countries = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  container.innerHTML = countries.map(countryName => {
    const count = counts[countryName];
    const percentage = Math.round((count / totalMembers) * 100);
    return `
      <div class="p-4 rounded-xl glass-panel border border-slate-700/60 hover:border-amber-500/40 transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold border border-slate-700">
              ${countryName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span class="text-sm font-bold text-white">${countryName}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-base font-extrabold text-amber-400">${count}</span>
            <span class="text-[10px] text-slate-400 block">${percentage}% of family</span>
          </div>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="bg-amber-500 h-1.5 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* -------------------------------------------------------------
 * 6. SEARCHABLE FAMILY DIRECTORY
 * ------------------------------------------------------------- */
function initDirectory() {
  const grid = document.getElementById('directoryGrid');
  const searchInput = document.getElementById('directorySearch');
  const roleSelect = document.getElementById('directoryRoleFilter');

  function render(list) {
    if (!grid) return;
    document.getElementById('directoryTotalCount').textContent = `${list.length} Relatives Recorded`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-8 rounded-2xl glass-panel border border-slate-800 text-center">
          <p class="text-xs text-slate-400 mb-3">No relatives matching your criteria in the directory.</p>
          <button onclick="document.getElementById('btnOpenAddMember').click()" class="text-xs text-amber-400 font-semibold underline">
            Add a Member to the Directory &rarr;
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(m => `
      <div class="p-4 rounded-2xl glass-panel border border-slate-700/60 hover:border-amber-500/40 transition flex flex-col justify-between">
        <div>
          <div class="flex items-start gap-3 mb-3">
            ${m.photo 
              ? `<img src="${m.photo}" class="w-14 h-14 rounded-xl object-cover border border-slate-600">`
              : `<div class="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg">${m.firstName[0]}</div>`
            }
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-white truncate">${m.firstName} ${m.lastName}</h4>
              ${(m.empaako || m.traditionalName) ? `<p class="text-xs text-amber-400 font-medium">"${m.empaako || m.traditionalName}"</p>` : ''}
              <p class="text-xs text-slate-300 font-medium truncate mt-0.5">${m.occupation || 'Family Member'}</p>
              <p class="text-[11px] text-slate-400 truncate">${m.location || 'Location Not Specified'}</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">${m.bio || 'Proud member of the Kintu family.'}</p>
        </div>
        <div class="pt-3 border-t border-slate-700/40 flex items-center justify-between">
          <span class="text-[10px] px-2 py-0.5 rounded-full badge-gold font-semibold">Gen ${m.generation} • ${m.branch || 'Lineage'}</span>
          <button class="text-xs text-amber-400 hover:text-amber-300 font-semibold" onclick="viewMemberDetail('${m.id}')">
            View Profile &rarr;
          </button>
        </div>
      </div>
    `).join('');
  }

  function filter() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const role = (roleSelect?.value || 'all').toLowerCase();

    const filtered = appData.members.filter(m => {
      const matchText = (m.firstName + ' ' + m.lastName + ' ' + (m.empaako || '') + ' ' + (m.traditionalName || '') + ' ' + (m.location || '') + ' ' + (m.occupation || '')).toLowerCase().includes(q);
      const matchRole = (role === 'all') || (m.occupation && m.occupation.toLowerCase().includes(role));
      return matchText && matchRole;
    });

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filter);
  if (roleSelect) roleSelect.addEventListener('change', filter);

  render(appData.members);
}

function viewMemberDetail(id) {
  const member = appData.members.find(m => m.id === id);
  if (member) {
    openMemberModal(member);
    document.getElementById('treeSection')?.scrollIntoView({ behavior: 'smooth' });
    treeEngine.focusOnMember(id);
  }
}

/* -------------------------------------------------------------
 * 7. REUNION RSVP
 * ------------------------------------------------------------- */
function initReunion() {
  const rsvpForm = document.getElementById('reunionRsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const count = parseInt(document.getElementById('rsvpCount').value) || 1;

      appData.upcomingReunion.confirmedRsvp += count;
      saveFamilyData(appData);

      document.getElementById('rsvpConfirmedNumber').textContent = appData.upcomingReunion.confirmedRsvp;
      alert(`Thank you, ${name}! Your RSVP for ${count} guest(s) has been recorded for the Kintu Family Gathering.`);
      rsvpForm.reset();
    });
  }
}

/* -------------------------------------------------------------
 * 8. MODALS & FORMS ("ADD YOURSELF")
 * ------------------------------------------------------------- */
function initModalsAndForms() {
  const openAddBtn = document.getElementById('btnOpenAddMember');
  const openAddHeroBtn = document.getElementById('btnHeroAddMember');
  const addModal = document.getElementById('addMemberModal');
  const closeAddBtn = document.getElementById('btnCloseAddMember');

  const openAdd = () => {
    populateParentDropdowns();
    addModal.classList.remove('hidden');
  };

  if (openAddBtn) openAddBtn.addEventListener('click', openAdd);
  if (openAddHeroBtn) openAddHeroBtn.addEventListener('click', openAdd);
  if (closeAddBtn) closeAddBtn.addEventListener('click', () => addModal.classList.add('hidden'));

  window.addEventListener('click', (e) => {
    if (e.target === addModal) addModal.classList.add('hidden');
    const memberModal = document.getElementById('memberProfileModal');
    if (e.target === memberModal) memberModal.classList.add('hidden');
    const lightboxModal = document.getElementById('lightboxModal');
    if (e.target === lightboxModal) lightboxModal.classList.add('hidden');
    const photoModal = document.getElementById('addPhotoModal');
    if (e.target === photoModal) photoModal.classList.add('hidden');
  });

  let currentStep = 1;
  const updateWizardStep = (step) => {
    currentStep = step;
    document.querySelectorAll('.wizard-step-pane').forEach((pane, idx) => {
      if (idx + 1 === step) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });

    document.querySelectorAll('.wizard-step-indicator').forEach((ind, idx) => {
      if (idx + 1 <= step) {
        ind.classList.add('bg-amber-500', 'text-slate-950');
        ind.classList.remove('bg-slate-800', 'text-slate-400');
      } else {
        ind.classList.remove('bg-amber-500', 'text-slate-950');
        ind.classList.add('bg-slate-800', 'text-slate-400');
      }
    });
  };

  document.querySelectorAll('.btn-wizard-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        updateWizardStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.btn-wizard-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      updateWizardStep(currentStep - 1);
    });
  });

  // Handle Add Member Form Submit
  const addMemberForm = document.getElementById('addMemberForm');
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const pinInput = document.getElementById('regPin').value.trim();
      if (pinInput.toUpperCase() !== appData.familyInfo.familyPin) {
        alert(`Incorrect Family Passcode. Please enter "${appData.familyInfo.familyPin}".`);
        return;
      }

      const firstName = document.getElementById('regFirstName').value.trim();
      const lastName = document.getElementById('regLastName').value.trim();
      const empaako = document.getElementById('regEmpaako').value.trim();
      const gender = document.getElementById('regGender').value;
      const birthYear = parseInt(document.getElementById('regBirthYear').value) || 2000;
      const isDeceased = document.getElementById('regIsDeceased').checked;
      const deathYear = isDeceased ? (parseInt(document.getElementById('regDeathYear').value) || null) : null;
      const selectedParentId = document.getElementById('regParent').value;
      const branch = document.getElementById('regBranch').value.trim() || 'Main Lineage';
      const occupation = document.getElementById('regOccupation').value.trim() || 'Family Member';
      const city = document.getElementById('regCity').value.trim() || 'Bunyoro';
      const country = document.getElementById('regCountry').value.trim() || 'Uganda';
      const bio = document.getElementById('regBio').value.trim() || 'Descendant of the Kintu family lineage.';
      const photo = document.getElementById('regPhotoUrl').value.trim() || '';

      const selectedSpouseId = document.getElementById('regSpouse')?.value;

      // Compute Generation
      let generation = 1;
      if (appData.members.length > 0 && selectedParentId) {
        const parentMember = appData.members.find(m => m.id === selectedParentId);
        if (parentMember) {
          generation = Math.min((parentMember.generation || 1) + 1, 4);
        }
      } else if (appData.members.length > 0 && selectedSpouseId) {
        const spouseMember = appData.members.find(m => m.id === selectedSpouseId);
        if (spouseMember) {
          generation = spouseMember.generation || 1;
        }
      } else if (appData.members.length > 0 && !selectedParentId) {
        generation = 1;
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
        branch,
        location: `${city}, ${country}`,
        country,
        occupation,
        bio,
        photo,
        parentIds: selectedParentId ? [selectedParentId] : [],
        spouseIds: selectedSpouseId ? [selectedSpouseId] : [],
        childrenIds: []
      };

      appData.members.push(newMember);

      if (selectedParentId) {
        const parentMember = appData.members.find(m => m.id === selectedParentId);
        if (parentMember) {
          if (!parentMember.childrenIds) parentMember.childrenIds = [];
          parentMember.childrenIds.push(newId);
        }
      }

      if (selectedSpouseId) {
        const spouseMember = appData.members.find(m => m.id === selectedSpouseId);
        if (spouseMember) {
          if (!spouseMember.spouseIds) spouseMember.spouseIds = [];
          if (!spouseMember.spouseIds.includes(newId)) {
            spouseMember.spouseIds.push(newId);
          }
        }
      }

      saveFamilyData(appData);

      addModal.classList.add('hidden');
      addMemberForm.reset();
      updateWizardStep(1);

      // Refresh all views
      treeEngine.setData(appData);
      initDirectory();
      initDiasporaStats();
      initMemorialWall();
      updateHeroCount();

      fireCelebrationConfetti();
      treeEngine.focusOnMember(newId);

      setTimeout(() => {
        alert(`Congratulations, ${firstName}! You have been successfully added to the Kintu Family Tree.`);
      }, 350);
    });
  }
}

function updateHeroCount() {
  const heroEl = document.getElementById('heroMemberCount');
  if (heroEl) {
    heroEl.textContent = appData.members.length.toString();
  }
}

function validateStep(step) {
  if (step === 1) {
    const fn = document.getElementById('regFirstName').value.trim();
    const ln = document.getElementById('regLastName').value.trim();
    const by = document.getElementById('regBirthYear').value.trim();
    if (!fn || !ln || !by) {
      alert("Please fill in your first name, last name, and birth year.");
      return false;
    }
  }
  return true;
}

function populateParentDropdowns() {
  const parentSelect = document.getElementById('regParent');
  const spouseSelect = document.getElementById('regSpouse');
  const parentNotice = document.getElementById('regParentNotice');
  if (!parentSelect) return;

  if (appData.members.length === 0) {
    parentSelect.innerHTML = `<option value="">First Root Member / Founding Ancestor (Generation 1)</option>`;
    parentSelect.disabled = true;
    if (spouseSelect) {
      spouseSelect.innerHTML = `<option value="">None (First Member)</option>`;
      spouseSelect.disabled = true;
    }
    if (parentNotice) parentNotice.textContent = "You are planting the first member of the family tree! This person will be Generation 1.";
  } else {
    parentSelect.disabled = false;
    parentSelect.innerHTML = `<option value="">-- None (Root Member or Generation 1) --</option>`;
    if (spouseSelect) {
      spouseSelect.disabled = false;
      spouseSelect.innerHTML = `<option value="">-- None / Unmarried --</option>`;
    }
    appData.members.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.firstName} ${m.lastName} (Gen ${m.generation} • ${m.branch || 'Lineage'})`;
      parentSelect.appendChild(opt);

      if (spouseSelect) {
        const optSpouse = document.createElement('option');
        optSpouse.value = m.id;
        optSpouse.textContent = `${m.firstName} ${m.lastName} (Gen ${m.generation} • ${m.branch || 'Lineage'})`;
        spouseSelect.appendChild(optSpouse);
      }
    });
    if (parentNotice) parentNotice.textContent = "Select this member's father or mother already listed in the tree. Generation level will be set automatically.";
  }
}

/* -------------------------------------------------------------
 * 9. OPEN MEMBER PROFILE MODAL
 * ------------------------------------------------------------- */
function openMemberModal(member) {
  selectedMember = member;
  const modal = document.getElementById('memberProfileModal');
  if (!modal) return;

  const photoEl = document.getElementById('modalMemberPhoto');
  const fallbackEl = document.getElementById('modalMemberPhotoFallback');
  if (member.photo) {
    photoEl.src = member.photo;
    photoEl.classList.remove('hidden');
    if (fallbackEl) fallbackEl.classList.add('hidden');
  } else {
    photoEl.classList.add('hidden');
    if (fallbackEl) {
      fallbackEl.classList.remove('hidden');
      fallbackEl.textContent = member.firstName[0];
    }
  }

  document.getElementById('modalMemberName').textContent = `${member.firstName} ${member.lastName}`;
  
  const empaakoEl = document.getElementById('modalMemberTradName');
  if (member.empaako || member.traditionalName) {
    empaakoEl.textContent = `Empaako: "${member.empaako || member.traditionalName}"`;
    empaakoEl.classList.remove('hidden');
  } else {
    empaakoEl.classList.add('hidden');
  }

  document.getElementById('modalMemberOccupation').textContent = member.occupation || 'Family Member';
  document.getElementById('modalMemberLocation').textContent = member.location || 'Location Not Specified';
  document.getElementById('modalMemberGenBadge').textContent = `Generation ${member.generation} • ${member.branch || 'Lineage'}`;
  document.getElementById('modalMemberBio').textContent = member.bio || 'No biography provided yet.';

  const datesStr = member.isDeceased 
    ? `Born ${member.birthYear || 'Unknown'} &ndash; Passed ${member.deathYear || 'Unknown'}` 
    : `Born ${member.birthYear || 'Unknown'}`;
  document.getElementById('modalMemberDates').innerHTML = datesStr;

  // Build Relations
  const relationsContainer = document.getElementById('modalMemberRelations');
  let relHtml = '';

  if (member.parentIds && member.parentIds.length > 0) {
    const parents = member.parentIds.map(id => appData.members.find(m => m.id === id)).filter(Boolean);
    if (parents.length > 0) {
      relHtml += `
        <div class="mb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Parents</span>
          <div class="flex flex-wrap gap-2">
            ${parents.map(p => `
              <button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs text-white border border-slate-700 transition" onclick="viewMemberDetail('${p.id}')">
                ${p.firstName} ${p.lastName}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  if (member.spouseIds && member.spouseIds.length > 0) {
    const spouses = member.spouseIds.map(id => appData.members.find(m => m.id === id)).filter(Boolean);
    if (spouses.length > 0) {
      relHtml += `
        <div class="mb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Spouse</span>
          <div class="flex flex-wrap gap-2">
            ${spouses.map(s => `
              <button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs text-white border border-slate-700 transition" onclick="viewMemberDetail('${s.id}')">
                ${s.firstName} ${s.lastName}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  if (member.childrenIds && member.childrenIds.length > 0) {
    const children = member.childrenIds.map(id => appData.members.find(m => m.id === id)).filter(Boolean);
    if (children.length > 0) {
      relHtml += `
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Children (${children.length})</span>
          <div class="flex flex-wrap gap-2">
            ${children.map(c => `
              <button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs text-white border border-slate-700 transition" onclick="viewMemberDetail('${c.id}')">
                ${c.firstName} ${c.lastName}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  relationsContainer.innerHTML = relHtml || '<p class="text-xs text-slate-500 italic">No direct family links recorded yet.</p>';
  modal.classList.remove('hidden');
}

/* -------------------------------------------------------------
 * 10. SCROLL, MENU, UTILS & CLOUD SETTINGS
 * ------------------------------------------------------------- */
function initThemeAndScroll() {
  initScrollAnimations();
  updateHeroCount();

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => mobileNav.classList.toggle('hidden'));
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.add('hidden'));
    });
  }

  const resetBtn = document.getElementById('btnResetDatabase');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Reset the family tree and clear added members?")) {
        resetFamilyDataToDefault();
        location.reload();
      }
    });
  }

  // Cloud Database Modal
  const cloudBtn = document.getElementById('btnOpenCloudSettings');
  const cloudModal = document.getElementById('cloudSettingsModal');
  const closeCloudBtn = document.getElementById('btnCloseCloudSettings');
  const cloudForm = document.getElementById('cloudSettingsForm');

  if (cloudBtn && cloudModal) {
    cloudBtn.addEventListener('click', () => {
      const config = getCloudConfig();
      document.getElementById('cloudSupabaseUrl').value = config.supabaseUrl || '';
      document.getElementById('cloudSupabaseKey').value = config.supabaseAnonKey || '';
      updateCloudStatusUI(config.isConnected);
      cloudModal.classList.remove('hidden');
    });
  }

  if (closeCloudBtn && cloudModal) {
    closeCloudBtn.addEventListener('click', () => cloudModal.classList.add('hidden'));
  }

  if (cloudForm) {
    cloudForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('cloudSupabaseUrl').value.trim();
      const key = document.getElementById('cloudSupabaseKey').value.trim();
      const isConnected = !!(url && key);

      saveCloudConfig({ supabaseUrl: url, supabaseAnonKey: key, isConnected });
      updateCloudStatusUI(isConnected);

      alert(isConnected 
        ? "Cloud Database Connected. New family tree additions will synchronize across devices."
        : "Switched to Local Persistent Storage.");

      cloudModal.classList.add('hidden');
    });
  }
}

function updateCloudStatusUI(isConnected) {
  const statusBadge = document.getElementById('cloudStatusBadge');
  if (statusBadge) {
    if (isConnected) {
      statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full badge-emerald text-xs font-bold">Cloud Sync Active</span>`;
    } else {
      statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full badge-gold text-xs font-bold">Local Storage</span>`;
    }
  }
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-zoom-in');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('reveal-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

function fireCelebrationConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d97706', '#10b981', '#fbbf24', '#ffffff']
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#d97706', '#10b981', '#fbbf24']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#d97706', '#10b981', '#fbbf24']
      });
    }, 280);
  }
}
