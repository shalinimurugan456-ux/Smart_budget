/**
 * PocketSmart AI - Recommendation Engine Controller
 * Manages rendering, dynamic budget allocation meters, search/filter/sort, and wishlist saving.
 */

const Recommendations = {
  activePlan: null,
  catalogData: [],
  filteredData: [],
  currentCategory: 'All',
  searchQuery: '',
  sortBy: 'relevance',

  async init(catalogType) {
    // 1. Resolve Active Plan
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('planId');

    if (planId) {
      const history = StorageService.getHistory();
      this.activePlan = history.find(p => p.id === planId);
    }
    
    if (!this.activePlan) {
      // Try session storage or fallback mock
      const sessionPlan = sessionStorage.getItem('pocketsmart_active_plan');
      if (sessionPlan) {
        this.activePlan = JSON.parse(sessionPlan);
      } else {
        // Default fallback plan so page is never empty
        this.activePlan = this.getDefaultPlan(catalogType);
      }
    }

    // 2. Fetch Catalog Data
    const filenameMap = {
      home: 'home-products.json',
      party: 'party-recommendations.json',
      jewelry: 'jewelry-recommendations.json'
    };

    const filename = filenameMap[catalogType] || 'home-products.json';
    this.catalogData = await StorageService.fetchCatalog(filename);
    this.filteredData = [...this.catalogData];

    // 3. Render Page Components
    this.renderPlanHeader();
    this.renderBudgetGauge();
    this.setupFilters(catalogType);
    this.setupSearch();
    this.setupSort();
    this.renderProducts();
  },

  getDefaultPlan(type) {
    if (type === 'party') {
      return {
        id: 'party-demo',
        type: 'Party & Events',
        title: 'Celebration Party Plan (30 Guests)',
        budget: 3500,
        currency: 'USD',
        guests: 30,
        partyType: 'Birthday'
      };
    } else if (type === 'jewelry') {
      return {
        id: 'jewelry-demo',
        type: 'Jewelry & Luxury',
        title: 'Anniversary Fine Jewelry Collection',
        budget: 2500,
        currency: 'USD',
        jewelryType: 'All',
        metal: 'Gold & Diamond'
      };
    } else {
      return {
        id: 'home-demo',
        type: 'Home Interior',
        title: 'Modern Scandinavian Living Space',
        budget: 4500,
        currency: 'USD',
        style: 'Scandinavian'
      };
    }
  },

  renderPlanHeader() {
    const titleEl = document.getElementById('planTitle');
    const subtitleEl = document.getElementById('planSubtitle');
    if (titleEl && this.activePlan) {
      titleEl.textContent = this.activePlan.title || 'Personalized Recommendations';
    }
    if (subtitleEl && this.activePlan) {
      subtitleEl.textContent = `Smart recommendations tailored to your ${UI.formatCurrency(this.activePlan.budget, this.activePlan.currency)} budget.`;
    }
  },

  // Dynamic Budget Calculation & Meter
  renderBudgetGauge() {
    const budgetCard = document.getElementById('budgetSummaryCard');
    if (!budgetCard || !this.activePlan) return;

    const totalBudget = Number(this.activePlan.budget) || 1000;
    
    // Sum prices of visible recommended items
    let allocated = 0;
    this.filteredData.forEach(item => {
      const price = Number(item.price || item.pricePerGuest * (this.activePlan.guests || 20)) || 0;
      const qty = Number(item.quantity || 1);
      allocated += price * qty;
    });

    const remaining = totalBudget - allocated;
    const percentAllocated = Math.round((allocated / totalBudget) * 100);

    const isOver = remaining < 0;
    const isOptimal = percentAllocated >= 75 && percentAllocated <= 100;

    budgetCard.innerHTML = `
      <div class="budget-stats-row">
        <div class="budget-stat-box">
          <p class="label">Total Budget</p>
          <h3 class="value">${UI.formatCurrency(totalBudget, this.activePlan.currency)}</h3>
        </div>
        <div class="budget-stat-box highlight">
          <p class="label">Allocated Total</p>
          <h3 class="value">${UI.formatCurrency(allocated, this.activePlan.currency)}</h3>
        </div>
        <div class="budget-stat-box ${isOver ? 'warning' : 'success'}">
          <p class="label">${isOver ? 'Exceeds By' : 'Remaining'}</p>
          <h3 class="value">${UI.formatCurrency(Math.abs(remaining), this.activePlan.currency)}</h3>
        </div>
        <div class="budget-stat-box">
          <p class="label">Allocation Rate</p>
          <h3 class="value">${percentAllocated}%</h3>
        </div>
      </div>

      <div class="budget-progress-container">
        <div class="budget-progress-header">
          <span>Budget Utilization</span>
          <span>${percentAllocated}% ${isOver ? '(Over Allocated)' : 'Committed'}</span>
        </div>
        <div class="budget-progress-bar">
          <div class="budget-progress-fill ${isOver ? 'status-over' : (isOptimal ? 'status-optimal' : '')}" 
               style="width: ${Math.min(percentAllocated, 100)}%;"></div>
        </div>
      </div>

      ${isOver ? `
        <div class="budget-alert alert-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Budget Exceeded:</strong> Current selection exceeds your target budget by ${UI.formatCurrency(Math.abs(remaining), this.activePlan.currency)}. Consider filtering items by price or removing non-essential pieces.
          </div>
        </div>
      ` : `
        <div class="budget-alert alert-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div>
            <strong>Within Budget:</strong> Great planning! You have ${UI.formatCurrency(remaining, this.activePlan.currency)} in reserve funds available.
          </div>
        </div>
      `}
    `;
  },

  setupFilters(catalogType) {
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;

    // Get unique categories from current dataset
    const categories = ['All', ...new Set(this.catalogData.map(item => item.category))];

    filterContainer.innerHTML = categories.map(cat => `
      <button class="filter-pill ${cat === this.currentCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    filterContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.cat;
        this.applyFilters();
      });
    });
  },

  setupSearch() {
    const searchInput = document.getElementById('recommendationSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.applyFilters();
    });
  },

  setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applyFilters();
    });
  },

  applyFilters() {
    let result = [...this.catalogData];

    // Filter by Category
    if (this.currentCategory !== 'All') {
      result = result.filter(item => item.category === this.currentCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(this.searchQuery)) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery)) ||
        (item.style && item.style.toLowerCase().includes(this.searchQuery)) ||
        (item.category && item.category.toLowerCase().includes(this.searchQuery))
      );
    }

    // Sort
    if (this.sortBy === 'price-low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (this.sortBy === 'price-high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (this.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    this.filteredData = result;
    this.renderProducts();
    this.renderBudgetGauge();
  },

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (this.filteredData.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3>No Recommendations Found</h3>
            <p>We couldn't find items matching your search or filter. Try clearing filters or adjusting your keywords.</p>
            <button class="btn btn-secondary btn-sm" onclick="Recommendations.resetFilters()">Clear Filters</button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredData.map(item => {
      const isSaved = StorageService.isItemSaved(item.id);
      const priceDisplay = item.unit 
        ? `${UI.formatCurrency(item.price || item.pricePerGuest, this.activePlan?.currency)} <span class="unit">/${item.unit}</span>`
        : UI.formatCurrency(item.price, this.activePlan?.currency);

      return `
        <div class="product-card" id="card-${item.id}">
          <div class="product-card-header">
            <div class="product-card-img-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>${item.category}</span>
            </div>
            
            <div class="product-card-badges">
              ${item.badge ? `<span class="product-badge ${item.badge.includes('Luxury') || item.badge.includes('Heirloom') ? 'gold' : ''}">${item.badge}</span>` : ''}
              ${item.style ? `<span class="product-badge">${item.style}</span>` : ''}
            </div>

            <button class="product-bookmark-btn ${isSaved ? 'saved' : ''}" 
                    onclick="Recommendations.handleToggleSave('${item.id}')"
                    title="${isSaved ? 'Remove from Saved' : 'Save to Wishlist'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>

          <div class="product-card-body">
            <div class="product-category-tag">${item.category}</div>
            <h4 class="product-card-title">${item.name}</h4>
            <p class="product-card-desc">${item.description}</p>

            <div class="product-meta-row">
              <div class="product-price-block">
                <h4>${priceDisplay}</h4>
              </div>
              <div class="product-rating-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>${item.rating || '4.8'}</span>
              </div>
            </div>

            <div class="product-card-actions">
              <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="Recommendations.showDetailsModal('${item.id}')">
                Details
              </button>
              ${item.links?.amazon ? `
                <a href="${item.links.amazon}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex:1;">
                  Shop Link
                </a>
              ` : `
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="UI.showToast('Demo link placeholder: ready for booking or e-commerce integration.', 'info')">
                  Shop Demo
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleToggleSave(itemId) {
    const item = this.catalogData.find(i => i.id === itemId);
    if (!item) return;

    const isNowSaved = StorageService.toggleSaveItem(item);
    
    // Update button in place
    const card = document.getElementById(`card-${itemId}`);
    if (card) {
      const btn = card.querySelector('.product-bookmark-btn');
      if (btn) {
        btn.classList.toggle('saved', isNowSaved);
        btn.querySelector('svg').setAttribute('fill', isNowSaved ? 'currentColor' : 'none');
      }
    }

    UI.showToast(isNowSaved ? `Saved "${item.name}" to your wishlist!` : `Removed "${item.name}" from wishlist.`, 'success');
  },

  showDetailsModal(itemId) {
    const item = this.catalogData.find(i => i.id === itemId);
    if (!item) return;

    const html = `
      <div style="margin-bottom: 1.25rem;">
        <span class="product-category-tag">${item.category}</span>
        <h3 style="font-size: 1.4rem; margin: 0.25rem 0 0.75rem;">${item.name}</h3>
        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">${item.description}</p>
        
        <div style="background: var(--surface-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong>Estimated Price:</strong>
            <span style="color: var(--primary-color); font-weight: 700;">${UI.formatCurrency(item.price, this.activePlan?.currency)}</span>
          </div>
          ${item.dimensions ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>Dimensions / Specs:</strong>
              <span>${item.dimensions}</span>
            </div>
          ` : ''}
          ${item.style ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>Design Style:</strong>
              <span>${item.style}</span>
            </div>
          ` : ''}
          ${item.metal ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>Metal / Material:</strong>
              <span>${item.metal}</span>
            </div>
          ` : ''}
          ${item.stylingTip ? `
            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); color: #92400e; font-style: italic;">
              <strong>Styling Advice:</strong> ${item.stylingTip}
            </div>
          ` : ''}
        </div>

        <p style="font-size: 0.8rem; color: var(--muted-text-color);">
          <em>Note: Product links and pricing are safe demo placeholders configured in JSON data.</em>
        </p>
      </div>
    `;

    UI.openModal({
      title: 'Recommendation Details',
      bodyHtml: html,
      confirmText: 'Save to Wishlist',
      onConfirm: () => {
        this.handleToggleSave(itemId);
      }
    });
  },

  resetFilters() {
    this.currentCategory = 'All';
    this.searchQuery = '';
    const searchInput = document.getElementById('recommendationSearch');
    if (searchInput) searchInput.value = '';
    const filterContainer = document.getElementById('categoryFilters');
    if (filterContainer) {
      filterContainer.querySelectorAll('.filter-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === 'All');
      });
    }
    this.applyFilters();
  }
};

window.Recommendations = Recommendations;
