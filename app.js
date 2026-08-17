const ZODIACS = [
  { name: "Aquarius", symbol: "♒", purpose: "Hygiene Activities" },
  { name: "Aries", symbol: "♈", purpose: "Working" },
  { name: "Cancer", symbol: "♋", purpose: "Gym Activities" },
  { name: "Capricorn", symbol: "♑", purpose: "Relax & Sleep" },
  { name: "Gemini", symbol: "♊", purpose: "Park Activities" },
  { name: "Leo", symbol: "♌", purpose: "Academy" },
  { name: "Libra", symbol: "♎", purpose: "Purchase Furniture" },
  { name: "Pisces", symbol: "♓", purpose: "Fishing" },
  { name: "Sagittarius", symbol: "♐", purpose: "Quests" },
  { name: "Scorpio", symbol: "♏", purpose: "Movement" },
  { name: "Taurus", symbol: "♉", purpose: "Stress Reduction" },
  { name: "Virgo", symbol: "♍", purpose: "Lottery" }
];

const STORAGE_KEY = "zodiac-sequence-tracker-v1";

const freshState = () => ({
  day: 1,
  started: false,
  sequences: [],
  window: []
});

let state = loadState();

const $ = (id) => document.getElementById(id);
const setupView = $("setupView");
const trackerView = $("trackerView");
const dayBadge = $("dayBadge");
const windowGrid = $("windowGrid");
const zodiacGrid = $("zodiacGrid");
const sequenceList = $("sequenceList");
const hintText = $("hintText");
const setupError = $("setupError");
const confirmDialog = $("confirmDialog");
const initialSelects = [$("initial0"), $("initial1"), $("initial2")];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    return {
      day: Number.isFinite(parsed.day) ? parsed.day : 1,
      started: Boolean(parsed.started),
      sequences: Array.isArray(parsed.sequences) ? parsed.sequences : [],
      window: Array.isArray(parsed.window) ? parsed.window : []
    };
  } catch {
    return freshState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function zodiacByName(name) {
  return ZODIACS.find(z => z.name === name) || null;
}

function currentSequence() {
  if (!state.sequences.length) return null;
  const last = state.sequences[state.sequences.length - 1];
  return last.length === 12 ? null : last;
}

function ensureNextSequence() {
  if (!state.started) return;
  if (currentSequence() === null && state.sequences.length < 5) {
    state.sequences.push([]);
    saveState();
  }
}

function isAvailable(name, seq) {
  if (!seq || seq.includes(name)) return false;
  if (seq.length < 2 && state.sequences.length > 1) {
    const previous = state.sequences[state.sequences.length - 2];
    const blocked = previous.slice(-2);
    if (blocked.includes(name)) return false;
  }
  return true;
}

function populateInitialSelects() {
  initialSelects.forEach((select, index) => {
    select.innerHTML = `<option value="">Select a sign…</option>` +
      ZODIACS.map(z => `<option value="${z.name}">${z.symbol}  ${z.name}</option>`).join("");
    if (!state.started && state.window[index]) select.value = state.window[index];
  });
}

function startInitial() {
  setupError.textContent = "";
  const names = initialSelects.map(s => s.value);
  if (names.some(n => !n)) {
    setupError.textContent = "Please select all three initial signs.";
    return;
  }
  if (new Set(names).size !== 3) {
    setupError.textContent = "Each sign may appear only once in a sequence.";
    return;
  }
  state = {
    started: true,
    day: 1,
    window: [...names],
    sequences: [[...names]]
  };
  saveState();
  render();
}

function addZodiac(name) {
  ensureNextSequence();
  const seq = currentSequence();
  if (!seq) return;
  if (!isAvailable(name, seq)) return;

  seq.push(name);
  state.window.push(name);
  while (state.window.length > 3) state.window.shift();
  state.day += 1;
  saveState();
  ensureNextSequence();
  render();
}

function resetAll() {
  state = freshState();
  saveState();
  populateInitialSelects();
  render();
}

function clearSetup() {
  initialSelects.forEach(s => s.value = "");
  setupError.textContent = "";
}

function renderWindow() {
  windowGrid.innerHTML = state.window.map(name => {
    const z = zodiacByName(name);
    return `<div class="window-item">
      <div>
        <div class="sign-name"><span class="sign-symbol">${z?.symbol ?? ""}</span>${z?.name ?? "Waiting for input"}</div>
        <div class="sign-purpose">${z?.purpose ?? ""}</div>
      </div>
    </div>`;
  }).join("");

  while (windowGrid.children.length < 3) {
    const empty = document.createElement("div");
    empty.className = "window-item";
    empty.innerHTML = `<div><div class="sign-name">Waiting for input</div></div>`;
    windowGrid.appendChild(empty);
  }
}

function renderPicker() {
  ensureNextSequence();
  const seq = currentSequence();
  zodiacGrid.innerHTML = "";

  if (!seq) {
    hintText.textContent = "All five sequences are complete.";
  } else if (seq.length < 2 && state.sequences.length > 1) {
    hintText.textContent = `For the first 2 slots, the previous sequence's last 2 signs are unavailable. Progress: ${seq.length} / 12`;
  } else {
    hintText.textContent = `Select an available sign for the next day. Each sign appears once. Progress: ${seq.length} / 12`;
  }

  for (const z of ZODIACS) {
    const button = document.createElement("button");
    button.className = "zodiac-button";
    button.type = "button";
    const available = seq && isAvailable(z.name, seq);
    button.disabled = !available;
    button.innerHTML = `<div class="sign-name"><span class="sign-symbol">${z.symbol}</span>${z.name}</div><div class="sign-purpose">${z.purpose}</div>`;
    if (available) button.addEventListener("click", () => addZodiac(z.name));
    zodiacGrid.appendChild(button);
  }
}

function renderSequences() {
  sequenceList.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const exists = i < state.sequences.length;
    const seq = exists ? state.sequences[i] : [];
    const item = document.createElement("div");
    item.className = `sequence-item${exists ? "" : " locked"}`;

    let content;
    if (seq.length === 0) {
      content = exists ? "Waiting for the first sign" : "Locked until the previous sequence is complete";
    } else {
      content = seq.map(name => {
        const z = zodiacByName(name);
        return `${z?.symbol ?? ""} ${z?.name ?? name}`;
      }).join("  →  ");
    }

    const complete = seq.length === 12;
    item.innerHTML = `
      <div class="sequence-head">
        <div class="sequence-title">Sequence ${i + 1}</div>
        <div class="sequence-status ${complete ? "complete" : ""}">${complete ? "✓ Complete" : `${seq.length} / 12`}</div>
      </div>
      <div class="sequence-content">${content}</div>`;
    sequenceList.appendChild(item);
  }
}

