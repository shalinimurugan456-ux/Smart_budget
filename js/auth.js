/**
 * PocketSmart AI - Demo Authentication & Session Management
 * Provides demo login, registration, role verification, and route guards.
 */

const DEMO_USERS_KEY = 'pocketsmart_demo_registered_users';

const AuthService = {
  // Hardcoded demo credentials
  DEFAULT_CREDENTIALS: {
    username: 'admin',
    password: '12345'
  },

  getRegisteredUsers() {
    try {
      const data = localStorage.getItem(DEMO_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  register(fullName, email, password) {
    const users = this.getRegisteredUsers();
    
    // Check if user already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('A demo user with this email already exists.');
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: fullName,
      email: email.toLowerCase(),
      password: password,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

    // Auto-login the registered user
    this.createSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    return newUser;
  },

  login(usernameOrEmail, password, roleOverride = 'user') {
    const cleanUser = usernameOrEmail.trim();

    // Check default demo credentials
    if (cleanUser === this.DEFAULT_CREDENTIALS.username && password === this.DEFAULT_CREDENTIALS.password) {
      const user = {
        id: 'demo-admin-01',
        name: roleOverride === 'admin' ? 'Administrator' : 'Alex Mercer (Demo)',
        email: 'admin@pocketsmart.ai',
        role: roleOverride
      };
      this.createSession(user);
      return user;
    }

    // Check custom registered users
    const registered = this.getRegisteredUsers();
    const found = registered.find(u => 
      (u.email.toLowerCase() === cleanUser.toLowerCase() || u.name.toLowerCase() === cleanUser.toLowerCase()) && 
      u.password === password
    );

    if (found) {
      const user = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role || 'user'
      };
      this.createSession(user);
      return user;
    }

    throw new Error('Invalid demo credentials. Use username: admin / password: 12345');
  },

  createSession(user) {
    if (window.StorageService) {
      window.StorageService.setAuthUser(user);
    }
  },

  logout() {
    if (window.StorageService) {
      window.StorageService.clearAuthUser();
    }
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    return window.StorageService ? window.StorageService.getAuthUser() : null;
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Route Guard execution
  enforceRouteGuards() {
    const pageAuth = document.body.getAttribute('data-auth');
    if (!pageAuth) return;

    const user = this.getCurrentUser();

    if (pageAuth === 'required') {
      if (!user) {
        // Redirect to login with return path
        const current = encodeURIComponent(window.location.pathname.split('/').pop() || '');
        window.location.href = `login.html?redirect=${current}`;
      }
    } else if (pageAuth === 'admin') {
      if (!user || user.role !== 'admin') {
        window.location.href = 'admin-login.html?error=unauthorized';
      }
    }
  }
};

window.AuthService = AuthService;

// Auto-check guards on page load
document.addEventListener('DOMContentLoaded', () => {
  AuthService.enforceRouteGuards();
});
