/**
 * PocketSmart AI - Centralized Storage & Data Layer
 * Handles localStorage persistence and JSON catalog fetching with embedded fallbacks.
 */

const STORAGE_KEYS = {
  AUTH_USER: 'pocketsmart_auth_user',
  HISTORY: 'pocketsmart_plan_history',
  SAVED_ITEMS: 'pocketsmart_saved_items',
  CUSTOM_PRODUCTS: 'pocketsmart_custom_products',
  SETTINGS: 'pocketsmart_settings'
};

// Embedded fallback datasets to ensure 100% operation on local file:// opening where browser blocks CORS fetch
const EMBEDDED_FALLBACKS = {
  'home-products.json': [
    {
      "id": "home-001",
      "category": "Lighting",
      "name": "Aura Smart Ambient Arc Floor Lamp",
      "description": "Minimalist brushed brass arc floor lamp with 3000K-6500K tunable smart warm-to-cool LED lighting and touch dimmer.",
      "price": 149,
      "quantity": 1,
      "currency": "USD",
      "style": "Modern",
      "rooms": ["Living Room", "Bedroom", "Home Office"],
      "rating": 4.8,
      "reviewsCount": 128,
      "dimensions": "65\"H x 18\"W",
      "badge": "Bestseller",
      "links": { "amazon": "https://www.amazon.com/s?k=modern+arc+floor+lamp", "flipkart": "https://www.flipkart.com/search?q=modern+floor+lamp" }
    },
    {
      "id": "home-002",
      "category": "Lighting",
      "name": "Nordic Halo Linear Pendant Chandelier",
      "description": "Sleek matte black architectural suspended chandelier ideal for dining areas and kitchen islands with glare-free diffuser.",
      "price": 220,
      "quantity": 1,
      "currency": "USD",
      "style": "Scandinavian",
      "rooms": ["Dining Room", "Kitchen"],
      "rating": 4.9,
      "reviewsCount": 84,
      "dimensions": "48\"L x 5\"H",
      "badge": "Top Rated",
      "links": { "amazon": "https://www.amazon.com/s?k=nordic+linear+pendant+light", "flipkart": "https://www.flipkart.com/search?q=pendant+light" }
    },
    {
      "id": "home-003",
      "category": "Lighting",
      "name": "Lumina Recessed Smart LED Downlights (Pack of 6)",
      "description": "Energy-efficient 12W ultra-thin dimmable recessed wafer lights with smartphone color temperature adjustment.",
      "price": 85,
      "quantity": 2,
      "currency": "USD",
      "style": "Minimalist",
      "rooms": ["Living Room", "Kitchen", "Bedroom", "Dining Room"],
      "rating": 4.7,
      "reviewsCount": 210,
      "dimensions": "6-inch diameter",
      "badge": "Energy Saver",
      "links": { "amazon": "https://www.amazon.com/s?k=smart+recessed+led+lights", "flipkart": "https://www.flipkart.com/search?q=led+downlights" }
    },
    {
      "id": "home-005",
      "category": "Ceiling Fans",
      "name": "BreezeSmart DC Motor Ultra-Quiet Fan with Light",
      "description": "Whisper-quiet 6-speed reversible brushless DC motor fan with integrated dimmable LED light kit and wireless remote.",
      "price": 185,
      "quantity": 1,
      "currency": "USD",
      "style": "Modern",
      "rooms": ["Living Room", "Bedroom"],
      "rating": 4.8,
      "reviewsCount": 175,
      "dimensions": "52\" Blade Span",
      "badge": "Whisper Quiet",
      "links": { "amazon": "https://www.amazon.com/s?k=quiet+dc+motor+ceiling+fan", "flipkart": "https://www.flipkart.com/search?q=ceiling+fan+with+led" }
    },
    {
      "id": "home-006",
      "category": "Ceiling Fans",
      "name": "Oslo Carved Solid Walnut Wood Ceiling Fan",
      "description": "Crafted with 3 solid aerodynamic natural walnut blades, moisture-resistant finish for covered patios and stylish interiors.",
      "price": 275,
      "quantity": 1,
      "currency": "USD",
      "style": "Scandinavian",
      "rooms": ["Living Room", "Dining Room", "Balcony"],
      "rating": 4.9,
      "reviewsCount": 94,
      "dimensions": "60\" Blade Span",
      "badge": "Premium Wood",
      "links": { "amazon": "https://www.amazon.com/s?k=solid+wood+ceiling+fan", "flipkart": "https://www.flipkart.com/search?q=wooden+blade+ceiling+fan" }
    },
    {
      "id": "home-008",
      "category": "Furniture",
      "name": "Haven Modular 3-Piece Sectional Sofa",
      "description": "Deep-seated luxury performance linen fabric sofa with high-resilience foam core and reversible modular chaise orientation.",
      "price": 890,
      "quantity": 1,
      "currency": "USD",
      "style": "Modern",
      "rooms": ["Living Room"],
      "rating": 4.9,
      "reviewsCount": 340,
      "dimensions": "104\"W x 65\"D x 33\"H",
      "badge": "Signature Piece",
      "links": { "amazon": "https://www.amazon.com/s?k=modular+sectional+sofa", "flipkart": "https://www.flipkart.com/search?q=sectional+sofa" }
    },
    {
      "id": "home-009",
      "category": "Furniture",
      "name": "Koben Velvet Accent Swivel Armchair",
      "description": "Curved silhouette mid-century reading armchair upholstered in stain-resistant emerald green velvet with hidden 360-degree swivel.",
      "price": 280,
      "quantity": 1,
      "currency": "USD",
      "style": "Luxury",
      "rooms": ["Living Room", "Bedroom", "Home Office"],
      "rating": 4.7,
      "reviewsCount": 98,
      "dimensions": "32\"W x 31\"D x 30\"H",
      "badge": "Designer Choice",
      "links": { "amazon": "https://www.amazon.com/s?k=velvet+swivel+accent+chair", "flipkart": "https://www.flipkart.com/search?q=velvet+accent+chair" }
    },
    {
      "id": "home-010",
      "category": "Furniture",
      "name": "Modena Solid White Oak Coffee Table with Storage",
      "description": "Minimalist low-profile Japanese-inspired oak table with soft-close hidden storage drawer and open shelf for books.",
      "price": 240,
      "quantity": 1,
      "currency": "USD",
      "style": "Scandinavian",
      "rooms": ["Living Room"],
      "rating": 4.8,
      "reviewsCount": 85,
      "dimensions": "47\"L x 23\"W x 16\"H",
      "badge": "Solid Wood",
      "links": { "amazon": "https://www.amazon.com/s?k=solid+oak+coffee+table", "flipkart": "https://www.flipkart.com/search?q=wooden+coffee+table" }
    },
    {
      "id": "home-012",
      "category": "Dining Tables",
      "name": "Astoria Extendable Walnut Dining Table (Seats 6-8)",
      "description": "Engineered with a smooth butterfly leaf extension mechanism, American walnut veneer tabletop, and solid wood angled splayed legs.",
      "price": 620,
      "quantity": 1,
      "currency": "USD",
      "style": "Modern",
      "rooms": ["Dining Room"],
      "rating": 4.8,
      "reviewsCount": 77,
      "dimensions": "64\"-82\"L x 36\"W x 30\"H",
      "badge": "Extendable",
      "links": { "amazon": "https://www.amazon.com/s?k=extendable+dining+table", "flipkart": "https://www.flipkart.com/search?q=extendable+dining+table" }
    },
    {
      "id": "home-013",
      "category": "Dining Tables",
      "name": "Verona White Faux Marble Round Dining Table",
      "description": "Space-conscious 48-inch round sintered stone dining table with heavy-duty matte black steel pedestal trumpet base.",
      "price": 450,
      "quantity": 1,
      "currency": "USD",
      "style": "Luxury",
      "rooms": ["Dining Room", "Kitchen"],
      "rating": 4.9,
      "reviewsCount": 63,
      "dimensions": "48\" Diameter x 30\"H",
      "badge": "Scratch Resistant",
      "links": { "amazon": "https://www.amazon.com/s?k=round+marble+dining+table", "flipkart": "https://www.flipkart.com/search?q=round+dining+table" }
    },
    {
      "id": "home-015",
      "category": "Decor",
      "name": "Nordic Textured Hand-Tufted Wool Area Rug (8x10)",
      "description": "Ultra-soft premium high-density wool area rug featuring subtle neutral geometric motifs with braided cotton fringe edges.",
      "price": 320,
      "quantity": 1,
      "currency": "USD",
      "style": "Scandinavian",
      "rooms": ["Living Room", "Bedroom", "Dining Room"],
      "rating": 4.9,
      "reviewsCount": 142,
      "dimensions": "8 ft x 10 ft",
      "badge": "Natural Wool",
      "links": { "amazon": "https://www.amazon.com/s?k=hand+tufted+wool+area+rug", "flipkart": "https://www.flipkart.com/search?q=living+room+rug" }
    },
    {
      "id": "home-017",
      "category": "Decor",
      "name": "Solstice Oversized Brass Arch Floor Mirror",
      "description": "Floor-standing full-length arch mirror with shatterproof HD glass, slender brushed gold aluminum frame, and anti-tipping mount.",
      "price": 195,
      "quantity": 1,
      "currency": "USD",
      "style": "Luxury",
      "rooms": ["Living Room", "Bedroom"],
      "rating": 4.8,
      "reviewsCount": 160,
      "dimensions": "71\"H x 32\"W",
      "badge": "Statement Accent",
      "links": { "amazon": "https://www.amazon.com/s?k=arched+floor+mirror", "flipkart": "https://www.flipkart.com/search?q=full+length+mirror" }
    }
  ],
  'party-recommendations.json': [
    {
      "id": "party-001",
      "category": "Catering",
      "name": "Artisanal Mediterranean Grazing & Hot Buffet",
      "description": "Full-service gourmet spread including mezze platters, carved rotisserie meats, wild mushroom risotto, salad bar, and dessert shooters.",
      "price": 38,
      "unit": "per guest",
      "partyTypes": ["Birthday", "Anniversary", "Corporate", "Housewarming"],
      "rating": 4.9,
      "badge": "Top Choice",
      "links": { "booking": "#" }
    },
    {
      "id": "party-002",
      "category": "Catering",
      "name": "Live Chef Taco & Street Food Fiesta Station",
      "description": "Interactive live culinary station with handmade tortillas, slow-cooked carnitas, grilled portobello, and fresh guacamole bar.",
      "price": 26,
      "unit": "per guest",
      "partyTypes": ["Birthday", "Housewarming", "Other"],
      "rating": 4.8,
      "badge": "Interactive",
      "links": { "booking": "#" }
    },
    {
      "id": "party-004",
      "category": "Venue",
      "name": "Skyline Panorama Rooftop Terrace",
      "description": "Private open-air rooftop venue with panoramic city views, weather-shield pergolas, and designer lounge couches.",
      "price": 1200,
      "partyTypes": ["Birthday", "Anniversary", "Corporate"],
      "rating": 4.9,
      "badge": "City View",
      "links": { "booking": "#" }
    },
    {
      "id": "party-007",
      "category": "Decoration",
      "name": "Luxe Organic Balloon Arch & Neon Backdrop",
      "description": "Custom color palette double-stuffed matte latex balloon garland (16ft) with custom acrylic warm LED neon lettering.",
      "price": 380,
      "partyTypes": ["Birthday", "Anniversary", "Housewarming", "Other"],
      "rating": 4.8,
      "badge": "Photo Worthy",
      "links": { "booking": "#" }
    },
    {
      "id": "party-010",
      "category": "Entertainment",
      "name": "Live Acoustic Vocalist & Saxophone Duo (3 Hours)",
      "description": "Sensational live musical accompaniment covering acoustic pop classics, soulful jazz, and upbeat tempo tracks.",
      "price": 600,
      "partyTypes": ["Wedding", "Anniversary", "Birthday", "Corporate"],
      "rating": 4.9,
      "badge": "Live Music",
      "links": { "booking": "#" }
    },
    {
      "id": "party-012",
      "category": "Photography",
      "name": "Pro Candid Photography & 4K Highlight Reel",
      "description": "5 hours of full event coverage by lead photographer, color-graded online gallery of 300+ images, and 60s social reel.",
      "price": 650,
      "partyTypes": ["Wedding", "Anniversary", "Birthday", "Corporate"],
      "rating": 4.9,
      "badge": "4K Video + Stills",
      "links": { "booking": "#" }
    },
    {
      "id": "party-014",
      "category": "Contingency",
      "name": "Smart Event Safety & Reserve Logistics Kit (10%)",
      "description": "Essential buffer allocation recommended for unexpected last-minute additions, overtime, and backup supplies.",
      "price": 250,
      "partyTypes": ["Birthday", "Wedding", "Anniversary", "Corporate", "Housewarming", "Other"],
      "rating": 5.0,
      "badge": "Risk Protection",
      "links": { "booking": "#" }
    }
  ],
  'jewelry-recommendations.json': [
    {
      "id": "jwl-001",
      "category": "Rings",
      "name": "Celestial Solitaire Diamond Pavé Ring",
      "description": "Round brilliant-cut lab-certified 1.2 carat center diamond (VS1, E color) set in a 14K white gold band adorned with micro-pavé diamonds.",
      "price": 1850,
      "metal": "Diamond",
      "style": "Luxury",
      "occasions": ["Wedding", "Anniversary", "Gift"],
      "stylingTip": "Pairs exquisitely with tailored cocktail gowns or simple cashmere knitwear to let the center stone sparkle.",
      "rating": 5.0,
      "badge": "Heirloom Grade",
      "links": { "amazon": "https://www.amazon.com/s?k=solitaire+diamond+pave+ring", "flipkart": "https://www.flipkart.com/search?q=diamond+ring" }
    },
    {
      "id": "jwl-002",
      "category": "Rings",
      "name": "Aurelia 18K Solid Gold Sculptural Dome Ring",
      "description": "Bold yet effortlessly understated high-polish dome ring cast in rich 18K yellow gold with a smooth comfort-fit interior curve.",
      "price": 420,
      "metal": "Gold",
      "style": "Modern",
      "occasions": ["Casual", "Party", "Formal"],
      "stylingTip": "Stack with delicate thin wire bands on adjacent fingers for a bold, contemporary everyday luxury statement.",
      "rating": 4.8,
      "badge": "Trendsetter",
      "links": { "amazon": "https://www.amazon.com/s?k=18k+gold+dome+ring", "flipkart": "https://www.flipkart.com/search?q=gold+ring" }
    },
    {
      "id": "jwl-004",
      "category": "Necklaces",
      "name": "Lumière Floating Solitaire Diamond Pendant",
      "description": "A bezel-set 0.50 carat sparkling round diamond suspended delicately on an adjustable 16-18\" 14K yellow gold cable chain.",
      "price": 890,
      "metal": "Diamond",
      "style": "Minimalist",
      "occasions": ["Casual", "Gift", "Formal", "Anniversary"],
      "stylingTip": "The ultimate capsule wardrobe necklace; wear solo with crisp collared shirts or layer with a herringbone chain.",
      "rating": 4.9,
      "badge": "Wardrobe Staple",
      "links": { "amazon": "https://www.amazon.com/s?k=floating+diamond+pendant", "flipkart": "https://www.flipkart.com/search?q=diamond+pendant" }
    },
    {
      "id": "jwl-005",
      "category": "Necklaces",
      "name": "Palermo 14K Bold Paperclip Link Chain",
      "description": "Modern Italian rectangular elongated links handcrafted with mirror finish in durable 14K solid gold with lobster trigger clasp.",
      "price": 620,
      "metal": "Gold",
      "style": "Modern",
      "occasions": ["Casual", "Party", "Gift"],
      "stylingTip": "Fasten charms or personalized pendants to the elongated links for a personalized custom heirloom look.",
      "rating": 4.7,
      "badge": "Best Seller",
      "links": { "amazon": "https://www.amazon.com/s?k=14k+paperclip+necklace", "flipkart": "https://www.flipkart.com/search?q=gold+chain" }
    },
    {
      "id": "jwl-007",
      "category": "Bracelets",
      "name": "Eternity 3.0 ctw Diamond Tennis Bracelet",
      "description": "A continuous line of 55 four-prong hand-set brilliant cut round diamonds in 14K white gold with double security safety latch.",
      "price": 2450,
      "metal": "Diamond",
      "style": "Luxury",
      "occasions": ["Wedding", "Anniversary", "Formal"],
      "stylingTip": "A timeless classic that pairs effortlessly alongside a fine Swiss luxury watch or shines as a solitary hero piece.",
      "rating": 5.0,
      "badge": "Iconic",
      "links": { "amazon": "https://www.amazon.com/s?k=diamond+tennis+bracelet", "flipkart": "https://www.flipkart.com/search?q=tennis+bracelet" }
    },
    {
      "id": "jwl-009",
      "category": "Earrings",
      "name": "Solas 1.0 ctw Classic Round Diamond Studs",
      "description": "Matching pair of lab-grown diamonds (0.50ct each, F/VS2) set in 3-prong martini settings in hypoallergenic 14K white gold.",
      "price": 780,
      "metal": "Diamond",
      "style": "Classic",
      "occasions": ["Casual", "Wedding", "Formal", "Gift", "Anniversary"],
      "stylingTip": "The ultimate versatile everyday luxury; suitable from breakfast board meetings to black-tie evening galas.",
      "rating": 4.9,
      "badge": "Essential",
      "links": { "amazon": "https://www.amazon.com/s?k=1ctw+diamond+studs", "flipkart": "https://www.flipkart.com/search?q=diamond+earrings" }
    },
    {
      "id": "jwl-011",
      "category": "Watches",
      "name": "Geneva Chrono Royale 18K Gold Automatic Watch",
      "description": "Swiss movement luxury automatic chronograph with sunburst cream dial, sapphire anti-reflective crystal, and integrated oyster gold bracelet.",
      "price": 3400,
      "metal": "Gold",
      "style": "Luxury",
      "occasions": ["Formal", "Anniversary", "Wedding"],
      "stylingTip": "Let the watch peek naturally beneath tailored shirt cuffs; ideal accompaniment for formal suits and tuxedo jackets.",
      "rating": 5.0,
      "badge": "Horology Masterpiece",
      "links": { "amazon": "https://www.amazon.com/s?k=gold+automatic+chronograph+watch", "flipkart": "https://www.flipkart.com/search?q=luxury+gold+watch" }
    }
  ]
};