function render() {
  dayBadge.textContent = `Day ${state.day}`;
  setupView.classList.toggle("hidden", state.started);
  trackerView.classList.toggle("hidden", !state.started);
  if (!state.started) return;
  renderWindow();
  renderPicker();
  renderSequences();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zodiac-sequence-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importBackup(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.sequences) || !Array.isArray(parsed.window)) throw new Error("Invalid backup");
    state = {
      day: Number.isFinite(parsed.day) ? parsed.day : 1,
      started: Boolean(parsed.started),
      sequences: parsed.sequences.slice(0, 5).map(s => Array.isArray(s) ? s.filter(n => zodiacByName(n)).slice(0, 12) : []),
      window: parsed.window.filter(n => zodiacByName(n)).slice(-3)
    };
    saveState();
    populateInitialSelects();
    render();
  } catch {
    alert("That file is not a valid Zodiac Sequence backup.");
  }
}

$("startBtn").addEventListener("click", startInitial);
$("clearSetupBtn").addEventListener("click", clearSetup);
$("resetBtn").addEventListener("click", () => confirmDialog.showModal());
confirmDialog.addEventListener("close", () => {
  if (confirmDialog.returnValue === "confirm") resetAll();
});
$("exportBtn").addEventListener("click", exportBackup);
$("importInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importBackup(file);
  event.target.value = "";
});

populateInitialSelects();
render();
