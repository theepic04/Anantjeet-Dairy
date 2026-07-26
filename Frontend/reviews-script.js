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

  // Mobile menu toggle
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

  // ---------- Star rating picker ----------
  const starPicker = document.getElementById('starPicker');
  const starButtons = starPicker.querySelectorAll('button');
  let selectedRating = 0;

  starButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.getAttribute('data-val'), 10);
      starButtons.forEach(b => {
        b.classList.toggle('filled', parseInt(b.getAttribute('data-val'), 10) <= selectedRating);
      });
    });
  });

  // ---------- Review storage ----------
  // NOTE: This site is a static front end with no backend/database yet.
  // Submitted reviews are stored in this browser's localStorage, so they
  // persist on repeat visits from the same device/browser, but are not
  // visible to other visitors. Once a backend is connected, replace the
  // localStorage calls below with API calls so reviews are shared by everyone.
  

  function buildReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    const initial = review.name.trim().charAt(0).toUpperCase() || '?';
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    card.innerHTML = `
      <p class="quote-mark">"</p>
      <div class="review-stars">${stars}</div>
      <p class="text"></p>
      <div class="review-who">
        <div class="review-avatar">${initial}</div>
        <div>
          <div class="review-name"></div>
          <div class="review-loc">Verified customer</div>
        </div>
      </div>
    `;
    card.querySelector('.text').textContent = review.text;
    card.querySelector('.review-name').textContent = review.name;
    return card;
  }

  const reviewGrid = document.getElementById('reviewGrid');

  async function loadReviews() {

    try {

        const response =
        await fetch(
            "http://localhost:5000/api/reviews"
        );

        const result =
        await response.json();

        reviewGrid.innerHTML = "";

        result.reviews.forEach(review => {

            reviewGrid.appendChild(

                buildReviewCard({

                    name: review.customer_name,
                    rating: review.rating,
                    text: review.comment

                })

            );

        });

    }

    catch(error){

        console.error(error);

    }

}

loadReviews();

  // ---------- Form submit ----------
  const reviewForm = document.getElementById('reviewForm');
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');

  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById('revName').value.trim();
    const text = document.getElementById('revText').value.trim();

    if (!name || !text || selectedRating === 0) {
      formError.style.display = 'block';
      formSuccess.style.display = 'none';
      return;
    }
    formError.style.display = 'none';

    try {

    const response = await fetch(

        "http://localhost:5000/api/reviews/add",

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                customer_name:name,

                rating:selectedRating,

                comment:text

            })

        }

    );

    const result =
    await response.json();

    if(result.success){

        reviewForm.reset();

        starButtons.forEach(b =>
            b.classList.remove("filled")
        );

        selectedRating = 0;

        loadReviews();

        formSuccess.style.display="flex";

        setTimeout(()=>{

            formSuccess.style.display="none";

        },4000);

    }

    else{

        alert(result.message);

    }

}

catch(error){

    console.error(error);

}

    reviewForm.reset();
    starButtons.forEach(b => b.classList.remove('filled'));
    selectedRating = 0;

    formSuccess.style.display = 'flex';
    setTimeout(() => { formSuccess.style.display = 'none'; }, 4000);
  });