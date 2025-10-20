/* SunSafe Sprint — Neon Reef Edition (Final Polished Version)
   - Sun avatar
   - Animated end modal
   - Unique questions per tile
   - Coral colour transitions
*/

const SIZE = 6;
const LAST = SIZE * SIZE - 1;
let rolledVal = 0;

const state = {
  pos: 0,
  score: 0,
  questionsAnswered: 0,
  rollingLocked: true
};

const QUESTIONS = [
  { q: "What does SPF stand for?", opts: ["Sun Protection Factor", "Skin Power Formula"], correct: 0 },
  { q: "Which UV type causes skin ageing?", opts: ["UVA", "UVB"], correct: 0 },
  { q: "What time should you avoid peak UV exposure?", opts: ["10am–4pm", "6pm–9am"], correct: 0 },
  { q: "How often should sunscreen be reapplied?", opts: ["Every 2 hours", "Once per day"], correct: 0 },
  { q: "Where should you apply sunscreen?", opts: ["All exposed skin", "Only face"], correct: 0 },
  { q: "What should you wear for UV protection?", opts: ["Long sleeves & hat", "Tank top"], correct: 0 },
  { q: "Can you get sunburnt on a cloudy day?", opts: ["Yes", "No"], correct: 0 },
  { q: "What is the safest shade to sit under?", opts: ["Tree or umbrella", "Bus stop roof"], correct: 0 },
  { q: "Which vitamin does sunlight provide?", opts: ["Vitamin D", "Vitamin C"], correct: 0 },
  { q: "What does UPF mean on clothing?", opts: ["Ultraviolet Protection Factor", "Ultra Pretty Fabric"], correct: 0 },
  { q: "How does sunscreen protect you?", opts: ["Blocks UV rays", "Reflects heat"], correct: 0 },
  { q: "Can darker skin tones get melanoma?", opts: ["Yes", "No"], correct: 0 },
  { q: "What part of your body is often missed when applying sunscreen?", opts: ["Ears", "Forehead"], correct: 0 },
  { q: "What type of hat is most effective?", opts: ["Broad-brimmed", "Baseball cap"], correct: 0 },
  { q: "How long before going outside should sunscreen be applied?", opts: ["20 minutes", "Immediately"], correct: 0 },
  { q: "Should sunglasses block UV radiation?", opts: ["Yes", "No"], correct: 0 },
  { q: "Is sunscreen waterproof forever?", opts: ["No, reapply after swimming", "Yes"], correct: 0 },
  { q: "What is the main cause of sunburn?", opts: ["UV radiation", "Temperature"], correct: 0 },
  { q: "Who should use sunscreen?", opts: ["Everyone", "Only fair-skinned people"], correct: 0 },
  { q: "What helps repair sun damage?", opts: ["Aloe vera", "Cold water"], correct: 0 },
  { q: "Can reflections from sand cause sunburn?", opts: ["Yes", "No"], correct: 0 },
  { q: "What is the UV Index used for?", opts: ["Measuring UV strength", "Temperature reading"], correct: 0 },
  { q: "Should babies under 6 months wear sunscreen?", opts: ["No, keep in shade", "Yes"], correct: 0 },
  { q: "Which country has the highest skin cancer rate?", opts: ["Australia", "Canada"], correct: 0 },
  { q: "What should you check monthly for melanoma?", opts: ["Moles and spots", "Hairline"], correct: 0 },
  { q: "What is the best clothing color for UV protection?", opts: ["Dark or bright colors", "White"], correct: 0 },
  { q: "What does the 'Slip, Slop, Slap' campaign mean?", opts: ["Slip on a shirt, Slop on sunscreen, Slap on a hat", "Slap the sun away"], correct: 0 },
  { q: "What’s the minimum SPF recommended for daily use?", opts: ["SPF 30", "SPF 10"], correct: 0 },
  { q: "What should you wear at the beach for UV protection?", opts: ["Rash vest", "No shirt"], correct: 0 },
  { q: "Where should you store sunscreen?", opts: ["Cool, dry place", "Hot car"], correct: 0 },
  { q: "Can tanning beds cause melanoma?", opts: ["Yes", "No"], correct: 0 },
  { q: "What part of Australia has the highest UV?", opts: ["Queensland", "Tasmania"], correct: 0 },
  { q: "What’s the safest sunscreen ingredient type?", opts: ["Broad-spectrum", "Fragrant-only"], correct: 0 },
  { q: "When should you reapply sunscreen after swimming?", opts: ["After drying off", "Tomorrow"], correct: 0 },
  { q: "Should you wear sunscreen indoors?", opts: ["Yes, near windows", "No"], correct: 0 },
  { q: "Which body part is most exposed while driving?", opts: ["Left arm", "Feet"], correct: 0 }
];

const $ = s => document.querySelector(s);
const els = {
  menu: $("#menu"),
  play: $("#play"),
  startBtn: $("#startBtn"),
  restartBtn: $("#restartBtn"),
  board: $("#board"),
  cardTitle: $("#cardTitle"),
  cardText: $("#cardText"),
  cardActions: $("#cardActions"),
  rollBtn: $("#rollBtn"),
  moveBtn: $("#moveBtn"),
  rollResult: $("#rollResult"),
  progress: $("#progress-bar"),
  modal: $("#resultModal"),
  modalTitle: $("#resultTitle"),
  modalMsg: $("#resultMsg"),
  modalClose: $("#closeModal")
};

