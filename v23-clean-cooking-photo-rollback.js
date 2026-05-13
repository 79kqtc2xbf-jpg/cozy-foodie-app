const CF23_VERSION = "webstable23-clean-cooking-photo-rollback";

function cf23CleanText(text) {
  return String(text || "")
    .replace(/^⚠️\s*/i, "")
    .replace(/^Ошибочка в «[^»]+»:\s*/i, "")
    .replace(/^Милое замечание для «[^»]+»:\s*/i, "")
    .replace(/^Ошибка:\s*/i, "")
    .replace(/^Ошибочка:\s*/i, "")
    .replace(/^Милое замечание:\s*/i, "")
    .trim();
}

function cf23RecipeNote(r) {
  const fallback = "Не пытайся готовить идеально: держи средний огонь, пробуй по ходу и спасай блюдо маленькими правками — соль, вода, крышка, ещё минута.";
  if (!r || !Array.isArray(r.steps) || typeof stepMistake !== "function") return fallback;

  const notes = [];
  const seen = new Set();
  for (let i = 0; i < r.steps.length; i++) {
    const clean = cf23CleanText(stepMistake(r.steps[i], r, i));
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      notes.push(clean);
    }
    if (notes.length >= 3) break;
  }
  return notes.length ? notes.join(" ") : fallback;
}

function renderTimerButtons(r) {
  const classic = [1, 3, 5, 10, 15, 20];
  return `
    <details class="timer-compact-box">
      <summary>⏲️ Быстрые таймеры</summary>
      <div class="timer-chip-row timer-chip-row-compact">
        ${classic.map(m => `<button class="timer-chip ghost" onclick="setTimer(${m},true)">${m} мин</button>`).join("")}
      </div>
    </details>`;
}

function renderDetailedSteps(r) {
  const dailyTrick = `
    <div class="step-card daily-trick-card">
      <div class="step-num">✨</div>
      <div>
        <strong>Хитрость дня</strong>
        <p>${typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу."}</p>
      </div>
    </div>`;

  const dailyNote = `
    <div class="step-card daily-note-card">
      <div class="step-num">💛</div>
      <div>
        <strong>Милое замечание</strong>
        <p>${cf23RecipeNote(r)}</p>
      </div>
    </div>`;

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v23">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${typeof cf17MainStep === "function" ? cf17MainStep(st, r, i) : st}</strong>
        <p>${typeof stepDetail === "function" ? stepDetail(st, r, i) : "Готовь спокойно и пробуй по ходу."}</p>
      </div>
    </div>`).join("");

  const finalCheck = typeof cf17QualityCheck === "function"
    ? `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${cf17QualityCheck(r)}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`
    : "";

  return dailyTrick + dailyNote + steps + finalCheck;
}

function cf23RollbackBadStockPhotos() {
  const badIds = new Set(["v15_001", "v15_002", "v15_003", "v15_005", "v15_006", "v15_007", "v15_008", "v15_010", "v15_011"]);
  if (!Array.isArray(recipes)) return;
  recipes = recipes.map(r => badIds.has(r.id) ? { ...r, image: makeImg(r.emoji || "🍽️"), photoStatus: "rolled_back_v23" } : r);
  allRecipes = [...recipes, ...(typeof getUserRecipes === "function" ? getUserRecipes() : [])];
  if (typeof renderAll === "function") renderAll();
  if (typeof updateFloatingRandom === "function") updateFloatingRandom();
}

function cf23InjectStyles() {
  if (document.getElementById("cf23-clean-style")) return;
  const style = document.createElement("style");
  style.id = "cf23-clean-style";
  style.textContent = `
    .timer-box { margin-bottom: 10px; }
    .timer-presets { display: none !important; }
    .timer-compact-box {
      margin: 10px 0 14px;
      padding: 10px 12px;
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 18px;
      background: rgba(255,255,255,.045);
    }
    .timer-compact-box summary {
      cursor: pointer;
      font-weight: 800;
      opacity: .95;
    }
    .timer-chip-row-compact {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .timer-chip-row-compact .timer-chip {
      padding: 8px 10px;
      border-radius: 999px;
      font-size: 13px;
    }
    .daily-note-card .recipe-note-list { display: none !important; }
    .step-card-v23 .mistake,
    .step-card-v23 .trick { display: none !important; }
  `;
  document.head.appendChild(style);
}

(function applyV23CleanCookingPhotoRollback(){
  if (window.CF23_CLEAN_COOKING_PHOTO_ROLLBACK_APPLIED) return;
  window.CF23_CLEAN_COOKING_PHOTO_ROLLBACK_APPLIED = true;
  window.CF23_VERSION = CF23_VERSION;
  cf23InjectStyles();
  cf23RollbackBadStockPhotos();
  if (document && document.body) document.body.dataset.cozyVersion = CF23_VERSION;
  console.info("Cozy Foodie v23 loaded: photo rollback, clean notes, compact timer");
})();
