const questions = [
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

// DOM Elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

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

// Event Listeners
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNextQuestion);
restartBtn.addEventListener("click", startQuiz);

function switchScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.remove("active"));
  screenToShow.classList.add("active");
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  switchScreen(quizScreen);
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timer);
  nextBtn.disabled = true;
  optionsContainer.innerHTML = "";

  const currentQuestion = questions[currentQuestionIndex];
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionText.textContent = currentQuestion.question;

  // Update progress bar
  const progressPercent = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Render options
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
  const correctIndex = questions[currentQuestionIndex].answer;
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
  const correctIndex = questions[currentQuestionIndex].answer;
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
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  progressBar.style.width = "100%";
  switchScreen(resultScreen);

  finalScoreEl.textContent = score;
  totalQuestionsEl.textContent = questions.length;

  const percentage = (score / questions.length) * 100;
  if (percentage === 100) {
    feedbackMessage.textContent = "Perfect score! Outstanding work.";
  } else if (percentage >= 60) {
    feedbackMessage.textContent = "Great job! You know your stuff.";
  } else {
    feedbackMessage.textContent = "Keep practicing and try again!";
  }
}
