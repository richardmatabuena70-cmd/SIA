// Login at Register logic
// Purpose: Handle form switching at user authentication with localStorage

// Wait para sa DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in - redirect to dashboard
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    window.location.href = "dashboard.html";
    return;
  }

  // Get form elements
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const formTitle = document.getElementById("formTitle");

  // Get login inputs
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  // Get register inputs
  const regName = document.getElementById("regName");
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");
  const regConfirm = document.getElementById("regConfirm");

  // Show register form
  window.showRegister = function () {
    loginForm.classList.add("hidden"); // Hide login
    registerForm.classList.remove("hidden"); // Show register
    formTitle.textContent = "Register";
  };

  // Show login form
  window.showLogin = function () {
    registerForm.classList.add("hidden"); // Hide register
    loginForm.classList.remove("hidden"); // Show login
    formTitle.textContent = "Login";
  };

  // Register form submit
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Don't reload page

    // Check kung match ang passwords
    if (regPassword.value !== regConfirm.value) {
      alert("Passwords do not match");
      return;
    }

    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    const existingUser = users.find(u => u.email === regEmail.value);
    if (existingUser) {
      alert("Email already registered!");
      return;
    }

    // Create new user object
    const newUser = {
      name: regName.value,
      email: regEmail.value,
      password: regPassword.value,
      history: []
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created! Please login.");
    showLogin(); // Switch to login
    registerForm.reset(); // Clear inputs
  });

  // Login form submit
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Don't reload page

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Find matching user
    const user = users.find(u => 
      (u.email === loginEmail.value || u.name === loginEmail.value) && 
      u.password === loginPassword.value
    );

    if (user) {
      // Store current user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid email/username or password!");
    }
  });
});
