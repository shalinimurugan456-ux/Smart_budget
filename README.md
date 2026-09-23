# PocketSmart AI – Premium Smart Budget & Recommendation Platform

> **Smart Budgeting. Personalized Recommendations. Better Decisions.**

PocketSmart AI is an AI-inspired smart budget planning and personalized recommendation platform for **Home Interiors**, **Parties & Events**, and **Fine Jewelry**. Designed with the polished aesthetics, responsive layout, and intuitive discovery of modern luxury e-commerce platforms, it enables users to balance their finances while achieving exceptional aesthetic outcomes.

---

## 1. Technology Stack

* **Structure:** Semantic HTML5
* **Styling:** Pure CSS3 (Flexbox, CSS Grid, Custom Properties, Media Queries, Smooth Transitions)
* **Logic:** Vanilla JavaScript (ES6+ Modules, zero external frameworks)
* **Data:** Modular JSON datasets (`data/*.json`) with built-in embedded fallbacks
* **Storage:** Browser `localStorage` for demo persistence (plans, wishlist, custom products)
* **Hosting:** 100% static hosting ready (Zero build step, Zero server dependencies, **GitHub Pages** compatible)

---

## 2. Platform Architecture & Features

### Public Pages
1. **Home Page (`index.html`):** Modern hero with lifestyle visual, budget statistics, planner launch cards, how it works steps, platform features grid, demo testimonials preview, and call-to-action banner.
2. **About / Features (`about.html`):** Mission statement, technical architecture matrix, category breakdowns, and frequently asked questions.
3. **Testimonials (`testimonials.html`):** Clearly labeled demo customer stories with category filtering and an interactive demo review submission form.
4. **Sign In (`login.html`):** Demo authentication with auto-fill helper, password visibility toggle, and session persistence.
5. **Register (`register.html`):** Client-side demo registration with real-time validation, password matching, and terms acknowledgment.
6. **Forgot Password (`forgot-password.html`):** Simulated password recovery workflow.
7. **404 Page (`404.html`):** Custom branded error page with recovery navigation.

### Authenticated User Pages
8. **User Dashboard (`dashboard.html`):** Account summary, live stats (Total Plans, Saved Items, Total Budget, Active Planners), quick-launch planner cards, and recent activity feed.
9. **Home Interior Planner (`home-planner.html`):** Multi-section planning form covering budget, room selections (Living, Kitchen, Bedroom, Dining, Balcony, Office), fixture counts (lights, fans, furniture, dining sets), and style preferences (Modern, Minimalist, Scandinavian, Luxury, Traditional, Industrial).
10. **Home Interior Recommendations (`home-recommendations.html`):** Real-time dynamic budget allocation gauge (Total, Allocated, Remaining, % rate), over-budget alerts, category filter pills, keyword search, price sorting, wishlist bookmarking, and specification modal.
11. **Party Budget Planner (`party-planner.html`):** Event planner with per-guest catering formulas, venue settings, service checkboxes (Catering, Decor, Entertainment, Photography, Venue), and dietary requirements.
12. **Party Recommendations (`party-recommendations.html`):** Live budget gauge tracking guest scaling, venue booking, sound, decor, and transparent 10% contingency reserves.
13. **Jewelry Budget Planner (`jewelry-planner.html`):** Luxury curation form with precious metals (14K/18K Gold, Diamond, Platinum, Rose Gold, Silver), occasion pairing (Wedding, Anniversary, Gift, Formal), and jewelry types.
14. **Jewelry Recommendations (`jewelry-recommendations.html`):** Curated gold, diamond, and watch cards with curator styling guidance, budget gauge, and details modal.
15. **Recommendation History (`history.html`):** Archive of generated planning sessions with direct link to view past recommendations, plan metadata, and deletion capabilities.
16. **Saved Recommendations / Wishlist (`saved.html`):** Centralized wishlist of bookmarked items with category filtering, specifications modal, and removal actions.
17. **User Profile / Settings (`profile.html`):** Account preferences, multi-currency selector (USD $, INR ₹, EUR €, GBP £), and demo session reset.

### Administrative Control Portal
18. **Admin Sign In (`admin-login.html`):** Dedicated administrative login with role verification and credentials auto-fill.
19. **Admin Dashboard (`admin-dashboard.html`):** Comprehensive console with sidebar navigation:
    * **Overview & KPIs:** Real-time metrics for total demo users, plans, catalog items, and wishlist bookmarks.
    * **Recommendation Data Management (CRUD):** Live table of all recommendation records with search, catalog filters, **Add New Item Modal**, **Edit Item Modal**, and **Delete** actions synced directly to `localStorage`.
    * **User Overview:** Table of registered demo accounts.
    * **Website Analytics:** Monthly volume chart and category traffic distribution.
    * **Admin Settings:** One-click baseline reset to default JSON files.

