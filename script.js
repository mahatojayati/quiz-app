const defaultQuestions = [
  {
    question: "Which HTML tag is used to define an internal style sheet?",
    options: ["<css>", "<script>", "<style>", "<link>"],
    answer: 2
  },
  {
    question: "Which CSS property controls the text size?",
    options: ["font-style", "text-size", "font-size", "text-style"],
    answer: 2
  },
  {
    question: "How do you write 'Hello World' in an alert box in JavaScript?",
    options: [
      "msg('Hello World');",
      "alertBox('Hello World');",
      "msgBox('Hello World');",
      "alert('Hello World');"
    ],
    answer: 3
  },
  {
    question: "Which method converts a JSON string into a JavaScript object?",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.convert()"],
    answer: 0
  },
  {
    question: "What does DOM stand for?",
    options: [
      "Data Object Model",
      "Document Object Model",
      "Digital Ordinance Model",
      "Desktop Oriented Mode"
    ],
    answer: 1
  }
];

// Load custom questions from localStorage
let customQuestions = JSON.parse(localStorage.getItem("customQuizQuestions")) || [];
let activeQuestions = [];

// DOM Elements
const startScreen = document.getElementById("start-screen");
const builderScreen = document.getElementById("builder-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const openBuilderBtn = document.getElementById("open-builder-btn");
const backHomeBtn = document.getElementById("back-home-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const homeBtn = document.getElementById("home-btn");

const totalAvailableEl = document.getElementById("total-available");
const customForm = document.getElementById("custom-question-form");
const newQuestionInput = document.getElementById("new-question");
const optionInputs = document.querySelectorAll(".option-input");
const customQuestionsList = document.getElementById("custom-questions-list");
const customCountEl = document.getElementById("custom-count");
const clearCustomBtn = document.getElementById("clear-custom-btn");

const questionCounter = document.getElementById("question-counter");
const timeLeftEl = document.getElementById("time-left");
const progressBar = document.getElementById("progress-bar");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");

const finalScoreEl = document.getElementById("final-score");
const totalQuestionsEl = document.getElementById("total-questions");
const feedbackMessage = document.getElementById("feedback-message");

// State Variables
let currentQuestionIndex = 0;
let score = 0;
let timer;
const TIME_PER_QUESTION = 15;
let timeLeft = TIME_PER_QUESTION;

// Initialize counts on load
updateQuestionCounts();
renderCustomQuestionsList();

// Navigation Event Listeners
startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", startQuiz);
homeBtn.addEventListener("click", () => {
  updateQuestionCounts();
  switchScreen(startScreen);
});
openBuilderBtn.addEventListener("click", () => {
  renderCustomQuestionsList();
  switchScreen(builderScreen);
});
backHomeBtn.addEventListener("click", () => {
  updateQuestionCounts();
  switchScreen(startScreen);
});
nextBtn.addEventListener("click", handleNextQuestion);

// Custom Question Form Submission
customForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const questionTextVal = newQuestionInput.value.trim();
  const optionsVal = Array.from(optionInputs).map((input) => input.value.trim());
  const selectedRadio = document.querySelector('input[name="correct-option"]:checked');
  const answerIndex = parseInt(selectedRadio.value, 10);

  if (!questionTextVal || optionsVal.some((opt) => opt === "")) return;

  const newEntry = {
    question: questionTextVal,
    options: optionsVal,
    answer: answerIndex
  };

  customQuestions.push(newEntry);
  saveCustomQuestions();
  renderCustomQuestionsList();
  updateQuestionCounts();

  customForm.reset();
});

clearCustomBtn.addEventListener("click", () => {
  if (customQuestions.length === 0) return;
  customQuestions = [];
  saveCustomQuestions();
  renderCustomQuestionsList();
  updateQuestionCounts();
});

function saveCustomQuestions() {
  localStorage.setItem("customQuizQuestions", JSON.stringify(customQuestions));
}

function updateQuestionCounts() {
  const total = defaultQuestions.length + customQuestions.length;
  totalAvailableEl.textContent = total;
  customCountEl.textContent = customQuestions.length;
}

function renderCustomQuestionsList() {
  customQuestionsList.innerHTML = "";
  customCountEl.textContent = customQuestions.length;

  if (customQuestions.length === 0) {
    const emptyMsg = document.createElement("li");
    emptyMsg.textContent = "No custom questions added yet.";
    emptyMsg.style.color = "#64748b";
    customQuestionsList.appendChild(emptyMsg);
    return;
  }

  customQuestions.forEach((item, index) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = `${index + 1}. ${item.question}`;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-item-btn";
    delBtn.textContent = "×";
    delBtn.title = "Delete question";
    delBtn.addEventListener("click", () => {
      customQuestions.splice(index, 1);
      saveCustomQuestions();
      renderCustomQuestionsList();
      updateQuestionCounts();
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    customQuestionsList.appendChild(li);
  });
}

function switchScreen(screenToShow) {
  [startScreen, builderScreen, quizScreen, resultScreen].forEach((s) =>
    s.classList.remove("active")
  );
  screenToShow.classList.add("active");
}

function startQuiz() {
  activeQuestions = [...defaultQuestions, ...customQuestions];
  currentQuestionIndex = 0;
  score = 0;
  switchScreen(quizScreen);
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timer);
  nextBtn.disabled = true;
  optionsContainer.innerHTML = "";

  const currentQuestion = activeQuestions[currentQuestionIndex];
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${activeQuestions.length}`;
  questionText.textContent = currentQuestion.question;

  const progressPercent = (currentQuestionIndex / activeQuestions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;

  currentQuestion.options.forEach((optionText, index) => {
    const button = document.createElement("button");
    button.classList.add("option-btn");
    button.textContent = optionText;
    button.addEventListener("click", () => selectAnswer(index, button));
    optionsContainer.appendChild(button);
  });

  startTimer();
}

function startTimer() {
  timeLeft = TIME_PER_QUESTION;
  timeLeftEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      autoRevealAnswer();
    }
  }, 1000);
}

function selectAnswer(selectedIndex, selectedButton) {
  clearInterval(timer);
  const correctIndex = activeQuestions[currentQuestionIndex].answer;
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  allButtons.forEach((btn) => (btn.disabled = true));

  if (selectedIndex === correctIndex) {
    selectedButton.classList.add("correct");
    score++;
  } else {
    selectedButton.classList.add("wrong");
    allButtons[correctIndex].classList.add("correct");
  }

  nextBtn.disabled = false;
}

function autoRevealAnswer() {
  const correctIndex = activeQuestions[currentQuestionIndex].answer;
  const allButtons = optionsContainer.querySelectorAll(".option-btn");

  allButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === correctIndex) {
      btn.classList.add("correct");
    }
  });

  nextBtn.disabled = false;
}

function handleNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < activeQuestions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  progressBar.style.width = "100%";
  switchScreen(resultScreen);

  finalScoreEl.textContent = score;
  totalQuestionsEl.textContent = activeQuestions.length;

  const percentage = (score / activeQuestions.length) * 100;
  if (percentage === 100) {
    feedbackMessage.textContent = "Perfect score! Outstanding work.";
  } else if (percentage >= 60) {
    feedbackMessage.textContent = "Great job! You know your stuff.";
  } else {
    feedbackMessage.textContent = "Keep practicing and try again!";
  }
}