const StorageService = {
  // Auth User
  getAuthUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage read error:', e);
      return null;
    }
  },

  setAuthUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },

  clearAuthUser() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  // Plan History
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  savePlanToHistory(plan) {
    const history = this.getHistory();
    // Add unique ID and date if missing
    if (!plan.id) plan.id = 'plan-' + Date.now();
    if (!plan.createdAt) plan.createdAt = new Date().toISOString();
    history.unshift(plan);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
    return plan;
  },

  deleteHistoryItem(id) {
    const history = this.getHistory().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return history;
  },

  clearAllHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  // Saved / Wishlist Items
  getSavedItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  toggleSaveItem(item) {
    let saved = this.getSavedItems();
    const index = saved.findIndex(i => i.id === item.id);
    let isNowSaved = false;

    if (index >= 0) {
      saved.splice(index, 1);
      isNowSaved = false;
    } else {
      saved.unshift({
        ...item,
        savedAt: new Date().toISOString()
      });
      isNowSaved = true;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(saved));
    } catch (e) {
      console.error(e);
    }
    return isNowSaved;
  },

  isItemSaved(itemId) {
    const saved = this.getSavedItems();
    return saved.some(i => i.id === itemId);
  },

  removeSavedItem(itemId) {
    let saved = this.getSavedItems().filter(i => i.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(saved));
    return saved;
  },

  // Custom Products (Admin overrides)
  getCustomProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCustomProduct(product) {
    const products = this.getCustomProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(products));
    return product;
  },

  deleteCustomProduct(id) {
    const products = this.getCustomProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(products));
    return products;
  },

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { currency: 'USD' };
    } catch (e) {
      return { currency: 'USD' };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Data Fetching with fallback
  async fetchCatalog(filename) {
    let baseData = [];
    try {
      // Determine correct relative path for data
      const response = await fetch('data/' + filename);
      if (!response.ok) throw new Error('Network error loading ' + filename);
      baseData = await response.json();
    } catch (err) {
      console.info(`Using fallback dataset for ${filename}:`, err.message);
      baseData = EMBEDDED_FALLBACKS[filename] || [];
    }

    // Merge in any custom items created by admin for this catalog
    const custom = this.getCustomProducts().filter(p => {
      if (filename.includes('home') && (p.catalog === 'home' || !p.catalog)) return true;
      if (filename.includes('party') && p.catalog === 'party') return true;
      if (filename.includes('jewelry') && p.catalog === 'jewelry') return true;
      return false;
    });

    // Merge or replace
    const combined = [...baseData];
    custom.forEach(c => {
      const idx = combined.findIndex(item => item.id === c.id);
      if (idx >= 0) {
        combined[idx] = c;
      } else {
        combined.unshift(c);
      }
    });

    return combined;
  }
};

window.StorageService = StorageService;
