/**
 * KINTU FAMILY TREE VISUALIZATION ENGINE
 * Responsive interactive hierarchical chart with SVG connectors.
 * Uses a NATIVE scroll container so touchpads and touch screens scroll
 * the tree area naturally (no hijacked page scrolling).
 * Zoom: +/- buttons, two-finger pinch, or Ctrl/Cmd + scroll (trackpad pinch).
 * Tailored for Bunyoro-Kitara heritage, clean SVG icons, and zero emojis.
 */

class FamilyTreeEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    this.options = Object.assign({
      nodeWidth: 230,
      nodeHeight: 115,
      horizontalGap: 40,
      verticalGap: 220,
      initialZoom: 0.85,
      mobileZoom: 0.6,
      minZoom: 0.3,
      maxZoom: 2,
      onNodeClick: (member) => console.log('Node clicked:', member)
    }, options);

    this.data = null;
    this.members = [];
    this.visibleMembers = [];
    this.zoom = this.getDefaultZoom();
    this.canvasWidth = 1200;
    this.canvasHeight = 800;
    this.isDragging = false;
    this.activeFilterGen = 'all';
    this.activeFilterBranch = 'all';
    this.highlightedMemberId = null;

    this.initDOM();
    this.bindEvents();
  }

  getDefaultZoom() {
    return window.innerWidth < 640 ? this.options.mobileZoom : this.options.initialZoom;
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="tree-shell">
        <!-- Controls Overlay (does not scroll with the tree) -->
        <div class="absolute top-3 right-3 z-40 flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-xl">
          <button id="btnZoomIn" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Zoom In" aria-label="Zoom in">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
          <button id="btnZoomOut" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Zoom Out" aria-label="Zoom out">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
          </button>
          <button id="btnResetView" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Back to the root ancestor" aria-label="Reset view">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
          </button>
          <div class="h-5 w-[1px] bg-slate-700 mx-1"></div>
          <button id="btnTreeHelp" class="w-9 h-9 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition" title="Navigation Tips" aria-label="Navigation help">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
        </div>

        <!-- Native scroll area -->
        <div class="tree-viewport" id="treeViewport">
          <div class="tree-sizer" id="treeSizer">
            <div class="tree-canvas-layer" id="treeLayer">
              <svg id="treeSvg" class="absolute top-0 left-0 pointer-events-none" style="overflow: visible;"></svg>
              <div id="treeNodes" class="relative"></div>
            </div>
          </div>
        </div>

        <!-- Hint -->
        <div class="tree-hint pointer-events-none absolute bottom-3 left-3 z-30 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-slate-700/60 text-[10px] text-slate-300">
          Swipe or scroll to explore &bull; Pinch or use +/&minus; to zoom
        </div>

        <!-- Empty State Container -->
        <div id="treeEmptyState" class="hidden absolute inset-0 z-30 flex items-center justify-center p-6 text-center">
          <div class="max-w-md p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl">
            <h3 class="text-xl font-bold font-serif-royal text-white mb-2">The Family Tree is Ready to Grow</h3>
            <p class="text-xs text-slate-300 leading-relaxed mb-6">
              No family members have been added to the tree yet. Plant the first root by adding the founding ancestor, patriarch, matriarch, or yourself.
            </p>
            <button onclick="document.getElementById('btnOpenAddMember').click()" class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition">
              Add First Family Member
            </button>
          </div>
        </div>
      </div>
    `;

    this.viewport = document.getElementById('treeViewport');
    this.sizer = document.getElementById('treeSizer');
    this.layer = document.getElementById('treeLayer');
    this.svg = document.getElementById('treeSvg');
    this.nodesContainer = document.getElementById('treeNodes');
    this.emptyState = document.getElementById('treeEmptyState');
  }

  setData(data) {
    this.data = data;
    this.members = Array.isArray(data.members) ? [...data.members] : [];
    this.render();
    this.centerView();
  }

  bindEvents() {
    document.getElementById('btnZoomIn').addEventListener('click', () => this.zoomAt(1.2));
    document.getElementById('btnZoomOut').addEventListener('click', () => this.zoomAt(1 / 1.2));
    document.getElementById('btnResetView').addEventListener('click', () => this.centerView());
    document.getElementById('btnTreeHelp').addEventListener('click', () => {
      alert("Family Tree Navigation:\n- Phone/tablet: swipe inside the tree to move around, pinch to zoom\n- Laptop touchpad: two-finger scroll to move, pinch to zoom\n- Mouse: click and drag to pan, Ctrl + scroll to zoom\n- Tap any member card to view their profile and relations");
    });

    // Mouse click-and-drag panning (desktop mouse only; touch uses native scrolling)
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.tree-node-card') || e.target.closest('button')) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.startScrollLeft = this.viewport.scrollLeft;
      this.startScrollTop = this.viewport.scrollTop;
      this.viewport.classList.add('is-dragging');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.viewport.scrollLeft = this.startScrollLeft - (e.clientX - this.dragStartX);
      this.viewport.scrollTop = this.startScrollTop - (e.clientY - this.dragStartY);
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.classList.remove('is-dragging');
    });

    // Trackpad pinch / Ctrl+wheel zooms. Plain scrolling is left to the browser.
    this.viewport.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = this.viewport.getBoundingClientRect();
      this.zoomAt(e.deltaY < 0 ? 1.08 : 1 / 1.08, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

    // Two-finger pinch on touch screens (single finger = native scroll)
    let pinchDist = null;
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    this.viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) pinchDist = dist(e.touches);
    }, { passive: true });

    this.viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 2 || !pinchDist) return;
      e.preventDefault();
      const d = dist(e.touches);
      const ratio = d / pinchDist;
      if (Math.abs(ratio - 1) > 0.03) {
        const rect = this.viewport.getBoundingClientRect();
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        this.zoomAt(ratio, mx, my);
        pinchDist = d;
      }
    }, { passive: false });

    this.viewport.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) pinchDist = null;
    }, { passive: true });
  }

  // Zoom keeping the point (cx, cy) inside the viewport fixed
  zoomAt(factor, cx, cy) {
    const vp = this.viewport;
    if (cx === undefined) { cx = vp.clientWidth / 2; cy = vp.clientHeight / 2; }
    const oldZoom = this.zoom;
    const newZoom = Math.min(Math.max(oldZoom * factor, this.options.minZoom), this.options.maxZoom);
    if (newZoom === oldZoom) return;
    const contentX = (vp.scrollLeft + cx) / oldZoom;
    const contentY = (vp.scrollTop + cy) / oldZoom;
    this.zoom = newZoom;
    this.updateTransform();
    vp.scrollLeft = contentX * newZoom - cx;
    vp.scrollTop = contentY * newZoom - cy;
  }

  // Backwards-compatible alias
  applyZoom(factor) { this.zoomAt(factor); }

  updateTransform() {
    this.layer.style.transform = `scale(${this.zoom})`;
    this.sizer.style.width = `${Math.ceil(this.canvasWidth * this.zoom)}px`;
    this.sizer.style.height = `${Math.ceil(this.canvasHeight * this.zoom)}px`;
  }

  centerView() {
    if (!this.viewport) return;
    this.zoom = this.getDefaultZoom();
    this.updateTransform();

    const visible = this.visibleMembers.filter(m => m.coords);
    if (visible.length === 0) {
      this.viewport.scrollLeft = 0;
      this.viewport.scrollTop = 0;
      return;
    }

    // Focus on the root ancestor if visible, otherwise the top row of visible members
    const root = visible.find(m => m.generation === 1);
    let targetX;
    if (root) {
      targetX = root.coords.x + this.options.nodeWidth / 2;
    } else {
      const topY = Math.min(...visible.map(m => m.coords.y));
      const topRow = visible.filter(m => m.coords.y === topY);
      const xs = topRow.map(m => m.coords.x);
      targetX = (Math.min(...xs) + Math.max(...xs) + this.options.nodeWidth) / 2;
    }

    this.viewport.scrollLeft = targetX * this.zoom - this.viewport.clientWidth / 2;
    this.viewport.scrollTop = 0;
  }

  focusOnMember(memberId) {
    // Make sure the member is visible under the current filters
    let member = this.members.find(m => m.id === memberId);
    if (!member) return;
    if (!this.isVisible(member)) {
      this.activeFilterGen = 'all';
      this.activeFilterBranch = 'all';
    }

    this.highlightedMemberId = memberId;
    this.render();
    member = this.members.find(m => m.id === memberId);
    if (!member || !member.coords) return;

    this.zoom = Math.max(this.getDefaultZoom(), 0.9);
    this.updateTransform();
    const vp = this.viewport;
    vp.scrollTo({
      left: (member.coords.x + this.options.nodeWidth / 2) * this.zoom - vp.clientWidth / 2,
      top: (member.coords.y + this.options.nodeHeight / 2) * this.zoom - vp.clientHeight / 2,
      behavior: 'smooth'
    });

    setTimeout(() => {
      if (this.highlightedMemberId === memberId) {
        this.highlightedMemberId = null;
        this.render();
      }
    }, 4000);
  }

  setFilters(gen = 'all', branch = 'all') {
    this.activeFilterGen = gen;
    this.activeFilterBranch = branch;
    this.render();
    this.centerView();
  }

  isVisible(member) {
    if (this.activeFilterGen !== 'all' && String(member.generation) !== String(this.activeFilterGen)) return false;
    if (this.activeFilterBranch !== 'all' && member.branch !== this.activeFilterBranch) return false;
    return true;
  }

  calculateLayout() {
    // Reset coordinates, then lay out only the members that pass the filters
    this.members.forEach(m => { m.coords = null; });
    this.visibleMembers = this.members.filter(m => this.isVisible(m));

    const genGroups = {};
    this.visibleMembers.forEach(member => {
      const gen = member.generation || 1;
      if (!genGroups[gen]) genGroups[gen] = [];
      genGroups[gen].push(member);
    });

    const padding = 160;
    const startY = 70;
    const ySpacing = this.options.verticalGap;
    const spacing = this.options.nodeWidth + this.options.horizontalGap;
    const sortedGens = Object.keys(genGroups).map(Number).sort((a, b) => a - b);
    const maxInGen = Math.max(1, ...Object.values(genGroups).map(g => g.length));

    this.canvasWidth = Math.max(1000, maxInGen * spacing + padding * 2);
    this.canvasHeight = Math.max(500, startY + sortedGens.length * ySpacing + 60);

    this.svg.style.width = `${this.canvasWidth}px`;
    this.svg.style.height = `${this.canvasHeight}px`;
    this.nodesContainer.style.width = `${this.canvasWidth}px`;
    this.nodesContainer.style.height = `${this.canvasHeight}px`;

    const baseCenterX = this.canvasWidth / 2;
    sortedGens.forEach((gen, idx) => {
      const group = this.orderGenerationWithSpouses(genGroups[gen]);
      const currentY = startY + idx * ySpacing;
      let curX = baseCenterX - (group.length * spacing) / 2 + this.options.horizontalGap / 2;
      group.forEach(m => {
        m.coords = { x: curX, y: currentY };
        curX += spacing;
      });
    });
  }

  orderGenerationWithSpouses(list) {
    // Keep siblings grouped under the same parent, ordered by birth year
    const sorted = [...list].sort((a, b) => {
      const fa = (a.parentIds && a.parentIds[0]) || "";
      const fb = (b.parentIds && b.parentIds[0]) || "";
      if (fa !== fb) return fa.localeCompare(fb);
      return (a.birthYear || 9999) - (b.birthYear || 9999);
    });

    const ordered = [];
    const visited = new Set();
    sorted.forEach(member => {
      if (visited.has(member.id)) return;
      visited.add(member.id);
      ordered.push(member);
      (member.spouseIds || []).forEach(spId => {
        if (visited.has(spId)) return;
        const spouse = list.find(s => s.id === spId);
        if (spouse) {
          visited.add(spId);
          ordered.push(spouse);
        }
      });
    });
    return ordered;
  }

  render() {
    if (!this.data) return;

    if (this.members.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.nodesContainer.innerHTML = '';
      this.svg.innerHTML = '';
      this.visibleMembers = [];
      return;
    }

    this.emptyState.classList.add('hidden');
    this.calculateLayout();
    this.updateTransform();

    this.nodesContainer.innerHTML = '';
    this.svg.innerHTML = '';
    this.renderConnectors();

    const frag = document.createDocumentFragment();
    this.visibleMembers.forEach(member => frag.appendChild(this.createNodeCard(member)));
    this.nodesContainer.appendChild(frag);
  }

  createNodeCard(member) {
    const card = document.createElement('div');
    const isHighlighted = this.highlightedMemberId === member.id;
    card.className = `tree-node-card gen-${member.generation} ${isHighlighted ? 'highlighted' : ''}`;
    card.id = `node-${member.id}`;
    card.style.left = `${member.coords.x}px`;
    card.style.top = `${member.coords.y}px`;

    const genBadgeClass = {
      1: 'badge-gold',
      2: 'badge-emerald',
      3: 'badge-blue',
      4: 'badge-purple',
      5: 'badge-gold',
      6: 'badge-emerald',
      7: 'badge-blue',
      8: 'badge-purple'
    }[member.generation] || 'badge-gold';

    const empaakoOrTrad = member.empaako || member.traditionalName || '';

    const statusBadge = member.isDeceased
      ? `<span class="px-2 py-0.5 text-[10px] rounded-full badge-memorial flex items-center gap-1 font-medium"><svg class="w-3 h-3 inline text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Memorial (${member.birthYear || ''}${member.deathYear ? '–' + member.deathYear : ''})</span>`
      : `<span class="px-2 py-0.5 text-[10px] rounded-full badge-emerald font-medium">${member.location ? member.location.split(',')[0] : 'Living'}</span>`;

    const avatarHtml = member.photo
      ? `<img src="${member.photo}" alt="${member.firstName}" class="w-12 h-12 rounded-xl object-cover border border-slate-600/60 shadow-md">`
      : `<div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
         </div>`;

    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="relative shrink-0">
          ${avatarHtml}
          <span class="absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-md ${genBadgeClass}">
            G${member.generation}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-semibold text-white truncate leading-tight">${member.firstName} ${member.lastName}</h4>
          ${empaakoOrTrad ? `<p class="text-[11px] text-amber-400 font-medium truncate">"${empaakoOrTrad}"</p>` : ''}
          <p class="text-[11px] text-slate-400 truncate mt-0.5">${member.location || 'Bunyoro-Kitara'}</p>
        </div>
      </div>
      <div class="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between">
        ${statusBadge}
        <span class="text-[10px] text-slate-400 flex items-center gap-0.5 hover:text-amber-400">
          Details
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </span>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof this.options.onNodeClick === 'function') {
        this.options.onNodeClick(member);
      }
    });

    return card;
  }

  renderConnectors() {
    let svgHtml = '';
    const byId = new Map(this.visibleMembers.map(m => [m.id, m]));
    const W = this.options.nodeWidth;
    const H = this.options.nodeHeight;

    // Spouse marriage lines
    const processedSpousePairs = new Set();
    this.visibleMembers.forEach(member => {
      (member.spouseIds || []).forEach(spouseId => {
        const pairKey = [member.id, spouseId].sort().join('__');
        if (processedSpousePairs.has(pairKey)) return;
        processedSpousePairs.add(pairKey);
        const spouse = byId.get(spouseId);
        if (!spouse || !spouse.coords || !member.coords) return;
        const left = member.coords.x <= spouse.coords.x ? member : spouse;
        const right = left === member ? spouse : member;
        const x1 = left.coords.x + W;
        const y1 = left.coords.y + H / 2;
        const x2 = right.coords.x;
        const y2 = right.coords.y + H / 2;
        svgHtml += `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="#d97706" stroke-width="2.2" stroke-dasharray="4 3" opacity="0.8" />
          <circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="4" fill="#f59e0b" stroke="#1e293b" stroke-width="1.5" />
        `;
      });
    });

    // Parent to Child lineage curves (only when both are visible)
    this.visibleMembers.forEach(member => {
      if (!member.coords || !member.parentIds || member.parentIds.length === 0) return;
      const parents = member.parentIds.map(id => byId.get(id)).filter(p => p && p.coords);
      if (parents.length === 0) return;

      const parentAvgX = parents.reduce((sum, p) => sum + p.coords.x + W / 2, 0) / parents.length;
      const parentAvgY = parents.reduce((sum, p) => sum + p.coords.y + H, 0) / parents.length;
      const childTopX = member.coords.x + W / 2;
      const childTopY = member.coords.y;
      const midY = (parentAvgY + childTopY) / 2;
      const isHighlighted = (this.highlightedMemberId === member.id || member.parentIds.includes(this.highlightedMemberId));

      svgHtml += `
        <path d="M ${parentAvgX} ${parentAvgY}
                 C ${parentAvgX} ${midY}, ${childTopX} ${midY}, ${childTopX} ${childTopY}"
              class="tree-connector-line ${isHighlighted ? 'highlighted' : ''}" />
      `;
    });

    this.svg.innerHTML = svgHtml;
  }
}
