const CF30_VERSION = "webstable30-clean-step-cards";

function cf30Hay(r) {
  return typeof recipeHay === "function" ? recipeHay(r) : [r?.title, ...(r?.category || []), ...(r?.ingredients || []), ...(r?.steps || [])].join(" ").toLowerCase();
}

function cf30CleanText(text, r) {
  const raw = typeof cf29CleanText === "function" ? cf29CleanText(text, r) : String(text || "");
  return raw
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .replace(/^Соусный этап:\s*/i, "")
    .replace(/^Сборка вкуса:\s*/i, "")
    .replace(/^Финальный фокус:\s*/i, "")
    .trim();
}

function cf30StepName(st, r, i) {
  const text = cf30CleanText(st, r).toLowerCase();
  const hay = cf30Hay(r);

  if (text.includes("творог") || text.includes("разомни") || text.includes("смешай мягкий")) return "Подготовь основу";
  if (text.includes("яйц") || text.includes("сахар") || text.includes("соль") || text.includes("мук")) return "Собери массу";
  if (text.includes("сформ") || text.includes("слеп")) return "Сформируй";
  if (text.includes("жар")) return "Обжарь";
  if (text.includes("вари") || text.includes("варить") || text.includes("кип")) return "Вари";
  if (text.includes("туш")) return "Туши";
  if (text.includes("нареж")) return "Нарежь";
  if (text.includes("соус") || text.includes("слив") || text.includes("сыр")) return "Сделай соус";
  if (text.includes("пода")) return "Подавай";
  if (text.includes("дай") || text.includes("посто")) return "Дай постоять";

  if (hay.includes("суп")) return i === 0 ? "Свари основу" : i === 1 ? "Добавь ингредиенты" : "Доведи до вкуса";
  if (hay.includes("сырник") || hay.includes("творог")) return ["Подготовь творог", "Собери массу", "Сформируй", "Обжарь", "Подавай"][i] || `Шаг ${i + 1}`;
  if (hay.includes("паста") || hay.includes("макарон")) return ["Свари пасту", "Сделай соус", "Смешай", "Доведи до вкуса"][i] || `Шаг ${i + 1}`;
  if (hay.includes("карто")) return ["Подготовь картошку", "Обжарь", "Доведи до мягкости", "Подавай"][i] || `Шаг ${i + 1}`;
  if (hay.includes("куриц")) return ["Подготовь курицу", "Обжарь", "Добавь соус", "Доведи до готовности"][i] || `Шаг ${i + 1}`;

  return `Шаг ${i + 1}`;
}

function cf30Sentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map(x => x.trim())
    .filter(Boolean)
    .filter(x => x.length > 4);
}

function cf30Short(s, max = 118) {
  const clean = String(s || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > 55 ? cut.slice(0, last) : cut).trim() + "…";
}

function cf30StepBullets(st, r, i) {
  const rawStep = cf30CleanText(st, r);
  const detail = cf30CleanText(typeof cf24StepDetail === "function" ? cf24StepDetail(st, r, i) : "", r);
  const hay = cf30Hay(r);
  const parts = cf30Sentences(`${rawStep}. ${detail}`);

  let action = parts[0] || rawStep || "Сделай этот шаг спокойно.";
  let timing = parts.find(x => x !== action && /\d+|мин|сек|огонь|\/9|средн|умерен|кип|жарь|вари|туши|прогрей|крышк|румян|мягк/i.test(x));
  let nuance = parts.find(x => x !== action && x !== timing && /если|чтобы|лучше|важно|иначе|следи|не |аккуратно|постепенно|снаружи|внутри/i.test(x));

  if (!timing) {
    if (hay.includes("сырник") || hay.includes("творог") || hay.includes("слад")) timing = "Средний огонь, без активного кипения и кухонного вулкана.";
    else if (hay.includes("суп")) timing = "Мягкое кипение: суп должен спокойно готовиться, а не бурлить.";
    else if (hay.includes("паста") || hay.includes("макарон")) timing = "Готовь чуть меньше, если потом смешиваешь с соусом.";
    else if (hay.includes("куриц")) timing = "Доведи до готовности внутри, но не пересушивай.";
    else timing = "Огонь держи средний и проверяй готовность по текстуре.";
  }

  if (!nuance) {
    if (hay.includes("сырник") || hay.includes("творог")) nuance = "Если масса влажная, добавляй муку постепенно.";
    else if (hay.includes("суп")) nuance = "Соль лучше довести в конце, когда вкус уже собрался.";
    else if (hay.includes("карто")) nuance = "Похожие кусочки готовятся ровнее.";
    else if (hay.includes("яйц") || hay.includes("омлет")) nuance = "Максимальный огонь делает яйца резиновыми.";
    else nuance = "Не спеши: маленькие правки по ходу спасают блюдо.";
  }

  return [
    { label: "Что сделать", text: cf30Short(action) },
    { label: "Огонь и время", text: cf30Short(timing) },
    { label: "Нюанс", text: cf30Short(nuance) }
  ];
}

