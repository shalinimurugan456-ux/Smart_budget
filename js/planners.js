/**
 * PocketSmart AI - Planners Logic & Multi-Section Form Processing
 * Handles validation, budget allocation formulas, draft persistence, and plan generation.
 */

const Planners = {
  // 1. Home Interior Planner Form Controller
  initHomePlanner() {
    const form = document.getElementById('homePlannerForm');
    if (!form) return;

    // Load any saved draft
    const draft = localStorage.getItem('pocketsmart_draft_home');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        if (form.budget) form.budget.value = data.budget || '';
        if (form.currency) form.currency.value = data.currency || 'USD';
        if (form.style) form.style.value = data.style || 'Modern';
        if (form.lightsCount) form.lightsCount.value = data.lightsCount || 4;
        if (form.fansCount) form.fansCount.value = data.fansCount || 2;
        if (form.furnitureCount) form.furnitureCount.value = data.furnitureCount || 3;
        if (form.diningCount) form.diningCount.value = data.diningCount || 1;
        if (form.notes) form.notes.value = data.notes || '';

        if (Array.isArray(data.rooms)) {
          form.querySelectorAll('input[name="rooms"]').forEach(cb => {
            cb.checked = data.rooms.includes(cb.value);
            if (cb.checked) cb.closest('.checkbox-card')?.classList.add('selected');
          });
        }
        UI.showToast('Restored your previously saved home planner draft.', 'info');
      } catch (e) {}
    }

    // Interactive checkbox card styling
    form.querySelectorAll('.checkbox-card input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        input.closest('.checkbox-card').classList.toggle('selected', input.checked);
      });
    });

    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        const draftData = Planners.serializeHomeForm(form);
        localStorage.setItem('pocketsmart_draft_home', JSON.stringify(draftData));
        UI.showToast('Home planner draft saved successfully!', 'success');
      });
    }

    // Reset button
    const resetBtn = document.getElementById('resetFormBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        localStorage.removeItem('pocketsmart_draft_home');
        form.querySelectorAll('.checkbox-card').forEach(c => c.classList.remove('selected'));
        UI.showToast('Planner form reset.', 'info');
      });
    }

    // Form submit & plan generation
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Planners.serializeHomeForm(form);

      // Validation
      if (!data.budget || Number(data.budget) < 100) {
        UI.showToast('Please specify a realistic budget of at least $100.', 'danger');
        form.budget.focus();
        return;
      }

      if (data.rooms.length === 0) {
        UI.showToast('Please select at least one room to include.', 'warning');
        return;
      }

      // Generate Plan Object
      const plan = {
        id: 'home-' + Date.now(),
        type: 'Home Interior',
        title: `${data.style} Style Home Interior Plan`,
        budget: Number(data.budget),
        currency: data.currency,
        style: data.style,
        rooms: data.rooms,
        specs: {
          lights: Number(data.lightsCount) || 1,
          fans: Number(data.fansCount) || 1,
          furniture: Number(data.furnitureCount) || 1,
          dining: Number(data.diningCount) || 0,
          notes: data.notes
        },
        createdAt: new Date().toISOString()
      };

      // Persist plan in Storage
      StorageService.savePlanToHistory(plan);
      sessionStorage.setItem('pocketsmart_active_plan', JSON.stringify(plan));
      localStorage.removeItem('pocketsmart_draft_home');

      UI.showToast('Generating personalized recommendations...', 'success');
      setTimeout(() => {
        window.location.href = `home-recommendations.html?planId=${plan.id}`;
      }, 600);
    });
  },

  serializeHomeForm(form) {
    const rooms = [];
    form.querySelectorAll('input[name="rooms"]:checked').forEach(cb => rooms.push(cb.value));
    return {
      budget: form.budget.value,
      currency: form.currency.value,
      style: form.style.value,
      rooms: rooms,
      lightsCount: form.lightsCount.value,
      fansCount: form.fansCount.value,
      furnitureCount: form.furnitureCount.value,
      diningCount: form.diningCount.value,
      notes: form.notes ? form.notes.value : ''
    };
  },

  // 2. Party Budget Planner Form Controller
  initPartyPlanner() {
    const form = document.getElementById('partyPlannerForm');
    if (!form) return;

    // Load draft if exists
    const draft = localStorage.getItem('pocketsmart_draft_party');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        if (form.budget) form.budget.value = data.budget || '';
        if (form.guests) form.guests.value = data.guests || 25;
        if (form.partyType) form.partyType.value = data.partyType || 'Birthday';
        if (form.venueType) form.venueType.value = data.venueType || 'Indoor';
        if (form.notes) form.notes.value = data.notes || '';

        if (Array.isArray(data.needs)) {
          form.querySelectorAll('input[name="needs"]').forEach(cb => {
            cb.checked = data.needs.includes(cb.value);
            if (cb.checked) cb.closest('.checkbox-card')?.classList.add('selected');
          });
        }
      } catch (e) {}
    }

    form.querySelectorAll('.checkbox-card input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        input.closest('.checkbox-card').classList.toggle('selected', input.checked);
      });
    });

    const saveDraftBtn = document.getElementById('savePartyDraftBtn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        const data = Planners.serializePartyForm(form);
        localStorage.setItem('pocketsmart_draft_party', JSON.stringify(data));
        UI.showToast('Party planner draft saved!', 'success');
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Planners.serializePartyForm(form);

      if (!data.budget || Number(data.budget) < 200) {
        UI.showToast('Please specify a realistic party budget of at least $200.', 'danger');
        return;
      }
      if (!data.guests || Number(data.guests) < 2) {
        UI.showToast('Guest count must be at least 2.', 'warning');
        return;
      }
      if (data.needs.length === 0) {
        UI.showToast('Please select at least one party service requirement.', 'warning');
        return;
      }

      const plan = {
        id: 'party-' + Date.now(),
        type: 'Party & Events',
        title: `${data.partyType} Event Plan (${data.guests} Guests)`,
        budget: Number(data.budget),
        currency: 'USD',
        partyType: data.partyType,
        guests: Number(data.guests),
        venueType: data.venueType,
        needs: data.needs,
        notes: data.notes,
        createdAt: new Date().toISOString()
      };

      StorageService.savePlanToHistory(plan);
      sessionStorage.setItem('pocketsmart_active_plan', JSON.stringify(plan));
      localStorage.removeItem('pocketsmart_draft_party');

      UI.showToast('Creating event recommendation package...', 'success');
      setTimeout(() => {
        window.location.href = `party-recommendations.html?planId=${plan.id}`;
      }, 600);
    });
  },

  serializePartyForm(form) {
    const needs = [];
    form.querySelectorAll('input[name="needs"]:checked').forEach(cb => needs.push(cb.value));
    return {
      budget: form.budget.value,
      guests: form.guests.value,
      partyType: form.partyType.value,
      venueType: form.venueType.value,
      needs: needs,
      notes: form.notes ? form.notes.value : ''
    };
  },

  // 3. Jewelry Budget Planner Form Controller
  initJewelryPlanner() {
    const form = document.getElementById('jewelryPlannerForm');
    if (!form) return;

    form.querySelectorAll('.checkbox-card input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        form.querySelectorAll(`input[name="${input.name}"]`).forEach(radio => {
          radio.closest('.checkbox-card').classList.toggle('selected', radio.checked);
        });
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const budget = form.budget.value;
      const jewelryType = form.jewelryType.value;
      const occasion = form.occasion.value;
      const metal = form.metal.value;
      const style = form.style.value;
      const color = form.color ? form.color.value : 'Any';

      if (!budget || Number(budget) < 50) {
        UI.showToast('Please specify a jewelry budget of at least $50.', 'danger');
        return;
      }

      const plan = {
        id: 'jewelry-' + Date.now(),
        type: 'Jewelry & Luxury',
        title: `${metal} ${jewelryType} for ${occasion}`,
        budget: Number(budget),
        currency: 'USD',
        jewelryType: jewelryType,
        occasion: occasion,
        metal: metal,
        style: style,
        color: color,
        createdAt: new Date().toISOString()
      };

      StorageService.savePlanToHistory(plan);
      sessionStorage.setItem('pocketsmart_active_plan', JSON.stringify(plan));

      UI.showToast('Curating fine jewelry recommendations...', 'success');
      setTimeout(() => {
        window.location.href = `jewelry-recommendations.html?planId=${plan.id}`;
      }, 600);
    });
  }
};

window.Planners = Planners;

document.addEventListener('DOMContentLoaded', () => {
  Planners.initHomePlanner();
  Planners.initPartyPlanner();
  Planners.initJewelryPlanner();
});
