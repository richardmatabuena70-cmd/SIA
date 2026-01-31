function getUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Check if user is logged in, redirect to login page if not
function checkAuth() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Logout function
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Make logout available globally
window.logout = logout;

function showScores() {
  let user = getUser();
  if (!user || !user.history || user.history.length === 0) {
    content.innerHTML = "<h2>Current Scores</h2><p>No quiz taken yet.</p>";
    return;
  }

  content.innerHTML = `
    <h2>Current Scores</h2>
    ${user.history
      .map(
        (h, i) => `
      <div style="
        margin-bottom:10px;
        padding:6px;
        border-radius:6px;
        border:1px solid #ccc;
      ">
        Game ${i + 1}: <b>${h.score}/10</b>
        <button onclick="deleteRecord(${i}, showScores)">🗑 Delete</button>
      </div>
    `,
      )
      .join("")}
  `;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function showTime() {
  let user = getUser();
  if (!user || !user.history || user.history.length === 0) {
    content.innerHTML = "<h2>Remaining Time</h2><p>No quiz taken yet.</p>";
    return;
  }

  content.innerHTML = `
    <h2>Remaining Time</h2>
    ${user.history
      .map(
        (h, i) => `
      <div style="
        margin-bottom:10px;
        padding:6px;
        border-radius:6px;
        border:1px solid #ccc;
      ">
        Game ${i + 1}: ⏱ ${formatTime(h.timeLeft)}
        <button onclick="deleteRecord(${i}, showTime)">🗑 Delete</button>
      </div>
    `,
      )
      .join("")}
  `;
}

function showAccuracy() {
  let user = getUser();
  if (!user || !user.history || user.history.length === 0) {
    content.innerHTML = "<h2>Accuracy</h2><p>No quiz taken yet.</p>";
    return;
  }

  const totalQuestions = user.history.length * 10;
  const correctAnswers = user.history.reduce((a, b) => a + b.score, 0);
  const acc = totalQuestions
    ? ((correctAnswers / totalQuestions) * 100).toFixed(2)
    : 0;

  content.innerHTML = `
    <h2>Accuracy</h2>
    <div style="
      margin-bottom:10px;
      padding:6px;
      border-radius:6px;
      border:1px solid #ccc;
    ">
      Accuracy: <b>${acc}%</b>
    </div>
    <button onclick="deleteAllRecords()">🗑 Delete All Records</button>
  `;
}

function showAnswers() {
  let user = getUser();
  if (!user || !user.history || user.history.length === 0) {
    content.innerHTML = "<h2>Correct / Wrong</h2><p>No quiz taken yet.</p>";
    return;
  }

  content.innerHTML = `
    <h2>Correct / Wrong</h2>

    ${user.history
      .map(
        (h, gameIndex) => `
      <div style="
        margin-bottom:25px; 
        padding:10px; 
        border:1px solid #ccc; 
        border-radius:8px;
      ">
        <h3>
          ${user.name}  <!-- <- Changed from "Game ${gameIndex + 1}" to username -->
          <button onclick="deleteRecord(${gameIndex}, showAnswers)">🗑 Delete</button>
        </h3>

        ${h.quiz
          .map((q, i) => {
            const userAns = h.answers[i];
            const isCorrect = userAns === q.answer;
            const isUnanswered = userAns === null;

            let bg = "#4CAF50"; // for correct answer
            if (isUnanswered)
              bg = "#9E9E9E"; // for unanswered
            else if (!isCorrect) bg = "#F44336"; // for wrong

            return `
            <div style="
              margin:6px 0;
              padding:8px;
              border-radius:6px;
              background:${bg};
              color:white;
            ">
              <strong>Q${i + 1}:</strong> ${q.question}<br>
              Your Answer: <b>${userAns ?? "No Answer"}</b><br>
              Correct Answer: <b>${q.answer}</b>
              ${isCorrect ? " ✔" : !isUnanswered ? " ❌" : ""}
            </div>
          `;
          })
          .join("")}
      </div>
    `,
      )
      .join("")}
  `;
}

function showProgress() {
  const user = getUser();
  if (!user || !user.history || user.history.length === 0) {
    content.innerHTML = `
      <h2>Question Progress</h2>
      <p>No quiz taken yet.</p>
    `;
    return;
  }

  // dito ma rerecord yung last quiz
  const lastGame = user.history.at(-1);
  const answers = lastGame.answers || [];

  // Fixed colors, theme-independent
  const answeredColor = "#4CAF50";
  const unansweredColor = "#9E9E9E";
  const textColor = "#ffffff";

  let html = `
    <h2>Question Progress</h2>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
  `;

  for (let i = 0; i < answers.length; i++) {
    const bg = answers[i] !== null ? answeredColor : unansweredColor;

    html += `
      <div
        onclick="goToQuestion(${i})"
        style="
          width:35px;
          height:35px;
          background:${bg};
          color:${textColor};
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:6px;
          cursor:pointer;
          font-weight:bold;
        ">
        ${i + 1}
      </div>
    `;
  }

  html += `</div>`;

  // dito naman yung button dun na pwede mo iback para makita mo kung mahalaga kapa ba
  if (answers.length > 0) {
    html += `<button onclick="backToProgress()" style="margin-top:12px;">⬅ Back to Progress</button>`;
  }

  content.innerHTML = html;
}

function goToQuestion(index) {
  cameFromProgress = true;
  currentIndex = index;
  renderQuestion();
}

function showLiveProgress() {
  if (!userAnswers || userAnswers.length === 0) {
    content.innerHTML = `
      <h2>Question Progress</h2>
      <p>No active quiz.</p>
    `;
    return;
  }

  const answeredColor = "#4CAF50"; // Green
  const unansweredColor = "#9E9E9E"; // Gray
  const textColor = "#ffffff";

  let html = `
    <h2>Question Progress</h2>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
  `;

  for (let i = 0; i < userAnswers.length; i++) {
    const bg = userAnswers[i] !== null ? answeredColor : unansweredColor;

    html += `
      <div
        onclick="goToQuestion(${i})"
        style="
          width:35px;
          height:35px;
          background:${bg};
          color:${textColor};
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:6px;
          cursor:pointer;
          font-weight:bold;
        ">
        ${i + 1}
      </div>
    `;
  }

  html += `</div>`;
  content.innerHTML = html;
}

function showUsers() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  content.innerHTML = users
    .map(
      (u, i) => `
    ${u.name} (${u.email})
    <button onclick="removeUser(${i})">Remove</button>
  `,
    )
    .join("<br>");
}

