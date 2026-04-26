const MAX_QUESTIONS = 100;

const QUIZ_TYPES = {
  meaning: "意味選択",
  listening: "聞き取り",
};

const promptEl = document.getElementById("prompt");
const optionsEl = document.getElementById("options");
const messageEl = document.getElementById("message");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const modeCountEl = document.getElementById("modeCount");
const modeLabelEl = document.getElementById("modeLabel");
const posSummaryEl = document.getElementById("posSummary");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const playAudioBtn = document.getElementById("playAudioBtn");
const audioControlsEl = document.getElementById("audioControls");

let deck = [];
let current = null;
let questionNumber = 0;
let score = 0;
let streak = 0;
let answered = false;
let listeningCount = 0;
let totalQuestions = 0;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const groupedWords = words.reduce((acc, word) => {
  if (!acc[word.pos]) acc[word.pos] = [];
  acc[word.pos].push(word);
  return acc;
}, {});

function buildBalancedCycle() {
  const copied = Object.fromEntries(
    Object.entries(groupedWords).map(([pos, items]) => [pos, shuffle(items)]),
  );
  const order = shuffle(Object.keys(copied));
  const newDeck = [];

  let hasWords = true;
  while (hasWords) {
    hasWords = false;
    order.forEach((pos) => {
      const picked = copied[pos].pop();
      if (picked) {
        newDeck.push(picked);
        hasWords = true;
      }
    });
  }

  return newDeck;
}

function buildQuestionDeck(maxQuestions) {
  const newDeck = [];
  while (newDeck.length < maxQuestions) {
    const cycle = buildBalancedCycle();
    const remain = maxQuestions - newDeck.length;
    newDeck.push(...cycle.slice(0, remain));
  }
  return newDeck;
}

function renderPosSummary() {
  posSummaryEl.innerHTML = "";
  Object.keys(groupedWords).forEach((pos) => {
    const item = document.createElement("div");
    item.className = "pos-item";
    item.textContent = `${pos}: ${groupedWords[pos].length}語`;
    posSummaryEl.appendChild(item);
  });
}

function initGame() {
  totalQuestions = MAX_QUESTIONS;
  deck = buildQuestionDeck(totalQuestions);
  questionNumber = 0;
  score = 0;
  streak = 0;
  answered = false;
  listeningCount = 0;
  messageEl.textContent = "";
  messageEl.className = "message";
  renderPosSummary();
  updateStatus();
  loadQuestion();
}

function updateStatus() {
  progressEl.textContent = `問題: ${Math.min(questionNumber + 1, totalQuestions)} / ${totalQuestions}`;
  scoreEl.textContent = `スコア: ${score}`;
  streakEl.textContent = `連続正解: ${streak}`;
  modeCountEl.textContent = `聞き取り: ${listeningCount}問`;
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = 0.93;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function getQuizType() {
  if (questionNumber > 0 && questionNumber % 3 === 0) {
    return "listening";
  }
  return Math.random() < 0.35 ? "listening" : "meaning";
}

function makeChoicesByMeaning(target) {
  const wrongPool = [...new Set(words.filter((w) => w.zh !== target.zh).map((w) => w.zh))];
  const wrongChoices = shuffle(wrongPool).slice(0, 3);
  const uniqueChoices = [...new Set([target.zh, ...wrongChoices])];
  return shuffle(uniqueChoices);
}

function loadQuestion() {
  if (questionNumber >= totalQuestions || deck.length === 0) {
    promptEl.textContent = "おつかれさま。ぜんもん しゅうりょう。";
    optionsEl.innerHTML = "";
    audioControlsEl.style.display = "none";
    modeLabelEl.textContent = "モード: 終了";
    messageEl.textContent = `さいしゅうすこあ: ${score} / ${totalQuestions * 10}`;
    messageEl.className = "message ok";
    progressEl.textContent = `問題: ${totalQuestions} / ${totalQuestions}`;
    return;
  }

  answered = false;
  current = deck.shift();
  const quizType = getQuizType();
  current.quizType = quizType;
  modeLabelEl.textContent = `モード: ${QUIZ_TYPES[quizType]} / ${current.pos}`;

  if (quizType === "meaning") {
    audioControlsEl.style.display = "none";
    promptEl.textContent = `「${current.kana}」の いみ（ちゅうごくご）は どれ？`;
    renderOptions(makeChoicesByMeaning(current));
  } else {
    listeningCount += 1;
    audioControlsEl.style.display = "flex";
    promptEl.textContent = "おとをきいて、あう ことばを えらんでください。";
    renderOptions(makeChoicesByMeaning(current));
    speak(current.kana);
  }

  messageEl.textContent = "";
  messageEl.className = "message";
  updateStatus();
}

function renderOptions(choices) {
  optionsEl.innerHTML = "";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "option-btn";
    btn.dataset.value = choice;
    btn.addEventListener("click", () => handleAnswer(btn, choice));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(btn, selected) {
  if (answered) return;
  answered = true;

  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach((b) => (b.disabled = true));

  const correctValue = current.zh;

  if (selected === correctValue) {
    score += 10;
    streak += 1;
    btn.classList.add("correct");
    messageEl.textContent = `せいかい！ ${current.kana} = ${current.zh}`;
    messageEl.className = "message ok";
  } else {
    streak = 0;
    btn.classList.add("wrong");
    buttons.forEach((b) => {
      if (b.dataset.value === correctValue) b.classList.add("correct");
    });
    messageEl.textContent = `ざんねん。せいかいは「${current.kana}（${current.zh}）」です。`;
    messageEl.className = "message ng";
  }

  questionNumber += 1;
  updateStatus();
}

playAudioBtn.addEventListener("click", () => {
  if (current && current.quizType === "listening") {
    speak(current.kana);
  }
});

nextBtn.addEventListener("click", loadQuestion);
resetBtn.addEventListener("click", initGame);

initGame();