---

## 3. Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Demo User** | `admin` | `12345` |
| **Demo Administrator** | `admin` | `12345` |

*(You can also create custom demo users at `register.html`)*

> **Security & Demonstration Notice:**  
> This website is a static client-side prototype. The login and registration mechanisms use browser `localStorage` solely for user flow demonstration and state simulation. Production environments require a secure backend (e.g. OAuth, JWT, encrypted database).

---

## 4. Project Folder Structure

```
pocketsmart-ai/
├── index.html
├── about.html
├── testimonials.html
├── login.html
├── register.html
├── forgot-password.html
├── 404.html
├── dashboard.html
├── home-planner.html
├── home-recommendations.html
├── party-planner.html
├── party-recommendations.html
├── jewelry-planner.html
├── jewelry-recommendations.html
├── history.html
├── saved.html
├── profile.html
├── admin-login.html
├── admin-dashboard.html
│
├── css/
│   ├── style.css             # Design tokens, typography, layout, buttons, header & footer
│   ├── components.css        # Budget gauge, product cards, modals, toasts, form controls
│   ├── responsive.css        # Breakpoints (1440px, 1024px, 768px, 480px, 320px)
│   └── admin.css             # Admin portal layout, sidebar, tables, and KPI cards
│
├── js/
│   ├── storage.js            # Unified localStorage manager & JSON fetcher with fallbacks
│   ├── ui.js                 # Toasts, modals, currency formatter, and dynamic navbar
│   ├── auth.js               # Demo auth, route guards, session creation, and logout
│   ├── planners.js           # Multi-section form controllers, validation, and math
│   ├── recommendations.js    # Budget gauge, search, category filters, sorting, wishlist
│   ├── dashboard.js          # Stats computation, quick start cards, recent activity
│   ├── admin.js              # Admin portal controller (CRUD, user table, mock analytics)
│   └── app.js                # Global app initializer & testimonials hydrator
│
├── data/
│   ├── app-config.json       # Currency definitions and category lists
│   ├── home-products.json    # Curated home interior catalog
│   ├── party-recommendations.json # Curated party services and venue catalog
│   ├── jewelry-recommendations.json # Curated fine jewelry and watches catalog
│   └── testimonials.json     # Demo customer stories
│
├── assets/
│   ├── images/
│   │   ├── hero_banner.jpg   # High-resolution smart interior hero showcase
│   │   ├── home_thumb.jpg    # Scandinavian living room showcase
│   │   ├── party_thumb.jpg   # Luxury banquet celebration showcase
│   │   └── jewelry_thumb.jpg # Fine jewelry and gold chronograph showcase
│   └── icons/
│
├── python-placeholder/
│   └── README.md             # Non-functional compliance placeholder
└── README.md
```

---

## 5. GitHub Pages Deployment Guide

Because the application is built strictly with static assets and relative paths, deploying to **GitHub Pages** takes less than two minutes:

1. **Create a GitHub Repository:**
   * Go to [github.com](https://github.com) and create a new repository (e.g. `pocketsmart-ai`).
2. **Upload or Push the Project:**
   * Push your files to the `main` branch:
     ```bash
     git init
     git add .
     git commit -m "Initial commit: PocketSmart AI platform"
     git branch -M main
     git remote add origin https://github.com/<your-username>/pocketsmart-ai.git
     git push -u origin main
     ```
3. **Configure GitHub Pages:**
   * Open repository **Settings**.
   * In the left sidebar, click **Pages**.
   * Under **Branch**, select `main` and root directory `/(root)`.
   * Click **Save**.
4. **Access the Live Platform:**
   * GitHub Pages will generate your site at `https://<your-username>.github.io/pocketsmart-ai/`.
   * All navigation links, images, JSON data, and scripts will load seamlessly without build steps.

---

## 6. Offline & Local Testing Note

PocketSmart AI includes an integrated fallback catalog in `js/storage.js`. If you open `index.html` directly from your file system (via `file://` protocol where some web browsers restrict local `fetch()` calls), the application automatically detects this and loads the fallback catalog so that all planners, recommendations, wishlist saving, and admin features work out of the box!
