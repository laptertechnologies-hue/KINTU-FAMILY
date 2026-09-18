/**
 * KINTU FAMILY WEBSITE - MAIN CONTROLLER
 * Coordinates tree visualization, self-registration wizard, profile modals,
 * directory searches, photo gallery lightbox, and diaspora analytics.
 */

let appData = null;
let treeEngine = null;
let selectedMember = null;

document.addEventListener('DOMContentLoaded', () => {
  // Load data from localStorage or initial seed
  appData = getFamilyData();

  // Initialize UI components
  initTree();
  initHistoryTimeline();
  initMemorialWall();
  initGallery();
  initDiasporaStats();
  initDirectory();
  initReunion();
  initModalsAndForms();
  initThemeAndScroll();

  console.log("Kintu Family Heritage Portal initialized with", appData.members.length, "members.");
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
      if (!q) {
        searchResults.classList.add('hidden');
        return;
      }

      const matches = appData.members.filter(m => 
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        (m.traditionalName && m.traditionalName.toLowerCase().includes(q)) ||
        (m.occupation && m.occupation.toLowerCase().includes(q))
      ).slice(0, 6);

      if (matches.length === 0) {
        searchResults.innerHTML = `<div class="p-3 text-xs text-slate-400">No relatives found matching "${q}"</div>`;
      } else {
        searchResults.innerHTML = matches.map(m => `
          <div class="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-b border-slate-700/40 last:border-0" data-member-id="${m.id}">
            <div class="flex items-center gap-2">
              <img src="${m.photo}" class="w-7 h-7 rounded-md object-cover">
              <div>
                <div class="text-xs font-semibold text-white">${m.firstName} ${m.lastName}</div>
                <div class="text-[10px] text-amber-400">${m.branch} • Gen ${m.generation}</div>
              </div>
            </div>
            <span class="text-[10px] text-slate-400">Jump ➔</span>
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
    // Populate branches dynamically
    const branches = Array.from(new Set(appData.members.map(m => m.branch).filter(Boolean)));
    branches.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      branchSelect.appendChild(opt);
    });

    branchSelect.addEventListener('change', () => {
      const activeGenBtn = document.querySelector('.filter-gen-btn.bg-amber-500');
      const gen = activeGenBtn ? activeGenBtn.getAttribute('data-gen') : 'all';
      treeEngine.setFilters(gen, branchSelect.value);
    });
  }
}

/* -------------------------------------------------------------
 * 2. HISTORICAL TIMELINE
 * ------------------------------------------------------------- */
function initHistoryTimeline() {
  const container = document.getElementById('timelineList');
  if (!container) return;

  container.innerHTML = appData.timeline.map((item, idx) => {
    const isEven = idx % 2 === 0;
    return `
      <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
        <!-- Dot -->
        <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-500 bg-slate-900 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
          <span class="text-xs font-bold">${item.year.slice(-2)}</span>
        </div>
        <!-- Content Card -->
        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl glass-panel border border-slate-700/60 shadow-xl group-hover:border-amber-500/40 transition">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold px-2.5 py-1 rounded-full badge-gold">${item.year}</span>
            <span class="text-[11px] text-amber-400/80 font-medium">${item.category}</span>
          </div>
          <h4 class="text-base font-semibold text-white mb-1.5">${item.title}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">${item.description}</p>
        </div>
      </div>
    `;
  }).join('');
}

/* -------------------------------------------------------------
 * 3. MEMORIAL WALL ("ABAATUSOOKA")
 * ------------------------------------------------------------- */
function initMemorialWall() {
  const container = document.getElementById('memorialGrid');
  if (!container) return;

  container.innerHTML = appData.memorialTributes.map(tribute => `
    <div class="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 p-6 flex flex-col justify-between hover:border-amber-500/40 transition group">
      <div>
        <div class="flex items-center gap-4 mb-4">
          <div class="relative shrink-0">
            <img src="${tribute.image}" class="w-16 h-16 rounded-full object-cover border-2 border-amber-500/60 grayscale group-hover:grayscale-0 transition duration-500">
            <span class="absolute -bottom-1 -right-1 text-xs">🕊️</span>
          </div>
          <div>
            <h4 class="text-base font-bold text-white">${tribute.name}</h4>
            <p class="text-xs text-amber-400 font-medium">${tribute.years}</p>
            <p class="text-xs text-slate-400">${tribute.role}</p>
          </div>
        </div>
        <blockquote class="italic text-xs text-slate-300 border-l-2 border-amber-500/40 pl-3 my-3">
          "${tribute.quote}"
        </blockquote>
        <p class="text-xs text-slate-400 leading-relaxed">${tribute.legacy}</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Candle Lit in Memory 🕯️</span>
        <button class="text-amber-400 hover:text-amber-300 font-medium" onclick="alert('Thank you for lighting a candle in honor of ${tribute.name}. Their legacy shines on!')">
          Light Candle
        </button>
      </div>
    </div>
  `).join('');
}

/* -------------------------------------------------------------
 * 4. LIVING ARCHIVES & GALLERY
 * ------------------------------------------------------------- */
function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  renderGalleryItems('all');

  // Filter Buttons
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
}

function renderGalleryItems(category) {
  const grid = document.getElementById('galleryGrid');
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
        <p class="text-xs text-slate-300 line-clamp-1">${img.caption}</p>
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
  cap.textContent = caption;
  yr.textContent = year;

  modal.classList.remove('hidden');
}

/* -------------------------------------------------------------
 * 5. DIASPORA DISTRIBUTION & STATS
 * ------------------------------------------------------------- */
function initDiasporaStats() {
  const container = document.getElementById('diasporaStatsList');
  if (!container) return;

  const totalMembers = appData.members.length;

  container.innerHTML = appData.diasporaStats.map(stat => {
    const percentage = Math.round((stat.count / totalMembers) * 100);
    return `
      <div class="p-4 rounded-xl glass-panel border border-slate-700/60 hover:border-amber-500/40 transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${stat.flag}</span>
            <div>
              <span class="text-sm font-bold text-white">${stat.country}</span>
              <p class="text-[11px] text-slate-400">${stat.cities}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-base font-extrabold text-amber-400">${stat.count}</span>
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
    document.getElementById('directoryTotalCount').textContent = `${list.length} Relatives`;

    grid.innerHTML = list.map(m => `
      <div class="p-4 rounded-2xl glass-panel border border-slate-700/60 hover:border-amber-500/40 transition flex flex-col justify-between">
        <div>
          <div class="flex items-start gap-3 mb-3">
            <img src="${m.photo}" class="w-14 h-14 rounded-xl object-cover border border-slate-600">
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-white truncate">${m.firstName} ${m.lastName}</h4>
              ${m.traditionalName ? `<p class="text-xs text-amber-400 font-medium">"${m.traditionalName}"</p>` : ''}
              <p class="text-xs text-slate-300 font-medium truncate mt-0.5">${m.occupation || 'Relative'}</p>
              <p class="text-[11px] text-slate-400 truncate">📍 ${m.location}</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">${m.bio || ''}</p>
        </div>
        <div class="pt-3 border-t border-slate-700/40 flex items-center justify-between">
          <span class="text-[10px] px-2 py-0.5 rounded-full badge-gold font-semibold">Gen ${m.generation} • ${m.branch}</span>
          <button class="text-xs text-amber-400 hover:text-amber-300 font-semibold" onclick="viewMemberDetail('${m.id}')">
            View Profile ➔
          </button>
        </div>
      </div>
    `).join('');
  }

  function filter() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const role = (roleSelect?.value || 'all').toLowerCase();

    const filtered = appData.members.filter(m => {
      const matchText = (m.firstName + ' ' + m.lastName + ' ' + (m.traditionalName || '') + ' ' + m.location + ' ' + m.occupation).toLowerCase().includes(q);
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
    // Also scroll smoothly to the tree section so user can see context
    document.getElementById('treeSection')?.scrollIntoView({ behavior: 'smooth' });
    treeEngine.focusOnMember(id);
  }
}

/* -------------------------------------------------------------
 * 7. REUNION COUNTDOWN & RSVP
 * ------------------------------------------------------------- */
function initReunion() {
  const rsvpForm = document.getElementById('reunionRsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value;
      const count = parseInt(document.getElementById('rsvpCount').value) || 1;

      appData.upcomingReunion.confirmedRsvp += count;
      saveFamilyData(appData);

      document.getElementById('rsvpConfirmedNumber').textContent = appData.upcomingReunion.confirmedRsvp;
      alert(`Mwebale nnyo, ${name}! Your RSVP for ${count} guest(s) has been recorded for the Grand Kintu Reunion 2026!`);
      rsvpForm.reset();
    });
  }
}

/* -------------------------------------------------------------
 * 8. MODALS & FORMS ("ADD YOURSELF" & "MEMBER PROFILE")
 * ------------------------------------------------------------- */
function initModalsAndForms() {
  // Add Member Modal toggle
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

  // Close modals on overlay click
  window.addEventListener('click', (e) => {
    if (e.target === addModal) addModal.classList.add('hidden');
    const memberModal = document.getElementById('memberProfileModal');
    if (e.target === memberModal) memberModal.classList.add('hidden');
    const lightboxModal = document.getElementById('lightboxModal');
    if (e.target === lightboxModal) lightboxModal.classList.add('hidden');
  });

  // Wizard Step navigation inside Add Member Modal
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
        alert(`Incorrect Family PIN. Please enter "${appData.familyInfo.familyPin}" (or ask your branch elder).`);
        return;
      }

      const firstName = document.getElementById('regFirstName').value.trim();
      const lastName = document.getElementById('regLastName').value.trim();
      const traditionalName = document.getElementById('regTraditionalName').value.trim();
      const gender = document.getElementById('regGender').value;
      const birthYear = parseInt(document.getElementById('regBirthYear').value) || 2000;
      const selectedParentId = document.getElementById('regParent').value;
      const branch = document.getElementById('regBranch').value || 'Main Lineage';
      const occupation = document.getElementById('regOccupation').value.trim() || 'Family Member';
      const city = document.getElementById('regCity').value.trim() || 'Kampala';
      const country = document.getElementById('regCountry').value.trim() || 'Uganda';
      const bio = document.getElementById('regBio').value.trim() || 'Proud member of the Kintu family lineage.';

      // Determine photo: custom URL, avatar preset, or fallback
      let photo = document.getElementById('regPhotoUrl').value.trim();
      if (!photo) {
        const defaultAvatars = {
          male: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          female: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
          other: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        };
        photo = defaultAvatars[gender] || defaultAvatars.other;
      }

      // Compute Generation based on parent
      let generation = 4;
      if (selectedParentId) {
        const parentMember = appData.members.find(m => m.id === selectedParentId);
        if (parentMember) {
          generation = Math.min((parentMember.generation || 3) + 1, 4);
        }
      }

      const newId = `member-${Date.now()}`;
      const newMember = {
        id: newId,
        firstName,
        lastName,
        traditionalName,
        gender,
        generation,
        birthYear,
        deathYear: null,
        isDeceased: false,
        branch,
        location: `${city}, ${country}`,
        country,
        occupation,
        bio,
        photo,
        parentIds: selectedParentId ? [selectedParentId] : [],
        spouseIds: [],
        childrenIds: []
      };

      // Add to members list
      appData.members.push(newMember);

      // If parent selected, link child to parent's children list
      if (selectedParentId) {
        const parentMember = appData.members.find(m => m.id === selectedParentId);
        if (parentMember) {
          if (!parentMember.childrenIds) parentMember.childrenIds = [];
          parentMember.childrenIds.push(newId);
        }
      }

      // Update diaspora stats if applicable
      const existingCountry = appData.diasporaStats.find(s => s.country.toLowerCase() === country.toLowerCase());
      if (existingCountry) {
        existingCountry.count += 1;
      }

      // Persist to localStorage
      saveFamilyData(appData);

      // Close modal and reset form
      addModal.classList.add('hidden');
      addMemberForm.reset();
      updateWizardStep(1);

      // Refresh all views
      treeEngine.setData(appData);
      initDirectory();
      initDiasporaStats();

      // Launch celebratory confetti burst!
      fireCelebrationConfetti();

      // Focus tree on new member and notify!
      treeEngine.focusOnMember(newId);
      setTimeout(() => {
        alert(`🎉 Kulika! Congratulations, ${firstName}! You have successfully added yourself to the Kintu Living Family Tree.`);
      }, 400);
    });
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
  if (!parentSelect) return;

  parentSelect.innerHTML = `<option value="">-- Select Father or Mother (or choose Branch) --</option>`;
  appData.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.firstName} ${m.lastName} (Gen ${m.generation} • ${m.branch})`;
    parentSelect.appendChild(opt);
  });
}

/* -------------------------------------------------------------
 * 9. OPEN MEMBER PROFILE MODAL
 * ------------------------------------------------------------- */
function openMemberModal(member) {
  selectedMember = member;
  const modal = document.getElementById('memberProfileModal');
  if (!modal) return;

  document.getElementById('modalMemberPhoto').src = member.photo;
  document.getElementById('modalMemberName').textContent = `${member.firstName} ${member.lastName}`;
  document.getElementById('modalMemberTradName').textContent = member.traditionalName ? `Cultural Name: "${member.traditionalName}"` : '';
  document.getElementById('modalMemberOccupation').textContent = member.occupation || 'Family Member';
  document.getElementById('modalMemberLocation').textContent = `📍 ${member.location}`;
  document.getElementById('modalMemberGenBadge').textContent = `Generation ${member.generation} • ${member.branch}`;
  document.getElementById('modalMemberBio').textContent = member.bio || 'No biography provided yet.';

  const datesStr = member.isDeceased 
    ? `🕊️ Born ${member.birthYear} — Entered Rest ${member.deathYear}` 
    : `🌟 Born ${member.birthYear} (Age ~${new Date().getFullYear() - member.birthYear})`;
  document.getElementById('modalMemberDates').textContent = datesStr;

  // Build Lineage links (Parents, Spouse, Children)
  const relationsContainer = document.getElementById('modalMemberRelations');
  let relHtml = '';

  // Parents
  if (member.parentIds && member.parentIds.length > 0) {
    const parents = member.parentIds.map(id => appData.members.find(m => m.id === id)).filter(Boolean);
    if (parents.length > 0) {
      relHtml += `
        <div class="mb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Parents</span>
          <div class="flex flex-wrap gap-2">
            ${parents.map(p => `
              <button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs text-white border border-slate-700 transition flex items-center gap-1.5" onclick="viewMemberDetail('${p.id}')">
                <img src="${p.photo}" class="w-4 h-4 rounded-full object-cover">
                ${p.firstName} ${p.lastName}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // Spouses
  if (member.spouseIds && member.spouseIds.length > 0) {
    const spouses = member.spouseIds.map(id => appData.members.find(m => m.id === id)).filter(Boolean);
    if (spouses.length > 0) {
      relHtml += `
        <div class="mb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Spouse / Partner</span>
          <div class="flex flex-wrap gap-2">
            ${spouses.map(s => `
              <button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs text-white border border-slate-700 transition flex items-center gap-1.5" onclick="viewMemberDetail('${s.id}')">
                <img src="${s.photo}" class="w-4 h-4 rounded-full object-cover">
                ${s.firstName} ${s.lastName}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // Children
  if (member.childrenIds && member.childrenIds.length > 0) {
    const children = member.childrenIds.map(id => appData.members.find(m => m.id === id)).filter(Boolean);
    if (children.length > 0) {
      relHtml += `
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Children (${children.length})</span>
          <div class="flex flex-wrap gap-2">
            ${children.map(c => `
              <button class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs text-white border border-slate-700 transition flex items-center gap-1.5" onclick="viewMemberDetail('${c.id}')">
                <img src="${c.photo}" class="w-4 h-4 rounded-full object-cover">
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
 * 10. SCROLL ANIMATIONS, UTILS & CLOUD SETTINGS
 * ------------------------------------------------------------- */
function initThemeAndScroll() {
  initScrollAnimations();

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.add('hidden'));
    });
  }

  // Reset database helper button (in footer)
  const resetBtn = document.getElementById('btnResetDatabase');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Reset family tree and site data back to the default seed dataset? Any custom members you added will be refreshed.")) {
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
        ? "✅ Cloud Database Connected! New family tree additions will now synchronize automatically across all devices."
        : "ℹ️ Switched back to Local Persistent Storage.");

      cloudModal.classList.add('hidden');
    });
  }
}

function updateCloudStatusUI(isConnected) {
  const statusBadge = document.getElementById('cloudStatusBadge');
  if (statusBadge) {
    if (isConnected) {
      statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full badge-emerald text-xs font-bold">🟢 Cloud Sync Active (Supabase)</span>`;
    } else {
      statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full badge-gold text-xs font-bold">🟡 Local Persistent Storage (Offline Ready)</span>`;
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

