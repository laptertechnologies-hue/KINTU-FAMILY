/**
 * KINTU FAMILY TREE VISUALIZATION ENGINE
 * Custom responsive interactive hierarchical chart with SVG connectors,
 * zoom, pan, touch gestures, search focusing, and dynamic member insertion.
 */

class FamilyTreeEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    this.options = Object.assign({
      nodeWidth: 220,
      nodeHeight: 110,
      horizontalGap: 50,
      verticalGap: 140,
      initialZoom: 0.85,
      minZoom: 0.35,
      maxZoom: 2.2,
      onNodeClick: (member) => console.log('Node clicked:', member)
    }, options);

    this.data = null;
    this.members = [];
    this.zoom = this.options.initialZoom;
    this.panX = 0;
    this.panY = 60;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.activeFilterGen = 'all';
    this.activeFilterBranch = 'all';
    this.highlightedMemberId = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="tree-viewport" id="treeViewport">
        <!-- Controls Overlay -->
        <div class="absolute top-4 right-4 z-40 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-xl">
          <button id="btnZoomIn" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Zoom In">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
          <button id="btnZoomOut" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Zoom Out">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
          </button>
          <button id="btnResetView" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Reset Center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
          </button>
          <div class="h-5 w-[1px] bg-slate-700 mx-1"></div>
          <button id="btnTreeHelp" class="w-9 h-9 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition" title="Tree Navigation Tips">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>
        </div>

        <!-- Canvas and Node Transform Layer -->
        <div class="tree-canvas-layer" id="treeLayer">
          <svg id="treeSvg" class="absolute top-0 left-0 pointer-events-none" style="width: 5000px; height: 3000px; overflow: visible;"></svg>
          <div id="treeNodes" class="relative" style="width: 5000px; height: 3000px;"></div>
        </div>
      </div>
    `;

    this.viewport = document.getElementById('treeViewport');
    this.layer = document.getElementById('treeLayer');
    this.svg = document.getElementById('treeSvg');
    this.nodesContainer = document.getElementById('treeNodes');
  }

  setData(data) {
    this.data = data;
    this.members = [...data.members];
    this.render();
    this.centerView();
  }

  bindEvents() {
    // Zoom buttons
    document.getElementById('btnZoomIn').addEventListener('click', () => this.applyZoom(1.2));
    document.getElementById('btnZoomOut').addEventListener('click', () => this.applyZoom(0.8));
    document.getElementById('btnResetView').addEventListener('click', () => this.centerView());
    document.getElementById('btnTreeHelp').addEventListener('click', () => {
      alert("Family Tree Navigation Tips:\n• Drag with your mouse or finger to pan anywhere\n• Scroll up/down to zoom in & out\n• Click any card to see their complete life story, photos, & connections\n• Use 'Add Yourself' button above to join the tree!");
    });

    // Mouse drag events
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.tree-node-card') || e.target.closest('button')) return;
      this.isDragging = true;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.viewport.style.cursor = 'grab';
    });

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPinchDist = null;

    this.viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX - this.panX;
        touchStartY = e.touches[0].clientY - this.panY;
      } else if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        this.panX = e.touches[0].clientX - touchStartX;
        this.panY = e.touches[0].clientY - touchStartY;
        this.updateTransform();
      } else if (e.touches.length === 2 && initialPinchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = currentDist / initialPinchDist;
        if (Math.abs(1 - ratio) > 0.05) {
          this.applyZoom(ratio > 1 ? 1.05 : 0.95);
          initialPinchDist = currentDist;
        }
      }
    }, { passive: true });

    // Wheel Zoom
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      this.applyZoom(zoomFactor);
    }, { passive: false });
  }

  applyZoom(factor) {
    const newZoom = Math.min(Math.max(this.zoom * factor, this.options.minZoom), this.options.maxZoom);
    this.zoom = newZoom;
    this.updateTransform();
  }

  updateTransform() {
    this.layer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  centerView() {
    if (!this.viewport) return;
    const rect = this.viewport.getBoundingClientRect();
    this.zoom = this.options.initialZoom;
    // Centers on the middle of Generation 1 and 2
    this.panX = (rect.width / 2) - 1300 * this.zoom;
    this.panY = 40;
    this.updateTransform();
  }

  focusOnMember(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member || !member.coords) return;

    this.highlightedMemberId = memberId;
    this.render();

    const rect = this.viewport.getBoundingClientRect();
    this.zoom = 1.0;
    this.panX = (rect.width / 2) - (member.coords.x + this.options.nodeWidth / 2);
    this.panY = (rect.height / 2) - (member.coords.y + this.options.nodeHeight / 2);
    this.updateTransform();

    // Remove highlight after 4s
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
  }

  /**
   * Layout calculation algorithm:
   * Arranges members by generation, computes horizontal spreads,
   * pairs spouses side by side, and centers children beneath parents.
   */
  calculateLayout() {
    const genGroups = { 1: [], 2: [], 3: [], 4: [] };

    // Filter members if applicable
    this.members.forEach(member => {
      const gen = member.generation || 1;
      if (!genGroups[gen]) genGroups[gen] = [];
      genGroups[gen].push(member);
    });

    const startX = 250;
    const startY = 80;
    const ySpacing = 220;

    // Generation 1 Layout (Founders side by side)
    const g1 = genGroups[1];
    const g1Center = 1350;
    if (g1.length > 0) {
      const totalG1Width = g1.length * (this.options.nodeWidth + 60);
      let curX = g1Center - (totalG1Width / 2);
      g1.forEach(m => {
        m.coords = { x: curX, y: startY };
        curX += this.options.nodeWidth + 60;
      });
    }

    // Generation 2 Layout (Grouped with their spouses)
    const g2 = genGroups[2];
    const g2StartY = startY + ySpacing;
    if (g2.length > 0) {
      // Four main couples/singles: David & Sarah, Grace & Robert, Joseph & Florence, Miriam & Emmanuel
      const branchUnits = [
        ['member-3', 'member-4'], // David & Sarah
        ['member-5', 'member-6'], // Grace & Robert
        ['member-7', 'member-8'], // Joseph & Florence
        ['member-9', 'member-10'] // Miriam & Emmanuel
      ];

      let currentX = 350;
      const unitGap = 160;

      branchUnits.forEach(unitIds => {
        let localX = currentX;
        unitIds.forEach(id => {
          const mem = g2.find(m => m.id === id);
          if (mem) {
            mem.coords = { x: localX, y: g2StartY };
            localX += this.options.nodeWidth + 24;
          }
        });
        currentX = localX + unitGap;
      });

      // Any remaining gen 2 members
      g2.forEach(m => {
        if (!m.coords) {
          m.coords = { x: currentX, y: g2StartY };
          currentX += this.options.nodeWidth + 40;
        }
      });
    }

    // Generation 3 Layout
    const g3 = genGroups[3];
    const g3StartY = g2StartY + ySpacing;
    if (g3.length > 0) {
      let g3X = 250;
      g3.forEach((m, idx) => {
        m.coords = { x: g3X, y: g3StartY };
        g3X += this.options.nodeWidth + 36;
      });
    }

    // Generation 4 Layout
    const g4 = genGroups[4];
    const g4StartY = g3StartY + ySpacing;
    if (g4.length > 0) {
      let g4X = 280;
      g4.forEach(m => {
        m.coords = { x: g4X, y: g4StartY };
        g4X += this.options.nodeWidth + 40;
      });
    }
  }

  render() {
    if (!this.data) return;
    this.calculateLayout();

    // Clear existing nodes and connectors
    this.nodesContainer.innerHTML = '';
    this.svg.innerHTML = '';

    // Draw Connectors first (behind cards)
    this.renderConnectors();

    // Draw Member Cards
    this.members.forEach(member => {
      // Check filters
      if (this.activeFilterGen !== 'all' && member.generation.toString() !== this.activeFilterGen) {
        return;
      }
      if (this.activeFilterBranch !== 'all' && member.branch !== this.activeFilterBranch) {
        return;
      }

      const card = this.createNodeCard(member);
      this.nodesContainer.appendChild(card);
    });
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
      4: 'badge-purple'
    }[member.generation] || 'badge-gold';

    const statusBadge = member.isDeceased
      ? `<span class="px-2 py-0.5 text-[10px] rounded-full badge-memorial flex items-center gap-1 font-medium">🕊️ Memorial (${member.birthYear}–${member.deathYear})</span>`
      : `<span class="px-2 py-0.5 text-[10px] rounded-full badge-emerald font-medium">Living • ${member.location.split(',')[0]}</span>`;

    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="relative shrink-0">
          <img src="${member.photo}" alt="${member.firstName}" class="w-12 h-12 rounded-xl object-cover border border-slate-600/60 shadow-md">
          <span class="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md ${genBadgeClass}">
            G${member.generation}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-semibold text-white truncate leading-tight">${member.firstName} ${member.lastName}</h4>
          ${member.traditionalName ? `<p class="text-[11px] text-amber-400 font-medium truncate">"${member.traditionalName}"</p>` : ''}
          <p class="text-[11px] text-slate-400 truncate mt-0.5">${member.occupation || 'Family Member'}</p>
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

    // Draw marriage links (Spouses)
    const processedSpousePairs = new Set();
    this.members.forEach(member => {
      if (member.spouseIds && member.spouseIds.length > 0 && member.coords) {
        member.spouseIds.forEach(spouseId => {
          const pairKey = [member.id, spouseId].sort().join('__');
          if (processedSpousePairs.has(pairKey)) return;
          processedSpousePairs.add(pairKey);

          const spouse = this.members.find(m => m.id === spouseId);
          if (spouse && spouse.coords) {
            const x1 = member.coords.x + this.options.nodeWidth;
            const y1 = member.coords.y + this.options.nodeHeight / 2;
            const x2 = spouse.coords.x;
            const y2 = spouse.coords.y + this.options.nodeHeight / 2;

            svgHtml += `
              <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke="#d97706" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.75" />
              <circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="4.5" fill="#f59e0b" stroke="#1e293b" stroke-width="1.5" />
            `;
          }
        });
      }
    });

    // Draw Parent-to-Child Lineage curves
    this.members.forEach(member => {
      if (member.parentIds && member.parentIds.length > 0 && member.coords) {
        const parents = member.parentIds.map(id => this.members.find(m => m.id === id)).filter(Boolean);
        if (parents.length > 0) {
          // Average parents center point
          const parentAvgX = parents.reduce((sum, p) => sum + (p.coords ? p.coords.x + this.options.nodeWidth / 2 : 0), 0) / parents.length;
          const parentAvgY = parents.reduce((sum, p) => sum + (p.coords ? p.coords.y + this.options.nodeHeight : 0), 0) / parents.length;

          const childTopX = member.coords.x + this.options.nodeWidth / 2;
          const childTopY = member.coords.y;

          const midY = (parentAvgY + childTopY) / 2;

          const isHighlighted = (this.highlightedMemberId === member.id || member.parentIds.includes(this.highlightedMemberId));

          svgHtml += `
            <path d="M ${parentAvgX} ${parentAvgY}
                     C ${parentAvgX} ${midY}, ${childTopX} ${midY}, ${childTopX} ${childTopY}"
                  class="tree-connector-line animated ${isHighlighted ? 'highlighted' : ''}" />
          `;
        }
      }
    });

    this.svg.innerHTML = svgHtml;
  }
}
