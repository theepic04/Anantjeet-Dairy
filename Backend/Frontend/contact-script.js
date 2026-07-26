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


  // Contact form submission (frontend only for now)
  // TODO: once the backend/database is connected, replace this with a real fetch/POST
  // to the API endpoint, passing fullName, gender, phone, email, address, and message.
  const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!contactForm.checkValidity()) {

            contactForm.reportValidity();

            return;

        }

        const queryData = {

            name: document.getElementById("fullName").value.trim(),

            gender: document.getElementById("gender").value,

            phone: document.getElementById("phone").value.trim(),

            email: document.getElementById("email").value.trim(),

            address: document.getElementById("address").value.trim(),

            message: document.getElementById("message").value.trim()

        };

        try {

            const response = await fetch(
                "/api/queries/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(queryData)
                }
            );

            const result = await response.json();

            if (result.success) {

                formSuccess.style.display = "flex";

                contactForm.reset();

            }
            else {

                alert(result.message);

            }

        }
        catch (error) {

            console.error(error);

            alert("Server Error");

        }

    });

}