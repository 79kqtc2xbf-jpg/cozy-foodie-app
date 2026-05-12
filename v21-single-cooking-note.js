function cf21CookingNotes(r) {
  if (!r || !Array.isArray(r.steps)) return [];
  const seen = new Set();
  return r.steps
    .map((st, i) => typeof stepMistake === "function"
      ? stepMistake(st, r, i)
      : "Не пытайся идеально: лучше спокойно и вкусно, чем красиво и с нервным тиком.")
    .map(x => String(x || "").replace(/^⚠️\s*/i, "").trim())
    .filter(Boolean)
    .filter(x => {
      const key = x.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function cf21CookingNoteCard(r) {
  const notes = cf21CookingNotes(r);
  if (!notes.length) return "";
  return `
    <div class="step-card daily-note-card">
      <div class="step-num">💛</div>
      <div>
        <strong>Милое замечание</strong>
        <ul class="recipe-note-list">
          ${notes.map(note => `<li>${note}</li>`).join("")}
        </ul>
      </div>
    </div>`;
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

  const dailyNote = cf21CookingNoteCard(r);

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v21">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${typeof cf17MainStep === "function" ? cf17MainStep(st, r, i) : st}</strong>
        <p>${typeof stepDetail === "function" ? stepDetail(st, r, i) : "Готовь спокойно и пробуй по ходу."}</p>
      </div>
    </div>`).join("");

  const finalCheck = typeof cf17QualityCheck === "function"
    ? `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${cf17QualityCheck(r)}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут. Это не магия, это финальная настройка.</p></div></div>`
    : "";

  return dailyTrick + dailyNote + steps + finalCheck;
}

window.CF21_VERSION = "webstable21-single-cooking-note";
if (document && document.body) document.body.dataset.cozyVersion = window.CF21_VERSION;
console.info("Cozy Foodie v21 loaded: single cooking note card");
