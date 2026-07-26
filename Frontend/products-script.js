// In-page smooth scroll — handled entirely in JS so links never navigate away from the page
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(el.getAttribute('data-scroll'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Profile dropdown toggle
  const profileMenu = document.querySelector('.profile-menu');
  const profileTrigger = document.querySelector('.profile-trigger');
  profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = profileMenu.classList.toggle('open');
    profileTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (profileMenu.classList.contains('open') && !profileMenu.contains(e.target)) {
      profileMenu.classList.remove('open');
      profileTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Mobile menu toggle — simple slide-down panel built on demand
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('nav.links');
  let mobileOpen = false;
  let mobilePanel = null;

  menuBtn.addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    if (mobileOpen) {
      mobilePanel = document.createElement('div');
      mobilePanel.style.cssText = 'position:fixed; top:69px; left:0; right:0; background:var(--milk); border-bottom:1px solid var(--line); z-index:49; padding:10px 28px 20px;';
      const clone = navLinks.cloneNode(true);
      clone.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
      clone.querySelectorAll('a').forEach(a => {
        a.style.cssText = 'padding:12px 0; border-bottom:1px solid var(--line); font-size:15.5px;';
        a.addEventListener('click', () => { mobilePanel.remove(); mobileOpen = false; });
      });
      const contactLink = document.createElement('a');
      contactLink.href = 'contact.html';
      contactLink.textContent = 'Contact Us';
      contactLink.className = 'btn btn-dark';
      contactLink.style.cssText += 'margin-top:14px; width:100%;';
      contactLink.addEventListener('click', () => { mobilePanel.remove(); mobileOpen = false; });
      mobilePanel.appendChild(clone);
      mobilePanel.appendChild(contactLink);
      document.body.appendChild(mobilePanel);
    } else if (mobilePanel) {
      mobilePanel.remove();
    }
  });

// Load products from backend
async function loadProducts() {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    const result = await response.json();

    const prodGrid = document.getElementById("prodGrid");
    prodGrid.innerHTML = "";

    result.data.forEach(product => {

      const card = `
        <div class="prod-card"
             data-category="all"
             data-name="${product.product_name.toLowerCase()}">

          <div class="prod-img">
            <img src="/uploads/${product.image}"
                 alt="${product.product_name}">
          </div>

          <div class="prod-body">

            <h3>${product.product_name}</h3>

            <p>${product.description}</p>

            <div class="prod-bottom">

              <span class="price-tag">
                ₹${product.price}
              </span>

              <a href="contact.html"
                 class="btn btn-outline-dark">
                 Enquire Now
              </a>

            </div>

          </div>

        </div>
      `;

      prodGrid.innerHTML += card;

    });

  } catch (error) {
    console.error("Error loading products:", error);
  }
}
  // Product search + category filter (client-side, over the static preview catalog)
  // TODO: once the backend/database is connected, replace the static cards in #prodGrid
  // with data fetched from the API, then re-run this same filter logic over the rendered cards.
  const searchInput = document.getElementById('productSearch');
  const chips = document.querySelectorAll('#chipRow .chip');
  const cards = document.querySelectorAll('#prodGrid .prod-card');
  const noResults = document.getElementById('noResults');
  let activeFilter = 'all';

  function applyFilters() {
    const term = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach(card => {
      const matchesCategory = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
      const matchesSearch = !term || card.getAttribute('data-name').includes(term);
      const show = matchesCategory && matchesSearch;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', applyFilters);
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter');
      applyFilters();
    });
  });
  loadProducts();