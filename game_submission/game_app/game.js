/* ---------------------------------
   SunSafe Sprint — Game Logic
   --------------------------------- */

const SIZE = 6;          // 6x6 board
const LAST = SIZE * SIZE - 1;
const MIN = 0, MAX = 30;

// State
const state = {
  pos: 0,
  SH: 20,  // Skin Health
  SS: 10,  // SunSmart
  EX: 6,   // Exposure
  rollingLocked: false
};

// Tile types layout (start/finish fixed, mix of event/action/quiz)
const layout = (() => {
  const arr = Array.from({ length: SIZE * SIZE }, (_, i) => {
    if (i === 0) return "start";
    if (i === LAST) return "finish";
    return "event"; // default; we'll overwrite some below
  });
  // sprinkle action & quiz tiles
  const actionIdx = [3, 5, 8, 12, 16, 19, 21, 25, 28, 32];
  const quizIdx   = [6, 10, 15, 18, 23, 30];
  actionIdx.forEach(i => arr[i] = "action");
  quizIdx.forEach(i => arr[i] = "quiz");
  return arr;
})();

/* -----------------------------
   Card data (plain, non-medical)
   ----------------------------- */

// Events (auto-apply)
const EVENT_CARDS = [
  { t: "High UV today",
    m: "The UV Index can be high even when it's not hot. Extra exposure increases risk.",
    d: { SH: -2, EX: +3, SS: +0 } },
  { t: "Cloudy myth",
    m: "Clouds don't block all UV. You stayed out longer than planned.",
    d: { SH: -2, EX: +2, SS: +1 } },
  { t: "Sea breeze break",
    m: "It feels cooler, but UV can still be strong. You take a brief shade break.",
    d: { SH: +1, EX: -1, SS: +1 } },
  { t: "Forgot the ears",
    m: "Ears and neck are easy to miss. Small sunburn patch.",
    d: { SH: -3, EX: +1, SS: +1 } },
  { t: "Midday glare",
    m: "Sun highest in the middle of the day; you push on without a pause.",
    d: { SH: -2, EX: +2, SS: +0 } },
  { t: "Cooler afternoon",
    m: "Later in the day you choose more shade.",
    d: { SH: +1, EX: -2, SS: +1 } },
  { t: "Windy at the beach",
    m: "Breeze hides the burn. You notice and step under a shelter.",
    d: { SH: +1, EX: -1, SS: +1 } },
];

// Actions (player chooses one option)
const ACTION_CARDS = [
  { t: "Reapply or keep playing?",
    m: "You’ve been out a while.",
    choices: [
      { label: "Reapply sunscreen & pause", d: { SH: +2, EX: -1, SS: +2 } },
      { label: "Keep playing now",         d: { SH: -2, EX: +2, SS: +0 } },
    ]},
  { t: "Hat & sunnies?",
    m: "You packed a cap and sunglasses.",
    choices: [
      { label: "Wear both",                d: { SH: +2, EX: -1, SS: +2 } },
      { label: "Skip them",                d: { SH: -2, EX: +2, SS: +0 } },
    ]},
  { t: "Find shade?",
    m: "Noon is coming up fast.",
    choices: [
      { label: "Move to shade",            d: { SH: +1, EX: -2, SS: +1 } },
      { label: "Stay in direct sun",       d: { SH: -2, EX: +2, SS: +0 } },
    ]},
  { t: "Long sleeves?",
    m: "You brought a light long-sleeve shirt.",
    choices: [
      { label: "Put it on",                d: { SH: +2, EX: -2, SS: +1 } },
      { label: "Stay in tee",              d: { SH: -1, EX: +1, SS: +0 } },
    ]},
  { t: "Swim now or prep first?",
    m: "Tempted to jump straight in.",
    choices: [
      { label: "Reapply, then swim",       d: { SH: +2, EX: -1, SS: +2 } },
      { label: "Swim now",                 d: { SH: -2, EX: +2, SS: +0 } },
    ]},
];

