/**
 * PocketSmart AI - Admin Portal Controller
 * Provides CRUD for recommendation items in localStorage, overview metrics, user tables, and demo analytics.
 */

const Admin = {
  currentTab: 'overview',
  allProducts: [],
  filteredProducts: [],

  async init() {
    this.setupTabs();
    await this.loadAllProducts();
    this.renderKPIs();
    this.renderProductsTable();
    this.renderUsersTable();
    this.setupSearchAndFilter();
    this.setupAddItemModal();
  },

  setupTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.admin-nav-item[data-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
  },

  async loadAllProducts() {
    const home = await StorageService.fetchCatalog('home-products.json');
    const party = await StorageService.fetchCatalog('party-recommendations.json');
    const jewelry = await StorageService.fetchCatalog('jewelry-recommendations.json');

    this.allProducts = [
      ...home.map(p => ({ ...p, catalog: 'Home Interior' })),
      ...party.map(p => ({ ...p, catalog: 'Party & Events' })),
      ...jewelry.map(p => ({ ...p, catalog: 'Jewelry & Luxury' }))
    ];

    this.filteredProducts = [...this.allProducts];
  },

  renderKPIs() {
    const registeredUsers = AuthService.getRegisteredUsers();
    const plansHistory = StorageService.getHistory();
    const savedItems = StorageService.getSavedItems();

    const kpiUsers = document.getElementById('kpiTotalUsers');
    const kpiPlans = document.getElementById('kpiTotalPlans');
    const kpiCatalog = document.getElementById('kpiCatalogCount');
    const kpiSaved = document.getElementById('kpiSavedCount');

    if (kpiUsers) kpiUsers.textContent = 1 + registeredUsers.length; // Include default admin
    if (kpiPlans) kpiPlans.textContent = plansHistory.length;
    if (kpiCatalog) kpiCatalog.textContent = this.allProducts.length;
    if (kpiSaved) kpiSaved.textContent = savedItems.length;
  },

  renderProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;

    if (this.filteredProducts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2rem; color: var(--muted-text-color);">
            No recommendation records found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredProducts.map(p => `
      <tr>
        <td><strong>${p.id}</strong></td>
        <td>
          <span style="font-weight:600; color:var(--primary-color);">${p.name}</span>
          <div style="font-size:0.75rem; color:var(--muted-text-color);">${p.description ? p.description.slice(0, 60) + '...' : ''}</div>
        </td>
        <td><span class="section-tag" style="margin:0; padding:0.2rem 0.5rem; font-size:0.7rem;">${p.catalog || p.category}</span></td>
        <td><strong>${UI.formatCurrency(p.price || p.pricePerGuest)}</strong></td>
        <td>⭐ ${p.rating || '4.8'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick="Admin.openEditModal('${p.id}')">Edit</button>
            <button class="btn btn-outline btn-sm" style="color:var(--danger-color); border-color:#fca5a5;" onclick="Admin.deleteProduct('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  renderUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    const registered = AuthService.getRegisteredUsers();
    const demoAccounts = [
      { id: 'usr-001', name: 'Alex Mercer (Admin)', email: 'admin@pocketsmart.ai', role: 'admin', createdAt: '2026-08-01' },
      ...registered
    ];

    tbody.innerHTML = demoAccounts.map(u => `
      <tr>
        <td><strong>${u.id}</strong></td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td><span class="section-tag ${u.role === 'admin' ? 'gold' : ''}" style="margin:0; padding:0.2rem 0.6rem; font-size:0.72rem;">${u.role}</span></td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}</td>
      </tr>
    `).join('');
  },

  setupSearchAndFilter() {
    const searchInput = document.getElementById('adminSearch');
    const catalogFilter = document.getElementById('adminCatalogFilter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        this.filterProducts(q, catalogFilter ? catalogFilter.value : 'all');
      });
    }

    if (catalogFilter) {
      catalogFilter.addEventListener('change', (e) => {
        const cat = e.target.value;
        const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
        this.filterProducts(q, cat);
      });
    }
  },

  filterProducts(query, catalog) {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query) || 
        p.id.toLowerCase().includes(query) || 
        (p.category && p.category.toLowerCase().includes(query));
      
      const matchCatalog = catalog === 'all' || 
        (p.catalog && p.catalog.toLowerCase().includes(catalog.toLowerCase()));

      return matchQuery && matchCatalog;
    });

    this.renderProductsTable();
  },

  setupAddItemModal() {
    const addBtn = document.getElementById('adminAddNewBtn');
    if (!addBtn) return;

    addBtn.addEventListener('click', () => {
      this.openCreateModal();
    });
  },

  openCreateModal() {
    const bodyHtml = `
      <form id="adminItemForm" style="display:flex; flex-direction:column; gap:1rem;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Catalog Section</label>
          <select class="form-control" name="catalog" required>
            <option value="Home Interior">Home Interior</option>
            <option value="Party & Events">Party & Events</option>
            <option value="Jewelry & Luxury">Jewelry & Luxury</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Category / Classification</label>
          <input type="text" class="form-control" name="category" placeholder="e.g. Lighting, Venue, Rings" required />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Product / Service Name</label>
          <input type="text" class="form-control" name="name" placeholder="e.g. Nordic Pendant Lamp" required />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Estimated Price ($)</label>
          <input type="number" class="form-control" name="price" placeholder="199" min="1" required />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3" placeholder="Detailed specification and features..." required></textarea>
        </div>
      </form>
    `;

    UI.openModal({
      title: 'Add New Recommendation Item',
      bodyHtml: bodyHtml,
      confirmText: 'Save Item',
      onConfirm: () => {
        const form = document.getElementById('adminItemForm');
        if (!form) return;

        const newItem = {
          id: 'custom-' + Date.now(),
          catalog: form.catalog.value,
          category: form.category.value,
          name: form.name.value,
          price: Number(form.price.value) || 100,
          description: form.description.value,
          rating: 4.9,
          badge: 'New Arrival',
          links: { amazon: '#' }
        };

        StorageService.saveCustomProduct(newItem);
        UI.showToast(`Saved "${newItem.name}" to catalog!`, 'success');
        this.loadAllProducts().then(() => {
          this.renderProductsTable();
          this.renderKPIs();
        });
      }
    });
  },

  openEditModal(id) {
    const item = this.allProducts.find(p => p.id === id);
    if (!item) return;

    const bodyHtml = `
      <form id="adminEditForm" style="display:flex; flex-direction:column; gap:1rem;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Item ID (Read-only)</label>
          <input type="text" class="form-control" value="${item.id}" disabled />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Product Name</label>
          <input type="text" class="form-control" name="name" value="${item.name}" required />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Category</label>
          <input type="text" class="form-control" name="category" value="${item.category || ''}" required />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Estimated Price ($)</label>
          <input type="number" class="form-control" name="price" value="${item.price || item.pricePerGuest || 100}" required />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3" required>${item.description || ''}</textarea>
        </div>
      </form>
    `;

    UI.openModal({
      title: 'Edit Recommendation Item',
      bodyHtml: bodyHtml,
      confirmText: 'Update Item',
      onConfirm: () => {
        const form = document.getElementById('adminEditForm');
        if (!form) return;

        const updated = {
          ...item,
          name: form.name.value,
          category: form.category.value,
          price: Number(form.price.value),
          description: form.description.value
        };

        StorageService.saveCustomProduct(updated);
        UI.showToast(`Updated "${updated.name}" successfully!`, 'success');
        this.loadAllProducts().then(() => {
          this.renderProductsTable();
        });
      }
    });
  },

  deleteProduct(id) {
    UI.openModal({
      title: 'Delete Recommendation Item',
      bodyHtml: `<p>Are you sure you want to delete item <strong>${id}</strong>? This change will be stored in your demo session.</p>`,
      confirmText: 'Delete',
      onConfirm: () => {
        StorageService.deleteCustomProduct(id);
        this.allProducts = this.allProducts.filter(p => p.id !== id);
        this.filteredProducts = this.filteredProducts.filter(p => p.id !== id);
        this.renderProductsTable();
        this.renderKPIs();
        UI.showToast('Item deleted successfully.', 'info');
      }
    });
  },

  resetCatalogDemo() {
    UI.openModal({
      title: 'Reset Demo Catalog',
      bodyHtml: '<p>This will reset all custom edits, restoring the original default catalog from JSON files.</p>',
      confirmText: 'Reset Now',
      onConfirm: () => {
        localStorage.removeItem('pocketsmart_custom_products');
        UI.showToast('Demo catalog reset to default JSON baseline.', 'success');
        this.loadAllProducts().then(() => {
          this.renderProductsTable();
          this.renderKPIs();
        });
      }
    });
  }
};

window.Admin = Admin;
