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
        a.addEventListener('click', (e) => {
          e.preventDefault();
          mobilePanel.remove(); mobileOpen = false;
          const target = document.getElementById(a.getAttribute('data-scroll'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
      const contactLink = document.createElement('a');
      contactLink.href = 'javascript:void(0)';
      contactLink.setAttribute('data-scroll', 'contact');
      contactLink.textContent = 'Contact Us';
      contactLink.className = 'btn btn-dark';
      contactLink.style.cssText += 'margin-top:14px; width:100%;';
      contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        mobilePanel.remove(); mobileOpen = false;
        const target = document.getElementById('contact');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      mobilePanel.appendChild(clone);
      mobilePanel.appendChild(contactLink);
      document.body.appendChild(mobilePanel);
    } else if (mobilePanel) {
      mobilePanel.remove();
    }
  });