// Quiz (single-correct answer; reward SS and EX)
const QUIZ_CARDS = [
  { t: "UV vs. Temperature",
    q: "Is UV Index the same as air temperature?",
    options: [
      { label: "No — UV can be high even when it’s cool.", correct: true,  d: { SH: +0, EX: -1, SS: +2 } },
      { label: "Yes — high UV only when it’s hot.",        correct: false, d: { SH: -1, EX: +1, SS: +0 } },
    ]},
  { t: "Cloud cover",
    q: "Do clouds always block UV?",
    options: [
      { label: "No — UV still gets through.",               correct: true,  d: { SH: +0, EX: -1, SS: +2 } },
      { label: "Yes — clouds stop it completely.",          correct: false, d: { SH: -1, EX: +1, SS: +0 } },
    ]},
  { t: "Reapplication",
    q: "Which is a SunSmart habit during long outdoor time?",
    options: [
      { label: "Reapply sunscreen regularly.",              correct: true,  d: { SH: +1, EX: -1, SS: +2 } },
      { label: "Apply once and forget.",                    correct: false, d: { SH: -1, EX: +1, SS: +0 } },
    ]},
  { t: "Shade",
    q: "Best quick step in strong sun?",
    options: [
      { label: "Find shade where possible.",                correct: true,  d: { SH: +1, EX: -1, SS: +1 } },
      { label: "Ignore shade; breeze feels fine.",          correct: false, d: { SH: -1, EX: +1, SS: +0 } },
    ]},
  { t: "Cover up",
    q: "Clothing for sun protection:",
    options: [
      { label: "Long sleeves/hat help reduce exposure.",    correct: true,  d: { SH: +1, EX: -1, SS: +1 } },
      { label: "Clothing doesn’t matter.",                  correct: false, d: { SH: -1, EX: +1, SS: +0 } },
    ]},
  { t: "Eyes",
    q: "Why wear sunglasses?",
    options: [
      { label: "To protect eyes from UV.",                  correct: true,  d: { SH: +0, EX: -1, SS: +2 } },
      { label: "Only for style.",                           correct: false, d: { SH: -1, EX: +1, SS: +0 } },
    ]},
];

/* -------------
   DOM helpers
   ------------- */
const $ = sel => document.querySelector(sel);

const els = {
  screens: { menu: $("#menu"), play: $("#play") },
  startBtn: $("#startBtn"),
  restartBtn: $("#restartBtn"),
  board: $("#board"),
  rollBtn: $("#rollBtn"),
  rollResult: $("#rollResult"),
  card: $("#card"),
  cardTitle: $("#cardTitle"),
  cardText: $("#cardText"),
  cardActions: $("#cardActions"),
  meterSH: $("#meterSH"), meterSS: $("#meterSS"), meterEX: $("#meterEX"),
  meterSHVal: $("#meterSHVal"), meterSSVal: $("#meterSSVal"), meterEXVal: $("#meterEXVal"),
  modal: $("#resultModal"),
  modalTitle: $("#resultTitle"),
  modalMsg: $("#resultMsg"),
  modalClose: $("#closeModal"),
  sfxDice: $("#sfxDice")
};

/* -------------
   Init & Render
   ------------- */
function clamp(v) { return Math.max(MIN, Math.min(MAX, v)); }
function percent(v){ return Math.round((v / MAX) * 100); }

function initGame(){
  state.pos = 0; state.SH = 20; state.SS = 10; state.EX = 6; state.rollingLocked = false;
  renderBoard();
  renderPawn();
  renderMeters();
  setCard({ title: "Welcome!", text: "Roll to begin your coastal walk. Stay SunSmart!", actions: [] });
  els.rollResult.textContent = "–";
}

function renderBoard(){
  els.board.innerHTML = "";
  for(let i=0;i<SIZE*SIZE;i++){
    const tile = document.createElement("div");
    tile.className = "tile " + (layout[i] || "");
    if(i===0) tile.classList.add("start");
    if(i===LAST) tile.classList.add("finish");
    tile.setAttribute("role","gridcell");
    tile.setAttribute("aria-label", `Tile ${i} ${layout[i]||""}`);
    tile.innerHTML = `<span class="index">${i}</span>`;
    els.board.appendChild(tile);
  }
}

function renderPawn(){
  // remove any existing pawn
  els.board.querySelectorAll(".pawn").forEach(p => p.remove());
  // add pawn to current tile
  const tile = els.board.children[state.pos];
  const pawn = document.createElement("div");
  pawn.className = "pawn";
  pawn.setAttribute("title","You");
  tile.appendChild(pawn);
}

