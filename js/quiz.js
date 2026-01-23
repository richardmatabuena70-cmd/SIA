let quizData = [];
let currentIndex = 0;
let userAnswers = [];
let timer = 600;
let timerInterval;
let cameFromProgress = false;

function generateQuestions() {
  quizData = [];

  let max;
  if (difficulty === "easy") max = 10;
  else if (difficulty === "medium") max = 30;
  else max = 100; // hard

  for (let i = 0; i < 10; i++) {
    let a = Math.floor(Math.random() * max) + 1;
    let b = Math.floor(Math.random() * max) + 1;

    let question, correct;

    if (difficulty === "easy") {
      // Addition
      correct = a + b;
      question = `${a} + ${b} = ?`;
    } else if (difficulty === "medium") {
      // Subtraction
      // Ensure no negative
      if (b > a) [a, b] = [b, a];
      correct = a - b;
      question = `${a} - ${b} = ?`;
    } else {
      // Hard: Multiplication or Division
      if (Math.random() < 0.5) {
        // Multiplication
        correct = a * b;
        question = `${a} × ${b} = ?`;
      } else {
        // Division
        correct = a; // make dividend divisible by b
        const dividend = a * b;
        question = `${dividend} ÷ ${b} = ?`;
      }
    }

    // Generate choices
    let choices = new Set([correct]);
    while (choices.size < 3) {
      choices.add(correct + Math.floor(Math.random() * 10) - 5);
    }

    quizData.push({
      question,
      choices: [...choices].sort(() => Math.random() - 0.5),
      answer: correct,
    });
  }
}

function loadGame() {
  generateQuestions();
  userAnswers = Array(10).fill(null);
  currentIndex = 0;
  timer = 600;
  startTimer();
  renderQuestion();
}

function renderQuestion() {
  // ✅ GAME OVER CHECK (SAFE)
  if (currentIndex >= quizData.length) {
    const user = getUser();
    const lastGame = user.history.at(-1);

    const correct = lastGame.answers.filter(
      (a, i) => a === lastGame.quiz[i].answer,
    ).length;

    const wrong = lastGame.answers.filter(
      (a, i) => a !== null && a !== lastGame.quiz[i].answer,
    ).length;

    const unanswered = lastGame.answers.filter((a) => a === null).length;
    const score = correct * 10;

    content.innerHTML = `
      <div style="
        max-width:500px;
        margin:40px auto;
        padding:25px;
        border-radius:12px;
        text-align:center;
        background:#1e1e1e;
        color:white;
      ">
        <h1>🎮 Game Over</h1>
        <h2>${user.name}</h2>

        <p><b>Score:</b> ${score} / ${quizData.length * 10}</p>
        <p>✅ Correct: ${correct}</p>
        <p>❌ Wrong: ${wrong}</p>
        <p>⚪ Unanswered: ${unanswered}</p>

        <div style="margin-top:20px">
          <button onclick="showAnswers()">📋 Review Answers</button>
          <button onclick="showProgress()">📊 Question Progress</button>
        </div>
      </div>
    `;
    return; // ⛔ STOP renderQuestion safely
  }

  // ================= NORMAL QUESTION RENDER =================

  let q = quizData[currentIndex];

  let backButton = cameFromProgress
    ? `<button onclick="backToProgress()">⬅ Back to Question Progress</button>`
    : "";

  content.innerHTML = `
    ${backButton}
    <h2>Question ${currentIndex + 1}/10</h2>
    <h3>${q.question}</h3>

    ${q.choices
      .map(
        (c) => `
      <button class="${userAnswers[currentIndex] === c ? "selected" : ""}"
        onclick="selectAnswer(${c})">${c}</button>
    `,
      )
      .join("")}

    <div style="margin-top:20px">
      <button onclick="prevQuestion()">Previous</button>
      <button onclick="nextQuestion()">Next</button>
    </div>
  `;

  updateTextColors();

  function backToProgress() {
    cameFromProgress = false;
    showProgress();
  }

  const isLight = document.body.classList.contains("light-theme");
  const selectedBg = isLight ? "#b0e0e6" : "#1e90ff";
  const selectedText = isLight ? "#000000" : "#ffffff";

  document.querySelectorAll("button.selected").forEach((b) => {
    b.style.backgroundColor = selectedBg;
    b.style.color = selectedText;
  });
}

