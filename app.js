const MAX_QUESTIONS = 100;
const RECENT_DISTRACTOR_WINDOW = 12;
const RECENT_CHOICESET_WINDOW = 24;
const RECENT_CHOICES_WINDOW = 48;
const SAVED_WEAK_WORDS_KEY = "nihongo-n3-saved-weak-word-keys";
const SAVED_WEAK_WORDS_LIMIT = 100;

const QUIZ_TYPES = {
  meaning: "意味選択",
  listening: "聞き取り",
  context: "文脈選択",
};

const CONTEXT_QUESTIONS = [
  {
    jp: "開く",
    sentence: "風でドアが ___。",
    translation: "门因为风开了。",
    choices: ["開く", "開ける", "始める", "集める"],
    note: "「ドアが」なので自動詞を使う",
  },
  {
    jp: "開ける",
    sentence: "暑いので、窓を ___。",
    translation: "因为热，所以打开窗户。",
    choices: ["開く", "開ける", "始まる", "集まる"],
    note: "「窓を」なので他動詞を使う",
  },
  {
    jp: "始まる",
    sentence: "授業が9時に ___。",
    translation: "课九点开始。",
    choices: ["始まる", "始める", "続ける", "決める"],
    note: "「授業が」なので自動詞を使う",
  },
  {
    jp: "始める",
    sentence: "来月から日本語の勉強を ___。",
    translation: "从下个月开始学习日语。",
    choices: ["始まる", "始める", "続く", "決まる"],
    note: "「勉強を」なので他動詞を使う",
  },
  {
    jp: "集まる",
    sentence: "駅の前に人がたくさん ___。",
    translation: "车站前聚集了很多人。",
    choices: ["集まる", "集める", "含む", "選ぶ"],
    note: "「人が」なので自動詞を使う",
  },
  {
    jp: "集める",
    sentence: "発表のために資料を ___。",
    translation: "为了发表收集资料。",
    choices: ["集まる", "集める", "比べる", "伝える"],
    note: "「資料を」なので他動詞を使う",
  },
  {
    jp: "増える",
    sentence: "最近、日本語を勉強する人が ___。",
    translation: "最近学习日语的人增加了。",
    choices: ["増える", "増やす", "含む", "続ける"],
    note: "「人が」なので自動詞を使う",
  },
  {
    jp: "増やす",
    sentence: "毎日、覚える単語を少しずつ ___。",
    translation: "每天一点点增加要记的单词。",
    choices: ["増える", "増やす", "続く", "慣れる"],
    note: "「単語を」なので他動詞を使う",
  },
  {
    jp: "続く",
    sentence: "雨が三日も ___。",
    translation: "雨连续下了三天。",
    choices: ["続く", "続ける", "遅れる", "遅らせる"],
    note: "「雨が」なので自動詞を使う",
  },
  {
    jp: "続ける",
    sentence: "毎朝、発音練習を ___。",
    translation: "每天早上继续练习发音。",
    choices: ["続く", "続ける", "間に合う", "知らせる"],
    note: "「練習を」なので他動詞を使う",
  },
  {
    jp: "遅れる",
    sentence: "電車が事故で ___。",
    translation: "电车因为事故晚点了。",
    choices: ["遅れる", "遅らせる", "間に合う", "確かめる"],
    note: "「電車が」なので自動詞を使う",
  },
  {
    jp: "遅らせる",
    sentence: "会議の時間を30分 ___。",
    translation: "把会议时间推迟30分钟。",
    choices: ["遅れる", "遅らせる", "間違う", "比べる"],
    note: "「時間を」なので他動詞を使う",
  },
  {
    jp: "間違う",
    sentence: "答えが一つ ___。",
    translation: "有一个答案错了。",
    choices: ["間違う", "間違える", "確かめる", "選ぶ"],
    note: "「答えが」なので自動詞を使う",
  },
  {
    jp: "間違える",
    sentence: "試験で漢字を ___。",
    translation: "考试时写错了汉字。",
    choices: ["間違う", "間違える", "知らせる", "頼む"],
    note: "「漢字を」なので他動詞を使う",
  },
  {
    jp: "間に合う",
    sentence: "走れば、電車に ___。",
    translation: "如果跑的话，能赶上电车。",
    choices: ["間に合う", "遅れる", "遅らせる", "決める"],
    note: "「〜に間に合う」の形で覚える",
  },
  {
    jp: "慣れる",
    sentence: "新しい生活に少しずつ ___。",
    translation: "慢慢习惯新的生活。",
    choices: ["慣れる", "決める", "比べる", "含む"],
    note: "対象は「〜に慣れる」",
  },
  {
    jp: "やっと",
    sentence: "何度も練習して、___ 合格できた。",
    translation: "练习了很多次，终于合格了。",
    choices: ["やっと", "たまたま", "もちろん", "わざと"],
    note: "苦労して達成した時に使う",
  },
  {
    jp: "たまたま",
    sentence: "駅で高校の友だちに ___ 会った。",
    translation: "在车站碰巧遇到了高中朋友。",
    choices: ["たまたま", "わざと", "もちろん", "しっかり"],
    note: "偶然の意味。頻度を表す語ではない",
  },
  {
    jp: "わざと",
    sentence: "彼は冗談で ___ 変な答えを書いた。",
    translation: "他开玩笑故意写了奇怪的答案。",
    choices: ["わざと", "わざわざ", "すでに", "しばらく"],
    note: "故意にする時に使う",
  },
  {
    jp: "わざわざ",
    sentence: "忙しいのに、___ 来てくれてありがとう。",
    translation: "你这么忙还特意来，谢谢。",
    choices: ["わざわざ", "わざと", "突然", "たいてい"],
    note: "相手の手間に感謝する文でよく使う",
  },
  {
    jp: "大切",
    sentence: "これは祖母からもらった ___ な写真です。",
    translation: "这是从祖母那里收到的珍贵照片。",
    choices: ["大切", "重要", "十分", "急"],
    note: "感情的な価値がある時は「大切」",
  },
  {
    jp: "重要",
    sentence: "試験で一番 ___ なポイントを確認します。",
    translation: "确认考试中最重要的要点。",
    choices: ["重要", "大切", "平気", "自由"],
    note: "客観的に大事な要点には「重要」が自然",
  },
  {
    jp: "安心",
    sentence: "母の声を聞いて、少し ___ した。",
    translation: "听到母亲的声音后，稍微放心了。",
    choices: ["安心", "平気", "苦手", "急"],
    note: "不安がなくなる時に使う",
  },
  {
    jp: "平気",
    sentence: "少し寒いけど、私は ___ です。",
    translation: "有点冷，但我没关系。",
    choices: ["平気", "安心", "危険", "複雑"],
    note: "問題ない、気にしないという意味",
  },
];

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
const savedReviewBtn = document.getElementById("savedReviewBtn");
const playAudioBtn = document.getElementById("playAudioBtn");
const audioControlsEl = document.getElementById("audioControls");

