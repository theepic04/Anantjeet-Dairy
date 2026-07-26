// ---------- Show / hide password ----------
  const togglePw = document.getElementById('togglePw');
  const adminPass = document.getElementById('adminPass');
  togglePw.addEventListener('click', () => {
    const showing = adminPass.type === 'text';
    adminPass.type = showing ? 'password' : 'text';
    togglePw.classList.toggle('showing', !showing);
    togglePw.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  // ---------- Login form submit ----------
  // FRONTEND ONLY — no backend is connected yet.
  // TODO: once the Node.js backend is live, replace the block below with a real
  // fetch() POST of { username, password } to the auth endpoint (e.g. /api/admin/login),
  // which will check the credentials against the database and return a session/token.
  // The success/error handling here should then key off that response instead.
  // ---------- Login form submit ----------
const form = document.getElementById("adminLoginForm");
const errorMsg = document.getElementById("errorMsg");
const errorText = document.getElementById("errorText");
const loginBtn = document.getElementById("loginBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPass").value;

    errorMsg.style.display = "none";

    if (!username || !password) {
        errorText.textContent = "Please enter both username and password.";
        errorMsg.style.display = "flex";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Checking...";

    try {

        const response = await fetch("/api/admin/login", {

            method: "POST",
            credentials: "include",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })

        });

        const data = await response.json();

        loginBtn.disabled = false;
        loginBtn.textContent = "Log In";

        if (data.success) {

            window.location.href = "admin-dashboard.html";

        } else {

            errorText.textContent = data.message;
            errorMsg.style.display = "flex";

        }

    } catch (error) {

        loginBtn.disabled = false;
        loginBtn.textContent = "Log In";

        errorText.textContent = "Unable to connect to the server.";
        errorMsg.style.display = "flex";

        console.error(error);

    }

});