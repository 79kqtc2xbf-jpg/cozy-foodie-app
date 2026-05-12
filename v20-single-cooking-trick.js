function cf20DailyTrickText(r) {
  let raw = "держи огонь умеренным, пробуй по ходу и не пытайся выиграть кулинарную олимпиаду в обычный вторник.";
  if (typeof cf16Trick === "function") raw = cf16Trick("", r, 0);
  return String(raw || "")
    .replace(/^Хитрость для «[^»]+»:\s*/i, "")
    .replace(/^Хитрость:\s*/i, "")
    .trim();
}

function renderDetailedSteps(r) {
  const dailyTrick = `
    <div class="step-card daily-trick-card">
      <div class="step-num">✨</div>
      <div>
        <strong>Хитрость дня</strong>
        <p>${cf20DailyTrickText(r)}</p>
      </div>
    </div>`;

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v20">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${typeof cf17MainStep === "function" ? cf17MainStep(st, r, i) : st}</strong>
        <p>${typeof stepDetail === "function" ? stepDetail(st, r, i) : "Готовь спокойно и пробуй по ходу."}</p>
        <div class="mistake">⚠️ ${typeof stepMistake === "function" ? stepMistake(st, r, i) : "Милое замечание: не пытайся идеально, делай вкусно."}</div>
      </div>
    </div>`).join("");

  const finalCheck = typeof cf17QualityCheck === "function"
    ? `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${cf17QualityCheck(r)}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут. Это не магия, это финальная настройка.</p></div></div>`
    : "";

  return dailyTrick + steps + finalCheck;
}

window.CF20_VERSION = "webstable20-single-cooking-trick";
if (document && document.body) document.body.dataset.cozyVersion = window.CF20_VERSION;
console.info("Cozy Foodie v20 loaded: single cooking trick at top");