let deck = [];
let current = null;
let questionNumber = 0;
let score = 0;
let streak = 0;
let answered = false;
let listeningCount = 0;
let contextCount = 0;
let totalQuestions = 0;
let usedDistractors = [];
let recentChoices = [];
let usedChoiceSets = [];
let missedWords = [];
let reviewMisses = [];
let isReviewMode = false;
let reviewRound = 0;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const contextQuestionByWord = CONTEXT_QUESTIONS.reduce((acc, question) => {
  acc[question.jp] = question;
  return acc;
}, {});

function getContextQuestion(word) {
  return contextQuestionByWord[word.jp];
}

function getWordKey(word) {
  return `${word.jp}|${word.kana}|${word.zh}`;
}

const wordByKey = words.reduce((acc, word) => {
  acc[getWordKey(word)] = word;
  return acc;
}, {});

function uniqueWords(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getWordKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getStoredWeakWordKeys() {
  if (typeof localStorage === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_WEAK_WORDS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((key) => typeof key === "string" && wordByKey[key]);
  } catch {
    return [];
  }
}

function setStoredWeakWordKeys(keys) {
  if (typeof localStorage === "undefined") return;

  const cleanKeys = [...new Set(keys)]
    .filter((key) => wordByKey[key])
    .slice(-SAVED_WEAK_WORDS_LIMIT);

  try {
    localStorage.setItem(SAVED_WEAK_WORDS_KEY, JSON.stringify(cleanKeys));
  } catch {
    // 保存できない環境でも、ゲーム本体はそのまま遊べるようにする。
  }
}

function getSavedWeakWords() {
  return getStoredWeakWordKeys()
    .map((key) => wordByKey[key])
    .filter(Boolean);
}

function saveWeakWord(word) {
  const key = getWordKey(word);
  const keys = getStoredWeakWordKeys().filter((item) => item !== key);
  keys.push(key);
  setStoredWeakWordKeys(keys);
  updateSavedReviewButton();
}

function removeSavedWeakWord(word) {
  const key = getWordKey(word);
  const keys = getStoredWeakWordKeys().filter((item) => item !== key);
  setStoredWeakWordKeys(keys);
  updateSavedReviewButton();
}

function updateSavedReviewButton() {
  if (!savedReviewBtn) return;

  const count = getSavedWeakWords().length;
  savedReviewBtn.hidden = isReviewMode || count === 0;
  savedReviewBtn.textContent = count > 0 ? `保存した苦手語を復習 (${count})` : "保存した苦手語を復習";
}

function rememberMiss(word) {
  const misses = isReviewMode ? reviewMisses : missedWords;
  if (!misses.some((item) => getWordKey(item) === getWordKey(word))) {
    misses.push(word);
  }
  saveWeakWord(word);
}

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
  contextCount = 0;
  usedDistractors = [];
  recentChoices = [];
  usedChoiceSets = [];
  missedWords = [];
  reviewMisses = [];
  isReviewMode = false;
  reviewRound = 0;
  nextBtn.dataset.action = "next";
  nextBtn.textContent = "次の問題";
  messageEl.textContent = "";
  messageEl.className = "message";
  renderPosSummary();
  updateSavedReviewButton();
  updateStatus();
  loadQuestion();
}