function renderMeters(){
  const { SH, SS, EX } = state;
  els.meterSH.style.width = percent(SH) + "%";
  els.meterSS.style.width = percent(SS) + "%";
  els.meterEX.style.width = percent(EX) + "%";
  els.meterSHVal.textContent = `${SH} / ${MAX}`;
  els.meterSSVal.textContent = `${SS} / ${MAX}`;
  els.meterEXVal.textContent = `${EX} / ${MAX}`;
}

/* -------------
   Cards & UI
   ------------- */
function setCard({ title, text, actions }){
  els.cardTitle.textContent = title;
  els.cardText.textContent = text;
  els.cardActions.innerHTML = "";
  (actions || []).forEach(a => els.cardActions.appendChild(a));
}

function button(label, onClick){
  const b = document.createElement("button");
  b.className = "btn";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

/* -------------
   Rules
   ------------- */
function rollDie(){
  if(state.rollingLocked) return;
  state.rollingLocked = true;
  els.rollBtn.disabled = true;
  const val = Math.floor(Math.random()*6)+1;
  els.rollResult.textContent = String(val);
  try { els.sfxDice && els.sfxDice.play().catch(()=>{}); } catch(e){}
  movePawn(val);
}

function movePawn(steps){
  state.pos = Math.min(state.pos + steps, LAST);
  renderPawn();
  resolveTile();
}

function applyDelta(d){
  state.SH = clamp(state.SH + (d.SH || 0));
  state.SS = clamp(state.SS + (d.SS || 0));
  state.EX = clamp(state.EX + (d.EX || 0));
  renderMeters();
}

function checkEnd(){
  if(state.SH <= 0){
    showResult("Game Over", "Too much exposure — your Skin Health hit zero. Try more shade and reapplication choices next time.");
    return true;
  }
  if(state.pos >= LAST){
    const win = state.SH > 0 && state.SS >= 12 && state.EX <= 20;
    if(win){
      showResult("You Win!", "Nice work! You finished with healthy skin, strong SunSmart habits, and controlled exposure.");
    }else{
      showResult("Almost!", "You reached the finish, but didn’t meet all targets (SH>0, SS≥12, EX≤20). Tweak your choices and try again.");
    }
    return true;
  }
  return false;
}

function showResult(title, msg){
  els.modalTitle.textContent = title;
  els.modalMsg.textContent = msg;
  els.modal.showModal();
  // unlock next round only after closing
}

/* Resolve current tile */
function resolveTile(){
  const type = layout[state.pos];
  if(type === "start"){
    setCard({ title: "Starting Out", text: "It’s a bright day. Make good choices and enjoy!",
      actions: [ button("OK", afterResolve) ] });
    return;
  }
  if(type === "finish"){
    // immediate check end
    afterResolve(); // will call checkEnd
    return;
  }
  if(type === "event"){
    const card = pick(EVENT_CARDS);
    applyDelta(card.d);
    setCard({ title: card.t, text: card.m, actions: [ button("OK", afterResolve) ] });
    return;
  }
  if(type === "action"){
    const card = pick(ACTION_CARDS);
    const actions = card.choices.map(ch =>
      button(ch.label, () => { applyDelta(ch.d); afterResolve(); })
    );
    setCard({ title: card.t, text: card.m, actions });
    return;
  }
  if(type === "quiz"){
    const q = pick(QUIZ_CARDS);
    const actions = q.options.map(opt =>
      button(opt.label, () => { applyDelta(opt.d); afterResolve(); })
    );
    setCard({ title: q.t, text: q.q, actions });
    return;
  }
  // default
  setCard({ title: "Stroll", text: "A calm stretch on the path.", actions: [ button("OK", afterResolve) ] });
}

function afterResolve(){
  if(checkEnd()) return;
  state.rollingLocked = false;
  els.rollBtn.disabled = false;
  els.rollBtn.focus();
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* -------------
   Wiring
   ------------- */
function showPlay(){
  els.screens.menu.classList.add("hidden");
  els.screens.play.classList.remove("hidden");
  initGame();
}

function backToMenu(){
  els.modal.close();
  els.screens.play.classList.add("hidden");
  els.screens.menu.classList.remove("hidden");
  // focus menu button for accessibility
  els.startBtn.focus();
}

els.startBtn.addEventListener("click", showPlay);
els.restartBtn.addEventListener("click", initGame);
els.rollBtn.addEventListener("click", rollDie);
els.modalClose.addEventListener("click", backToMenu);

// Close modal with ESC or click outside -> return to menu
els.modal.addEventListener("cancel", (e)=>{ e.preventDefault(); backToMenu(); });