function removeUser(i) {
  let users = JSON.parse(localStorage.getItem("users"));
  users.splice(i, 1);
  localStorage.setItem("users", JSON.stringify(users));
  showUsers();
}

function showRanking() {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // dito naman kukunin lang nya yung highest score mo
  users = users.filter((u) => u.history && u.history.length > 0);

  // dito naman marerecord yung last quiz mo (10 pts per question → 100 max)
  users.forEach((u) => {
    const lastGame = u.history.at(-1);
    u.lastScore = lastGame ? lastGame.score * 10 : 0;
  });

  // Sort descending
  users.sort((a, b) => b.lastScore - a.lastScore);

  // Display
  content.innerHTML = `
    <h2>Rank Score (Last Quiz Only)</h2>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${users
        .map(
          (u, i) => `
        <div style="
          padding:8px;
          border-radius:8px;
          border:1px solid #ccc;
          background:#f4f4f4;
          color:#000;
        ">
          <strong>${i + 1}. ${u.name}</strong> - ${u.lastScore}/100
          <div style="
            margin-top:6px;
            height:16px;
            border-radius:8px;
            background:#ddd;
            overflow:hidden;
          ">
            <div style="
              width:${u.lastScore}%;
              height:100%;
              background:linear-gradient(to right, #4CAF50, #8BC34A);
              border-radius:8px;
            "></div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
}

// nilagyan ko lang ng mga delete button ambilis mapuno pag marami nagsagot
function deleteRecord(index, refreshFn) {
  let user = getUser();
  if (!user || !user.history) return;

  if (!confirm("Delete this record?")) return;

  user.history.splice(index, 1);

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.map((u) => (u.email === user.email ? user : u));

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Refresh the current dashboard view
  refreshFn();
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});

function deleteAllRecords() {
  if (!confirm("Delete ALL quiz records?")) return;

  let user = getUser();
  user.history = [];

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.map((u) => (u.email === user.email ? user : u));

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(user));

  showScores();
}
