const MAX_QUESTIONS = 100;
const RECENT_DISTRACTOR_WINDOW = 12;
const RECENT_CHOICESET_WINDOW = 24;
const RECENT_CHOICES_WINDOW = 48;

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
let usedDistractors = [];
let recentChoices = [];
let usedChoiceSets = [];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const groupedWords = words.reduce((acc, word) => {
  if (!acc[word.pos]) acc[word.pos] = [];
  acc[word.pos].push(word);
  return acc;
}, {});

function pickLeastUsed(items, usedCounter, key) {
  const minUsed = Math.min(...items.map((item) => usedCounter[item[key]] || 0));
  return shuffle(items.filter((item) => (usedCounter[item[key]] || 0) === minUsed))[0];
}

function buildBalancedDeck(limit) {
  const byPos = Object.fromEntries(
    Object.entries(groupedWords).map(([pos, items]) => [pos, shuffle(items)]),
  );
  const posOrder = shuffle(Object.keys(byPos));
  const topicUse = {};
  const newDeck = [];

  while (newDeck.length < limit) {
    let progressed = false;

    posOrder.forEach((pos) => {
      if (newDeck.length >= limit) return;

      const bucket = byPos[pos];
      if (!bucket || bucket.length === 0) return;

      const picked = pickLeastUsed(bucket, topicUse, "topic");
      const pickedIndex = bucket.findIndex((word) => word.jp === picked.jp);
      if (pickedIndex >= 0) {
        bucket.splice(pickedIndex, 1);
        topicUse[picked.topic] = (topicUse[picked.topic] || 0) + 1;
        newDeck.push(picked);
        progressed = true;
      }
    });

    if (!progressed) break;
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
  totalQuestions = Math.min(MAX_QUESTIONS, words.length);
  deck = buildBalancedDeck(totalQuestions);
  questionNumber = 0;
  score = 0;
  streak = 0;
  answered = false;
  listeningCount = 0;
  usedDistractors = [];
  recentChoices = [];
  usedChoiceSets = [];
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

function rememberChoiceState(choiceSet, distractors) {
  usedChoiceSets.push(choiceSet);
  if (usedChoiceSets.length > RECENT_CHOICESET_WINDOW) usedChoiceSets.shift();

  usedDistractors.push(...distractors);
  if (usedDistractors.length > RECENT_CHOICES_WINDOW) {
    usedDistractors = usedDistractors.slice(-RECENT_CHOICES_WINDOW);
  }

  recentChoices.push(...choiceSet.split("|"));
  if (recentChoices.length > RECENT_CHOICES_WINDOW) {
    recentChoices = recentChoices.slice(-RECENT_CHOICES_WINDOW);
  }
}

function makeChoicesByMeaning(target) {
  const pool = words.filter((w) => w.jp !== target.jp && w.zh !== target.zh);
  const recentDistractors = new Set(usedDistractors.slice(-RECENT_DISTRACTOR_WINDOW));
  const recentChoiceValues = new Set(recentChoices.slice(-RECENT_DISTRACTOR_WINDOW));

  const preferred = pool.filter(
    (w) => !recentDistractors.has(w.zh) && !recentChoiceValues.has(w.zh),
  );

  const fallback = shuffle(pool).map((w) => w.zh);
  const candidateOrder = [...shuffle(preferred).map((w) => w.zh), ...fallback];
  const wrongChoices = [];

  for (const choice of candidateOrder) {
    if (wrongChoices.includes(choice)) continue;
    wrongChoices.push(choice);
    if (wrongChoices.length === 3) break;
  }

  const uniqueChoices = shuffle([target.zh, ...wrongChoices]);
  const uniqueSet = [...new Set(uniqueChoices)];

  if (uniqueSet.length < 4) {
    const supplementation = shuffle(pool)
      .map((w) => w.zh)
      .filter((zh) => !uniqueSet.includes(zh));
    uniqueSet.push(...supplementation.slice(0, 4 - uniqueSet.length));
  }

  let finalized = shuffle(uniqueSet.slice(0, 4));
  let setKey = [...finalized].sort().join("|");
  let guard = 0;
  while (usedChoiceSets.includes(setKey) && guard < 20) {
    finalized = shuffle(finalized);
    setKey = [...finalized].sort().join("|");
    guard += 1;
  }

  const distractors = finalized.filter((choice) => choice !== target.zh);
  rememberChoiceState(setKey, distractors);
  return finalized;
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
  current = deck[questionNumber];
  const quizType = getQuizType();
  current.quizType = quizType;
  modeLabelEl.textContent = `モード: ${QUIZ_TYPES[quizType]} / ${current.pos} / ${current.topic}`;

  if (quizType === "meaning") {
    audioControlsEl.style.display = "none";
    promptEl.textContent = `「${current.kana}」の いみは どれ？`;
    renderOptions(makeChoicesByMeaning(current));
  } else {
    listeningCount += 1;
    audioControlsEl.style.display = "flex";
    promptEl.textContent = "おとをきいて、いみ（ちゅうごくご）を えらんでください。";
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
  const trapNote = current.trap ? ` / メモ: ${current.trap}` : "";

  if (selected === correctValue) {
    score += 10;
    streak += 1;
    btn.classList.add("correct");
    messageEl.textContent = `せいかい！ ${current.kana}（${current.jp}）= ${current.zh}${trapNote}`;
    messageEl.className = "message ok";
  } else {
    streak = 0;
    btn.classList.add("wrong");
    buttons.forEach((b) => {
      if (b.dataset.value === correctValue) b.classList.add("correct");
    });
    messageEl.textContent = `ざんねん。せいかいは「${current.kana}（${current.jp}）= ${current.zh}」です。${trapNote}`;
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