/* ---------- Setup ---------- */
function initGame() {
  state.pos = 0;
  state.score = 0;
  state.questionsAnswered = 0;
  state.rollingLocked = true;
  renderBoard();
  renderAvatar();
  updateProgress();
  showQuestion(true);
  updateUI();
}

/* ---------- Rendering ---------- */
function renderBoard() {
  els.board.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const tile = document.createElement("div");
    tile.className = "tile inactive-pink";
    tile.innerHTML = `<div class="tile-text">${QUESTIONS[i].q}</div>`;
    els.board.appendChild(tile);
  }
}

function renderAvatar() {
  els.board.querySelectorAll(".avatar").forEach(p => p.remove());
  els.board.querySelectorAll(".tile").forEach(t => {
    t.classList.remove("active", "inactive-pink", "inactive-yellow", "inactive-purple");
    const randomInactive = ["inactive-pink", "inactive-yellow", "inactive-purple"];
    t.classList.add(randomInactive[Math.floor(Math.random() * 3)]);
  });

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  const tile = els.board.children[state.pos];
  tile.appendChild(avatar);
  tile.classList.remove("inactive-pink", "inactive-yellow", "inactive-purple");
  tile.classList.add("active");
}

/* ---------- Game Logic ---------- */
function updateProgress() {
  els.progress.style.width = Math.min((state.pos / LAST) * 100, 100) + "%";
}

function updateUI() {
  els.rollBtn.disabled = state.rollingLocked;
  els.moveBtn.classList.add("hidden");
}

/* Roll animation */
function rollDie() {
  if (state.rollingLocked) return;
  els.rollBtn.disabled = true;
  els.rollResult.textContent = "🎲";
  rolledVal = 0;
  let ticks = 0;
  const interval = setInterval(() => {
    rolledVal = Math.floor(Math.random() * 6) + 1;
    els.rollResult.textContent = rolledVal;
    ticks++;
    if (ticks > 10) {
      clearInterval(interval);
      els.moveBtn.classList.remove("hidden");
    }
  }, 100);
}

function movePlayer() {
  els.moveBtn.classList.add("hidden");
  state.pos = Math.min(state.pos + rolledVal, LAST);
  renderAvatar();
  updateProgress();
  showQuestion(false);
}

function showQuestion(first) {
  const q = QUESTIONS[state.pos];

  // clear previous buttons
  els.cardActions.innerHTML = "";

  // create a randomized order of answer options
  const randomizedOptions = [...q.opts].sort(() => Math.random() - 0.5);

  randomizedOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.textContent = opt;
    btn.style.margin = "5px";                // add slight spacing between buttons
    btn.style.textAlign = "center";          // center text inside button
    btn.onclick = () => handleAnswer(opt === q.opts[q.correct]);
    els.cardActions.appendChild(btn);
  });

  // center the question text and title
  els.cardTitle.style.textAlign = "center";
  els.cardText.style.textAlign = "center";

  els.cardTitle.textContent = first ? "Start — Tile 0" : `Tile ${state.pos}`;
  els.cardText.textContent = q.q;
}


function handleAnswer(correct) {
  state.questionsAnswered++;
  if (correct) {
    state.score++;
    els.cardTitle.textContent = "✅ Correct!";
    els.cardText.textContent = "Press Roll to continue!";
    els.cardActions.innerHTML = "";
    state.rollingLocked = false;
    updateUI();
    if (state.pos === LAST) finishGame();
  } else {
    els.cardTitle.textContent = "❌ Try Again";
    els.cardText.textContent = "Pick the right answer to unlock rolling.";
  }
}

function finishGame() {
  document.querySelectorAll(".tile").forEach(t => {
    t.style.transition = "background 0.5s ease";
    t.style.background = "linear-gradient(135deg, #3b82f6, #a855f7, #ec4899, #facc15)";
  });

  els.progress.style.transition = "all 1s ease";
  els.progress.style.boxShadow = "0 0 25px #facc15";
  els.progress.style.background = "linear-gradient(90deg, #3b82f6, #a855f7, #ec4899, #facc15)";

  const pct = Math.round((state.score / (state.questionsAnswered || 1)) * 100);
  setTimeout(() => {
    showResult(
      pct >= 80 ? "You Win! You scored higher than 80%" : "Game Over",
      `You answered ${state.score}/${state.questionsAnswered} correctly (${pct}%).`
    );
  }, 1200);
}

function showResult(title, msg) {
  els.modalTitle.textContent = title;
  els.modalMsg.textContent = msg;
  els.modal.classList.add("visible");
  els.modal.showModal();
}

/* ---------- Navigation ---------- */
els.startBtn.onclick = () => {
  els.menu.classList.add("hidden");
  els.play.classList.remove("hidden");
  initGame();
};
els.restartBtn.onclick = initGame;
els.rollBtn.onclick = rollDie;
els.moveBtn.onclick = movePlayer;
els.modalClose.onclick = () => {
  els.modal.close();
  els.modal.classList.remove("visible");
  els.play.classList.add("hidden");
  els.menu.classList.remove("hidden");
};

/* Footer reveal on scroll */
window.addEventListener("scroll", () => {
  const footer = document.getElementById("footer");
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    footer.classList.add("visible");
  } else {
    footer.classList.remove("visible");
  }
});

