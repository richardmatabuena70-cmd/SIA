const authContainer = document.querySelector(".auth-container");

const loginPanel = document.getElementById("loginPanel");
const signupPanel = document.getElementById("signupPanel");

function showSignup() {
  authContainer.classList.remove("login-active");
  authContainer.classList.add("signup-active");
}

function showLogin() {
  authContainer.classList.remove("signup-active");
  authContainer.classList.add("login-active");
}

/* LOGIN/SIGNUP LOGIC */
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (pass !== confirm) return alert("Passwords do not match");

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users.push({ name, email, pass, history: [] });

  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created!");
  showLogin();
}

// pang login lang
function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find((u) => u.email === email && u.pass === pass);

  if (!user) return alert("Invalid credentials");

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "dashboard.html";
}

authContainer.classList.add("login-active");