function updateStatus() {
  const label = isReviewMode ? `復習${reviewRound}` : "問題";
  progressEl.textContent = `${label}: ${Math.min(questionNumber + 1, totalQuestions)} / ${totalQuestions}`;
  scoreEl.textContent = `スコア: ${score}`;
  streakEl.textContent = `連続正解: ${streak}`;
  modeCountEl.textContent = `聞き取り: ${listeningCount}問 / 文脈: ${contextCount}問`;
}

function renderReviewSummary(items) {
  optionsEl.innerHTML = "";
  if (items.length === 0) return;

  const list = document.createElement("div");
  list.className = "review-list";

  const title = document.createElement("h2");
  title.textContent = "復習する語";
  list.appendChild(title);

  items.slice(0, 12).forEach((word) => {
    const item = document.createElement("div");
    item.className = "review-item";
    item.textContent = `${word.kana}（${word.jp}） - ${word.zh}`;
    list.appendChild(item);
  });

  if (items.length > 12) {
    const more = document.createElement("div");
    more.className = "review-more";
    more.textContent = `ほか ${items.length - 12}語`;
    list.appendChild(more);
  }

  optionsEl.appendChild(list);
}

function finishMainRound() {
  const misses = uniqueWords(missedWords);
  promptEl.textContent = "おつかれさま。ぜんもん しゅうりょう。";
  audioControlsEl.style.display = "none";
  modeLabelEl.textContent = "モード: 終了";
  progressEl.textContent = `問題: ${totalQuestions} / ${totalQuestions}`;

  if (misses.length > 0) {
    messageEl.textContent = `さいしゅうすこあ: ${score} / ${totalQuestions * 10}。間違えた語: ${misses.length}語`;
    nextBtn.textContent = "間違えた語だけ復習";
    nextBtn.dataset.action = "review";
    renderReviewSummary(misses);
  } else {
    messageEl.textContent = `さいしゅうすこあ: ${score} / ${totalQuestions * 10}。全問正解です！`;
    nextBtn.textContent = "もう一度プレイ";
    nextBtn.dataset.action = "restart";
    optionsEl.innerHTML = "";
  }

  messageEl.className = "message ok";
}

function finishReviewRound() {
  const misses = uniqueWords(reviewMisses);
  promptEl.textContent =
    misses.length > 0
      ? "復習ラウンド終了。まだ苦手な語をもう一度練習できます。"
      : "復習完了。間違えた語を確認できました。";
  audioControlsEl.style.display = "none";
  modeLabelEl.textContent = "モード: 復習終了";
  progressEl.textContent = `復習${reviewRound}: ${totalQuestions} / ${totalQuestions}`;

  if (misses.length > 0) {
    messageEl.textContent = `復習スコア: ${score} / ${totalQuestions * 10}。もう一度: ${misses.length}語`;
    nextBtn.textContent = "もう一度復習";
    nextBtn.dataset.action = "review-again";
    renderReviewSummary(misses);
  } else {
    messageEl.textContent = `復習スコア: ${score} / ${totalQuestions * 10}`;
    nextBtn.textContent = "通常ゲームへ";
    nextBtn.dataset.action = "restart";
    optionsEl.innerHTML = "";
  }

  messageEl.className = "message ok";
}

