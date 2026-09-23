/**
 * PocketSmart AI - UI Utilities & Shared Components
 * Handles toasts, modals, currency formatting, navigation state, and header rendering.
 */

const UI = {
  // Toast Notifications
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose icon
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Currency Formatter
  formatCurrency(amount, currencyCode = 'USD') {
    const num = Number(amount) || 0;
    const symbols = {
      USD: '$',
      INR: '₹',
      EUR: '€',
      GBP: '£'
    };
    const symbol = symbols[currencyCode] || '$';
    return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  },

  // Modal Dialog System
  openModal({ title, bodyHtml, confirmText = 'Confirm', onConfirm = null, showConfirm = true }) {
    let overlay = document.getElementById('globalModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'globalModalOverlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-container" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3 id="globalModalTitle">Modal</h3>
            <button class="modal-close-btn" id="globalModalClose" aria-label="Close">&times;</button>
          </div>
          <div class="modal-body" id="globalModalBody"></div>
          <div class="modal-footer" id="globalModalFooter">
            <button class="btn btn-secondary" id="globalModalCancel">Close</button>
            <button class="btn btn-primary" id="globalModalConfirm">${confirmText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Event listeners
      document.getElementById('globalModalClose').addEventListener('click', () => UI.closeModal());
      document.getElementById('globalModalCancel').addEventListener('click', () => UI.closeModal());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) UI.closeModal();
      });
    }

    document.getElementById('globalModalTitle').textContent = title;
    document.getElementById('globalModalBody').innerHTML = bodyHtml;

    const confirmBtn = document.getElementById('globalModalConfirm');
    if (showConfirm && onConfirm) {
      confirmBtn.style.display = 'inline-flex';
      confirmBtn.textContent = confirmText;
      // Replace onClick cleanly
      const newConfirm = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
      newConfirm.addEventListener('click', () => {
        onConfirm();
        UI.closeModal();
      });
    } else {
      confirmBtn.style.display = 'none';
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const overlay = document.getElementById('globalModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Navigation and Header Hydration
  initHeader() {
    const authUser = window.StorageService ? window.StorageService.getAuthUser() : null;
    const navActions = document.querySelector('.nav-actions');
    const mobileActions = document.querySelector('.mobile-actions');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Mobile menu toggle
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const isOpen = navMenu.classList.contains('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
      });

      // Close mobile menu on clicking any link
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });
    }

    // Dynamic User Actions
    const userHtml = authUser ? `
      <a href="dashboard.html" class="nav-user-pill" title="Go to Dashboard">
        <span class="nav-user-avatar">${authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}</span>
        <span>${authUser.name || 'User'}</span>
      </a>
      <button class="btn btn-secondary btn-sm" id="logoutBtn" style="padding: 0.4rem 0.8rem;">Logout</button>
    ` : `
      <a href="login.html" class="btn btn-secondary btn-sm">Sign In</a>
      <a href="index.html#planners" class="btn btn-primary btn-sm">Get Started</a>
    `;

    if (navActions) {
      navActions.innerHTML = userHtml;
    }
    if (mobileActions) {
      mobileActions.innerHTML = userHtml;
    }

    // Logout click binding
    document.querySelectorAll('#logoutBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.AuthService) {
          window.AuthService.logout();
        } else {
          window.StorageService.clearAuthUser();
          window.location.href = 'index.html';
        }
      });
    });

    // Mark current active nav item
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

window.UI = UI;
document.addEventListener('DOMContentLoaded', () => {
  UI.initHeader();
});
