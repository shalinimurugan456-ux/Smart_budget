/**
 * PocketSmart AI - User Dashboard Controller
 * Calculates live stats from localStorage history and wishlist, renders recent activity feed.
 */

const Dashboard = {
  init() {
    this.hydrateUserGreeting();
    this.renderStats();
    this.renderRecentActivity();
  },

  hydrateUserGreeting() {
    const user = AuthService.getCurrentUser();
    const nameEl = document.getElementById('dashboardUserName');
    if (nameEl) {
      nameEl.textContent = user ? user.name : 'Valued Planner';
    }
  },

  renderStats() {
    const history = StorageService.getHistory();
    const saved = StorageService.getSavedItems();

    // Total budget planned across all active plans
    let totalBudget = 0;
    history.forEach(p => totalBudget += (Number(p.budget) || 0));

    const totalPlansEl = document.getElementById('statTotalPlans');
    const totalSavedEl = document.getElementById('statTotalSaved');
    const totalBudgetEl = document.getElementById('statTotalBudget');
    const activePlannersEl = document.getElementById('statActivePlanners');

    if (totalPlansEl) totalPlansEl.textContent = history.length;
    if (totalSavedEl) totalSavedEl.textContent = saved.length;
    if (totalBudgetEl) totalBudgetEl.textContent = UI.formatCurrency(totalBudget);
    if (activePlannersEl) activePlannersEl.textContent = '3 Active';
  },

  renderRecentActivity() {
    const history = StorageService.getHistory();
    const listEl = document.getElementById('recentActivityList');
    if (!listEl) return;

    if (history.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="padding: 2.5rem 1rem;">
          <div class="empty-state-icon" style="width: 56px; height: 56px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <h4 style="margin-bottom: 0.35rem;">No Recent Plans Yet</h4>
          <p style="font-size: 0.9rem; margin-bottom: 1.25rem;">Start your first smart budget plan below to see recommendations and analytics here.</p>
          <a href="home-planner.html" class="btn btn-primary btn-sm">Create First Plan</a>
        </div>
      `;
      return;
    }

    // Show up to 5 recent items
    const recent = history.slice(0, 5);
    listEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${recent.map(plan => {
          let recUrl = 'home-recommendations.html';
          if (plan.type?.includes('Party')) recUrl = 'party-recommendations.html';
          if (plan.type?.includes('Jewelry')) recUrl = 'jewelry-recommendations.html';

          const formattedDate = new Date(plan.createdAt || Date.now()).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return `
            <div style="background: var(--surface-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.15rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; transition: border-color var(--transition-fast);">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
                  <span class="section-tag" style="padding: 0.2rem 0.6rem; font-size: 0.72rem; margin: 0;">${plan.type || 'Budget Plan'}</span>
                  <span style="font-size: 0.8rem; color: var(--muted-text-color);">${formattedDate}</span>
                </div>
                <h4 style="font-size: 1.05rem; margin-bottom: 0.2rem;">${plan.title || 'Personalized Plan'}</h4>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">
                  Target Budget: <strong style="color: var(--primary-color);">${UI.formatCurrency(plan.budget, plan.currency)}</strong>
                </p>
              </div>

              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <a href="${recUrl}?planId=${plan.id}" class="btn btn-secondary btn-sm">
                  View Plan
                </a>
                <button class="btn btn-outline btn-sm" style="padding: 0.4rem 0.6rem; color: var(--danger-color); border-color: #fca5a5;" 
                        onclick="Dashboard.deletePlan('${plan.id}')" title="Delete Plan">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  deletePlan(planId) {
    UI.openModal({
      title: 'Delete Plan',
      bodyHtml: '<p>Are you sure you want to remove this saved plan from your history?</p>',
      confirmText: 'Delete',
      onConfirm: () => {
        StorageService.deleteHistoryItem(planId);
        UI.showToast('Plan removed from history.', 'info');
        Dashboard.renderStats();
        Dashboard.renderRecentActivity();
      }
    });
  }
};

window.Dashboard = Dashboard;