function showGameOverScreen() {
  const user = getUser();

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  quizData.forEach((q, i) => {
    if (userAnswers[i] === null || userAnswers[i] === undefined) {
      unanswered++;
    } else if (userAnswers[i] === q.answer) {
      correct++;
    } else {
      wrong++;
    }
  });

  const score = correct * 10;

  content.innerHTML = `
    <div style="
      max-width:500px;
      margin:40px auto;
      padding:25px;
      border-radius:12px;
      text-align:center;
      background:#1e1e1e;
      color:white;
    ">
      <h1>🎮 Game Over</h1>
      <h2>${user.name}</h2>

      <p><b>Score:</b> ${score} / ${quizData.length * 10}</p>
      <p>✅ Correct: ${correct}</p>
      <p>❌ Wrong: ${wrong}</p>
      <p>⚪ Unanswered: ${unanswered}</p>

      <div style="margin-top:20px">
        <button onclick="showAnswers()">📋 Review Answers</button>
        <button onclick="showProgress()">📊 Question Progress</button>
        <button onclick="playAgain()">🔁 Play Again</button>
      </div>
    </div>
  `;
}

function selectAnswer(ans) {
  userAnswers[currentIndex] = ans;
  renderQuestion();
}

function goToQuestion(index) {
  cameFromProgress = true;
  currentIndex = index;

  // makikita lang dito yung huli mong quiz
  const user = getUser();
  if (!user || !user.history || user.history.length === 0) return;

  const lastGame = user.history.at(-1);
  quizData = lastGame.quiz; // load last quiz questions
  userAnswers = lastGame.answers; // load last answers

  renderQuestion();
}

function backToProgress() {
  cameFromProgress = false;
  showProgress();
}

function backToProgress() {
  cameFromProgress = false;
  showLiveProgress();
}

function nextQuestion() {
  if (currentIndex >= quizData.length - 1) {
    finishQuiz(); // ⬅ must be finishQuiz, not showGameOverScreen
    return;
  }
  currentIndex++;
  renderQuestion();
}

function prevQuestion() {
  if (currentIndex > 0) currentIndex--;
  renderQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function finishQuiz() {
  clearInterval(timerInterval);

  let correct = 0;
  quizData.forEach((q, i) => {
    if (userAnswers[i] === q.answer) correct++;
  });

  const user = JSON.parse(localStorage.getItem("currentUser"));
  user.history = user.history || [];

  user.history.push({
    score: correct,
    timeLeft: timer,
    answers: [...userAnswers], // ✅ clone
    quiz: [...quizData], // ✅ clone
    date: new Date().toISOString(),
  });

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.map((u) => (u.email === user.email ? user : u));

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(user));

  // ✅ SHOW GAME OVER AFTER SAVING
  showGameOverScreen();
}

function chooseLevel() {
  content.innerHTML = `
    <h2>Select Quiz Level</h2>
    <button onclick="startQuiz('easy')">Easy</button>
    <button onclick="startQuiz('medium')">Medium</button>
    <button onclick="startQuiz('hard')">Hard</button>
  `;
}
function startQuiz(level) {
  difficulty = level;
  loadGame();
}

// wala lang nilagyan ko lang ng darkmode HAHAHA
function toggleTheme() {
  document.body.classList.toggle("light-theme");
  updateTextColors();
}

// dito naman sumasabay yung kulay ng text pag nag darkmode or lightmode
function updateTextColors() {
  // Determine current theme
  const isLight = document.body.classList.contains("light-theme");

  // kulay ng text nakakalito e
  const textColor = isLight ? "#000000" : "#ffffff";
  const panelColor = isLight ? "#ffffff" : "#1e1e1e";
  const buttonBg = isLight ? "#f0f0f0" : "#2a2a2a";
  const buttonText = isLight ? "#000000" : "#ffffff";

  // Body & main content
  document.body.style.color = textColor;
  document.body.style.backgroundColor = isLight ? "#f5f5f5" : "#111111";

  // Panels lang to ng login&signup phase
  const panels = document.querySelectorAll(".panel");
  panels.forEach((p) => {
    p.style.backgroundColor = panelColor;
    p.style.color = textColor;
  });

  // Inputs
  const inputs = document.querySelectorAll("input");
  inputs.forEach((i) => {
    i.style.backgroundColor = isLight ? "#ffffff" : "#333333";
    i.style.color = textColor;
    i.style.borderColor = isLight ? "#ccc" : "#555";
  });

  // Buttons
  const buttons = document.querySelectorAll("button");
  buttons.forEach((b) => {
    b.style.backgroundColor = buttonBg;
    b.style.color = buttonText;
  });

  // Main content
  const contentArea = document.getElementById("content");
  if (contentArea) {
    contentArea.style.color = textColor;
  }
}

// Apply theme immediately when page loads
window.onload = function () {
  updateTextColors();
};

function playAgain() {
  userAnswers = [];
  quizData = [];
  currentIndex = 0;
  timer = 600;
  cameFromProgress = false;

  chooseLevel(); // back to level selection
}
function playAgain() {
  userAnswers = [];
  quizData = [];
  currentIndex = 0;
  timer = 600;
  cameFromProgress = false;

  chooseLevel(); // back to level selection
}