function cf30RecipeNotes(r) {
  if (typeof cf27RecipeNotes === "function") return cf27RecipeNotes(r);
  if (typeof cf29RecipeNotes === "function") return cf29RecipeNotes(r);
  return ["Держи средний огонь.", "Пробуй по ходу и спокойно правь вкус."];
}

function cf30EndingComment(r) {
  if (typeof cf29EndingComment === "function") return cf29EndingComment(r);
  if (typeof cf27EndingComment === "function") return cf27EndingComment(r);
  return "Готово. Ты молодец: еда случилась, кухня выжила, Лиса одобряет.";
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf30CleanText(trickText, r);
  const notes = cf30RecipeNotes(r);
  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf30CleanText(cf17QualityCheck(r), r)
    : "Финальный фокус: попробуй маленький кусочек и доведи соль, огонь и текстуру до состояния “да, это можно есть”.";

  const prepNotes = `
    <section class="cf27-prep-notes cf29-prep-notes cf30-prep-notes">
      <h3>Перед готовкой</h3>
      <div class="step-card daily-trick-card cf27-note-card">
        <div class="step-num">✨</div>
        <div><strong>Хитрость дня</strong><p>${cleanTrick}</p></div>
      </div>
      <div class="step-card daily-note-card cf27-note-card">
        <div class="step-num">💛</div>
        <div>
          <strong>Милое замечание</strong>
          <ul class="cf27-note-list cf29-note-list cf30-note-list">
            ${notes.map(note => `<li>${note}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
    <div class="cf26-section-divider cf27-section-divider"></div>`;

  const steps = (r.steps || []).map((st, i) => {
    const bullets = cf30StepBullets(st, r, i);
    return `
      <div class="step-card step-card-v30">
        <div class="step-num">${i + 1}</div>
        <div>
          <strong>${cf30StepName(st, r, i)}</strong>
          <ul class="cf29-step-list cf30-step-list">
            ${bullets.map(b => `<li><span>${b.label}:</span> ${b.text}</li>`).join("")}
          </ul>
        </div>
      </div>`;
  }).join("");

  const final = `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
  const ending = `<div class="cf25-ending-comment cf26-ending-comment cf27-ending-comment">🦊 ${cf30EndingComment(r)}</div>`;
  return prepNotes + steps + final + ending;
}
window.renderDetailedSteps = renderDetailedSteps;

function cf30InjectStyles() {
  if (document.getElementById("cf30-style")) return;
  const style = document.createElement("style");
  style.id = "cf30-style";
  style.textContent = `
    .step-card-v30 {
      align-items: flex-start !important;
    }
    .step-card-v30 > div:last-child > p,
    .step-card-v30 p:not(.keep) {
      display: none !important;
    }
    .step-card-v30 strong {
      display: block !important;
      font-size: 21px !important;
      line-height: 1.18 !important;
      margin-bottom: 8px !important;
    }
    .cf30-step-list {
      margin: 0 !important;
      padding-left: 0 !important;
      list-style: none !important;
      display: grid !important;
      gap: 9px !important;
    }
    .cf30-step-list li {
      position: relative;
      padding-left: 20px !important;
      font-size: 15.5px !important;
      line-height: 1.42 !important;
      font-weight: 500 !important;
      opacity: .92 !important;
    }
    .cf30-step-list li::before {
      content: "•";
      position: absolute;
      left: 4px;
      top: 0;
      color: #ffe08a;
      font-size: 20px;
      line-height: 1.05;
    }
    .cf30-step-list li span {
      font-weight: 900 !important;
      color: #fff5cc !important;
    }
  `;
  document.head.appendChild(style);
}

(function applyV30CleanStepCards(){
  if (window.CF30_CLEAN_STEP_CARDS_APPLIED) return;
  window.CF30_CLEAN_STEP_CARDS_APPLIED = true;
  window.CF30_VERSION = CF30_VERSION;
  cf30InjectStyles();
  if (document && document.body) document.body.dataset.cozyVersion = CF30_VERSION;
  console.info("Cozy Foodie v30 loaded: clean step cards without duplicate prose");
})();