function startReview(sourceWords) {
  const reviewWords = uniqueWords(sourceWords);
  if (reviewWords.length === 0) {
    initGame();
    return;
  }

  isReviewMode = true;
  reviewRound += 1;
  deck = shuffle(reviewWords);
  questionNumber = 0;
  score = 0;
  streak = 0;
  answered = false;
  listeningCount = 0;
  contextCount = 0;
  totalQuestions = deck.length;
  reviewMisses = [];
  usedDistractors = [];
  recentChoices = [];
  usedChoiceSets = [];
  nextBtn.dataset.action = "next";
  nextBtn.textContent = "次の問題";
  messageEl.textContent = "";
  messageEl.className = "message";
  updateSavedReviewButton();
  updateStatus();
  loadQuestion();
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = 0.93;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function getQuizType(word) {
  const hasContextQuestion = Boolean(getContextQuestion(word));

  if (hasContextQuestion && questionNumber > 0 && questionNumber % 4 === 0) {
    return "context";
  }

  if (questionNumber > 0 && questionNumber % 3 === 0) {
    return "listening";
  }

  if (hasContextQuestion && Math.random() < 0.28) {
    return "context";
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

function makeChoicesByContext(question) {
  const wrongChoices = question.choices.filter((choice) => choice !== question.jp);
  const fallback = words
    .map((word) => word.jp)
    .filter((choice) => choice !== question.jp && !wrongChoices.includes(choice));
  const finalized = shuffle([question.jp, ...shuffle([...wrongChoices, ...fallback]).slice(0, 3)]);
  const setKey = [...finalized].sort().join("|");
  const distractors = finalized.filter((choice) => choice !== question.jp);
  rememberChoiceState(setKey, distractors);
  return finalized;
}

function fillBlank(sentence, answer) {
  return sentence.replace("___", `「${answer}」`);
}

function loadQuestion() {
  if (questionNumber >= totalQuestions || deck.length === 0) {
    if (isReviewMode) {
      finishReviewRound();
    } else {
      finishMainRound();
    }
    return;
  }

  answered = false;
  nextBtn.dataset.action = "next";
  nextBtn.textContent = "次の問題";
  current = deck[questionNumber];
  const quizType = getQuizType(current);
  current.quizType = quizType;
  current.contextQuestion = getContextQuestion(current);
  modeLabelEl.textContent = `モード: ${QUIZ_TYPES[quizType]} / ${current.pos} / ${current.topic}`;

  if (quizType === "meaning") {
    audioControlsEl.style.display = "none";
    promptEl.textContent = `「${current.kana}」の いみは どれ？`;
    renderOptions(makeChoicesByMeaning(current));
  } else if (quizType === "listening") {
    listeningCount += 1;
    audioControlsEl.style.display = "flex";
    promptEl.textContent = "おとをきいて、いみ（ちゅうごくご）を えらんでください。";
    renderOptions(makeChoicesByMeaning(current));
    speak(current.kana);
  } else {
    contextCount += 1;
    audioControlsEl.style.display = "none";
    promptEl.textContent = `文に合う日本語を選んでください: ${current.contextQuestion.sentence}`;
    renderOptions(makeChoicesByContext(current.contextQuestion));
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

  const isContextQuestion = current.quizType === "context";
  const contextQuestion = current.contextQuestion;
  const correctValue = isContextQuestion ? contextQuestion.jp : current.zh;
  const trapNote = current.trap ? ` / メモ: ${current.trap}` : "";
  const contextNote =
    isContextQuestion && contextQuestion.note ? ` / ポイント: ${contextQuestion.note}` : "";

  if (selected === correctValue) {
    score += 10;
    streak += 1;
    if (isReviewMode) {
      removeSavedWeakWord(current);
    }
    btn.classList.add("correct");
    if (isContextQuestion) {
      messageEl.textContent = `せいかい！ ${fillBlank(contextQuestion.sentence, correctValue)} ${contextQuestion.translation} / ${current.kana} = ${current.zh}${contextNote}${trapNote}`;
    } else {
      messageEl.textContent = `せいかい！ ${current.kana}（${current.jp}）= ${current.zh}${trapNote}`;
    }
    messageEl.className = "message ok";
  } else {
    streak = 0;
    rememberMiss(current);
    btn.classList.add("wrong");
    buttons.forEach((b) => {
      if (b.dataset.value === correctValue) b.classList.add("correct");
    });
    if (isContextQuestion) {
      messageEl.textContent = `ざんねん。正解は「${correctValue}」。${fillBlank(contextQuestion.sentence, correctValue)} ${contextQuestion.translation} / ${current.kana} = ${current.zh}${contextNote}${trapNote}`;
    } else {
      messageEl.textContent = `ざんねん。せいかいは「${current.kana}（${current.jp}）= ${current.zh}」です。${trapNote}`;
    }
    messageEl.className = "message ng";
  }

  questionNumber += 1;
  updateStatus();
}

function handleNextAction() {
  const action = nextBtn.dataset.action;

  if (action === "review") {
    startReview(missedWords);
    return;
  }

  if (action === "review-again") {
    startReview(reviewMisses);
    return;
  }

  if (action === "restart") {
    initGame();
    return;
  }

  loadQuestion();
}

function startSavedReview() {
  const savedWords = getSavedWeakWords();
  if (savedWords.length > 0) {
    startReview(savedWords);
  }
}

playAudioBtn.addEventListener("click", () => {
  if (current && current.quizType === "listening") {
    speak(current.kana);
  }
});

nextBtn.addEventListener("click", handleNextAction);
resetBtn.addEventListener("click", initGame);
if (savedReviewBtn) {
  savedReviewBtn.addEventListener("click", startSavedReview);
}

initGame();
