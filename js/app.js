/**
 * PocketSmart AI - Main Application Entrypoint
 * Coordinates page lifecycle, landing page interactive elements, and global components.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize testimonials on pages that have the testimonials container
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  if (testimonialsGrid) {
    try {
      const res = await fetch('data/testimonials.json');
      let items = [];
      if (res.ok) {
        items = await res.json();
      } else {
        // Fallback testimonials
        items = [
          {
            name: "Sophia Reynolds",
            role: "Interior Design Enthusiast",
            location: "San Francisco, CA",
            avatar: "SR",
            quote: "PocketSmart AI took the overwhelm out of furnishing our new 3-bedroom apartment. Keeping us precisely within our budget!",
            rating: 5
          },
          {
            name: "Marcus & Elena Vance",
            role: "Newlyweds & Event Hosts",
            location: "Austin, TX",
            avatar: "MV",
            quote: "Planning our 60-guest engagement party seemed impossible until we used the Party Budget Planner. Zero hidden costs.",
            rating: 5
          },
          {
            name: "Devon Patel",
            role: "Tech Founder & Watch Collector",
            location: "Seattle, WA",
            avatar: "DP",
            quote: "The jewelry curation algorithm paired my anniversary budget with timeless 18K solid gold pieces and genuine styling advice.",
            rating: 5
          }
        ];
      }

      testimonialsGrid.innerHTML = items.map(t => `
        <div class="testimonial-card">
          <div>
            <div class="testimonial-rating">
              ${'★'.repeat(t.rating || 5)}
            </div>
            <p class="testimonial-quote">"${t.quote}"</p>
          </div>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${t.avatar || t.name.slice(0, 2).toUpperCase()}</div>
            <div class="testimonial-meta">
              <h5>${t.name}</h5>
              <p>${t.role} • ${t.location || 'Verified Demo'}</p>
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('Testimonials load error:', e);
    }
  }

  // 2. Interactive quick budget preview on landing hero if present
  const heroBudgetSlider = document.getElementById('heroBudgetSlider');
  const heroBudgetValue = document.getElementById('heroBudgetValue');
  if (heroBudgetSlider && heroBudgetValue) {
    heroBudgetSlider.addEventListener('input', (e) => {
      heroBudgetValue.textContent = UI.formatCurrency(e.target.value);
    });
  }
});
