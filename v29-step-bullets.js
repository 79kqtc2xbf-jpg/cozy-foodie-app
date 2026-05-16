const CF29_VERSION = "webstable29-step-bullets";

function cf29Hay(r) {
  return typeof recipeHay === "function" ? recipeHay(r) : [r?.title, ...(r?.category || []), ...(r?.ingredients || []), ...(r?.steps || [])].join(" ").toLowerCase();
}

function cf29CleanText(text, r) {
  const raw = typeof cf27CleanText === "function" ? cf27CleanText(text, r) : String(text || "");
  return raw
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .trim();
}

function cf29SplitSentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map(x => x.trim())
    .filter(Boolean)
    .filter(x => x.length > 3);
}

function cf29TrimSentence(s, max = 150) {
  const clean = String(s || "").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const last = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf(","));
  return (last > 70 ? cut.slice(0, last) : cut).trim() + "…";
}

function cf29StepBullets(st, r, i) {
  const title = cf29CleanText(typeof cf24StepTitle === "function" ? cf24StepTitle(st, r, i) : st, r);
  const detail = cf29CleanText(typeof cf24StepDetail === "function" ? cf24StepDetail(st, r, i) : "Готовь спокойно и пробуй по ходу.", r);
  const hay = cf29Hay(r);
  const all = cf29SplitSentences(`${title}. ${detail}`);

  const action = all[0] || title || "Сделай этот шаг спокойно.";
  let timing = all.find(x => /\d+|мин|сек|огонь|\/9|до мягкости|до румяности|под крышкой|кипени|вари|жарь|туши|прогрей/i.test(x));
  let nuance = all.find(x => x !== action && x !== timing && /не |если |чтобы|лучше|важно|следи|иначе|дай|аккуратно|средн|умерен|крыш/i.test(x));

  if (!timing) {
    if (hay.includes("сырник") || hay.includes("слад")) timing = "Держи средний огонь: так снаружи будет румяно, а внутри успеет приготовиться.";
    else if (hay.includes("суп")) timing = "Готовь на мягком кипении, без бурного вулкана в кастрюле.";
    else if (hay.includes("паста") || hay.includes("макарон")) timing = "Снимай чуть раньше полной готовности, если дальше будет соус.";
    else if (hay.includes("куриц")) timing = "Готовь до готовности внутри, но не пересушивай дольше нужного.";
    else timing = "Огонь держи средний и проверяй готовность по текстуре.";
  }

  if (!nuance) {
    if (hay.includes("сырник") || hay.includes("творог")) nuance = "Если масса влажная, добавляй муку постепенно — не превращай всё в кирпич.";
    else if (hay.includes("суп")) nuance = "Соль доводи в конце: так проще попасть во вкус.";
    else if (hay.includes("карто")) nuance = "Кусочки похожего размера готовятся ровнее и без сырой философии.";
    else if (hay.includes("яйц") || hay.includes("омлет")) nuance = "Яйца не любят максимальный огонь: так они быстро становятся резиновыми.";
    else nuance = "Не спеши: маленькие правки по ходу обычно спасают блюдо.";
  }

  return [
    { label: "Что сделать", text: cf29TrimSentence(action) },
    { label: "Огонь и время", text: cf29TrimSentence(timing) },
    { label: "Нюанс", text: cf29TrimSentence(nuance) }
  ];
}

function cf29RecipeNotes(r) {
  if (typeof cf27RecipeNotes === "function") return cf27RecipeNotes(r);
  return [
    "Держи средний огонь: почти всё вкуснее мягкого нагрева, чем кухонного вулкана.",
    "Пробуй по ходу — соль, вода и ещё пара минут часто спасают блюдо без паники."
  ];
}

function cf29EndingComment(r) {
  if (typeof cf27EndingComment === "function") return cf27EndingComment(r);
  if (typeof cf26EndingComment === "function") return cf26EndingComment(r);
  return "Готово. Ты молодец: еда случилась, кухня выжила, Лиса одобряет.";
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf29CleanText(trickText, r);
  const notes = cf29RecipeNotes(r);
  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf29CleanText(cf17QualityCheck(r), r)
    : "Финальный фокус: попробуй маленький кусочек и доведи соль, огонь и текстуру до состояния “да, это можно есть”.";

  const prepNotes = `
    <section class="cf27-prep-notes cf29-prep-notes">
      <h3>Перед готовкой</h3>
      <div class="step-card daily-trick-card cf27-note-card">
        <div class="step-num">✨</div>
        <div><strong>Хитрость дня</strong><p>${cleanTrick}</p></div>
      </div>
      <div class="step-card daily-note-card cf27-note-card">
        <div class="step-num">💛</div>
        <div>
          <strong>Милое замечание</strong>
          <ul class="cf27-note-list cf29-note-list">
            ${notes.map(note => `<li>${note}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
    <div class="cf26-section-divider cf27-section-divider"></div>`;

  const steps = (r.steps || []).map((st, i) => {
    const title = cf29CleanText(typeof cf24StepTitle === "function" ? cf24StepTitle(st, r, i) : st, r);
    const bullets = cf29StepBullets(st, r, i);
    return `
      <div class="step-card step-card-v29">
        <div class="step-num">${i + 1}</div>
        <div>
          <strong>${title}</strong>
          <ul class="cf29-step-list">
            ${bullets.map(b => `<li><span>${b.label}:</span> ${b.text}</li>`).join("")}
          </ul>
        </div>
      </div>`;
  }).join("");

  const final = `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
  const ending = `<div class="cf25-ending-comment cf26-ending-comment cf27-ending-comment">🦊 ${cf29EndingComment(r)}</div>`;
  return prepNotes + steps + final + ending;
}
window.renderDetailedSteps = renderDetailedSteps;

function cf29InjectStyles() {
  if (document.getElementById("cf29-style")) return;
  const style = document.createElement("style");
  style.id = "cf29-style";
  style.textContent = `
    .step-card-v29 {
      align-items: flex-start !important;
    }
    .step-card-v29 > div:last-child > p {
      display: none !important;
    }
    .cf29-step-list {
      margin: 12px 0 0 !important;
      padding-left: 0 !important;
      list-style: none !important;
      display: grid !important;
      gap: 10px !important;
    }
    .cf29-step-list li {
      position: relative;
      padding-left: 20px !important;
      font-size: 15.5px !important;
      line-height: 1.42 !important;
      font-weight: 500 !important;
      opacity: .92;
    }
    .cf29-step-list li::before {
      content: "•";
      position: absolute;
      left: 4px;
      top: 0;
      color: #ffe08a;
      font-size: 20px;
      line-height: 1.05;
    }
    .cf29-step-list li span {
      font-weight: 900 !important;
      color: #fff5cc;
    }
    .step-card-v29 strong {
      display: block;
      font-size: 19px !important;
      line-height: 1.25 !important;
      margin-bottom: 2px;
    }
    .cf29-note-list {
      display: grid !important;
      gap: 10px !important;
    }
  `;
  document.head.appendChild(style);
}

(function applyV29StepBullets(){
  if (window.CF29_STEP_BULLETS_APPLIED) return;
  window.CF29_STEP_BULLETS_APPLIED = true;
  window.CF29_VERSION = CF29_VERSION;
  cf29InjectStyles();
  if (document && document.body) document.body.dataset.cozyVersion = CF29_VERSION;
  console.info("Cozy Foodie v29 loaded: step bullets");
})();
