const CF31_VERSION = "webstable31-smart-step-bullets";

function cf31Hay(r) {
  return typeof recipeHay === "function" ? recipeHay(r) : [r?.title, ...(r?.category || []), ...(r?.ingredients || []), ...(r?.steps || [])].join(" ").toLowerCase();
}

function cf31CleanText(text, r) {
  const raw = typeof cf30CleanText === "function" ? cf30CleanText(text, r) : String(text || "");
  return raw
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .replace(/^Соусный этап:\s*/i, "")
    .replace(/^Сборка вкуса:\s*/i, "")
    .replace(/^Финальный фокус:\s*/i, "")
    .trim();
}

function cf31Sentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map(x => x.trim())
    .filter(Boolean)
    .filter(x => x.length > 4);
}

function cf31Short(text, max = 115) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > 55 ? cut.slice(0, last) : cut).trim() + "…";
}

function cf31HasExactTiming(text) {
  return /\b\d+\s*(мин|минут|сек|секунд|час|часа)\b|\b\d+\s*[–-]\s*\d+\s*(мин|минут|сек|секунд)\b|\b\d+\s*\/\s*9\b/i.test(String(text || ""));
}

function cf31HasHeat(text) {
  return /\b\d+\s*\/\s*9\b|слаб(ый|ом)|средн(ий|ем)|умерен(ный|ном)|сильн(ый|ом)|максимальн(ый|ом)|минимальн(ый|ом)|без активного кипения|мягкое кипение/i.test(String(text || ""));
}

function cf31ExtractTiming(parts) {
  const exact = parts.find(x => cf31HasExactTiming(x) || cf31HasHeat(x));
  if (!exact) return null;
  let out = exact;
  const minute = out.match(/\d+\s*[–-]?\s*\d*\s*(мин|минут|сек|секунд|час|часа)/i);
  const heat = out.match(/\d+\s*\/\s*9|слаб(ый|ом)|средн(ий|ем)|умерен(ный|ном)|сильн(ый|ом)|максимальн(ый|ом)|минимальн(ый|ом)|без активного кипения|мягкое кипение/i);
  if (minute && heat) return `${minute[0]}, ${heat[0]}.`;
  if (minute) return minute[0].endsWith(".") ? minute[0] : `${minute[0]}.`;
  if (heat) return heat[0].endsWith(".") ? heat[0] : `${heat[0]}.`;
  return cf31Short(out, 90);
}

function cf31StepName(st, r, i) {
  const hay = cf31Hay(r);
  const text = cf31CleanText(st, r).toLowerCase();

  const syrnikiNames = ["Подготовь творог", "Смешай основу", "Добавь муку", "Сформируй сырники", "Обжарь", "Подавай"];
  const soupNames = ["Свари основу", "Добавь овощи", "Добавь лапшу", "Доведи до вкуса", "Подавай"];
  const pastaNames = ["Свари пасту", "Подготовь соус", "Соедини", "Доведи до вкуса", "Подавай"];
  const chickenNames = ["Подготовь курицу", "Обжарь", "Добавь соус", "Доведи до готовности", "Подавай"];
  const potatoNames = ["Подготовь картошку", "Обжарь", "Доведи до мягкости", "Добавь вкус", "Подавай"];
  const eggNames = ["Подготовь основу", "Разогрей сковороду", "Готовь яйца", "Добавь начинку", "Подавай"];

  if (hay.includes("сырник") || hay.includes("творог")) return syrnikiNames[i] || `Шаг ${i + 1}`;
  if (hay.includes("суп") || hay.includes("бульон")) return soupNames[i] || `Шаг ${i + 1}`;
  if (hay.includes("паста") || hay.includes("макарон")) return pastaNames[i] || `Шаг ${i + 1}`;
  if (hay.includes("куриц")) return chickenNames[i] || `Шаг ${i + 1}`;
  if (hay.includes("карто")) return potatoNames[i] || `Шаг ${i + 1}`;
  if (hay.includes("яйц") || hay.includes("омлет") || hay.includes("шакш")) return eggNames[i] || `Шаг ${i + 1}`;

  if (text.includes("нареж")) return "Нарежь";
  if (text.includes("смеш")) return "Смешай";
  if (text.includes("жар")) return "Обжарь";
  if (text.includes("вари")) return "Вари";
  if (text.includes("туш")) return "Туши";
  if (text.includes("пода")) return "Подавай";
  return `Шаг ${i + 1}`;
}

function cf31UsefulNote(st, r, i, parts, timing) {
  const hay = cf31Hay(r);
  const action = parts[0] || cf31CleanText(st, r);
  let note = parts.find(x => x !== action && x !== timing && /если|чтобы|лучше|важно|иначе|следи|не |аккуратно|постепенно|снаружи|внутри|мягк|сочн/i.test(x));
  if (note) return cf31Short(note, 115);

  if (hay.includes("сырник") || hay.includes("творог")) {
    if (i === 0) return "Если творог влажный, слегка отожми его или добавляй муку частями.";
    if (i === 1) return "Не взбивай слишком активно: сырникам нужна нежность, а не фитнес-тренировка.";
    if (i === 2) return "Муку добавляй постепенно: масса должна лепиться, но оставаться мягкой.";
    if (i === 3) return "Лепи влажными руками, так масса меньше липнет.";
    if (i === 4) return "Не делай максимальный огонь: снаружи потемнеют, внутри останутся сырыми.";
  }
  if (hay.includes("суп")) return "Соль лучше довести в конце, когда бульон уже собрал вкус.";
  if (hay.includes("паста") || hay.includes("макарон")) return "Оставь немного воды от пасты: она поможет соусу стать гладким.";
  if (hay.includes("куриц")) return "Кусочки похожего размера готовятся ровнее.";
  if (hay.includes("карто")) return "Чем суше картошка перед жаркой, тем лучше корочка.";
  return "Полезная пометка: делай спокойно и проверяй текстуру по ходу.";
}

function cf31StepBullets(st, r, i) {
  const rawStep = cf31CleanText(st, r);
  const detail = cf31CleanText(typeof cf24StepDetail === "function" ? cf24StepDetail(st, r, i) : "", r);
  const parts = cf31Sentences(`${rawStep}. ${detail}`);
  const action = parts[0] || rawStep || "Сделай этот шаг спокойно.";
  const timing = cf31ExtractTiming(parts);
  const note = cf31UsefulNote(st, r, i, parts, timing);

  const bullets = [{ label: "Что сделать", text: cf31Short(action, 120) }];
  if (timing) bullets.push({ label: "Огонь и время", text: cf31Short(timing, 95) });
  else bullets.push({ label: "Полезная пометка", text: cf31Short(note, 115) });

  if (timing && note) bullets.push({ label: "Нюанс", text: cf31Short(note, 115) });
  return bullets;
}

function cf31RecipeNotes(r) {
  if (typeof cf27RecipeNotes === "function") return cf27RecipeNotes(r);
  return ["Держи средний огонь.", "Пробуй по ходу и спокойно правь вкус."];
}

function cf31EndingComment(r) {
  if (typeof cf29EndingComment === "function") return cf29EndingComment(r);
  if (typeof cf27EndingComment === "function") return cf27EndingComment(r);
  return "Готово. Ты молодец: еда случилась, кухня выжила, Лиса одобряет.";
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf31CleanText(trickText, r);
  const notes = cf31RecipeNotes(r);
  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf31CleanText(cf17QualityCheck(r), r)
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
    const bullets = cf31StepBullets(st, r, i);
    return `
      <div class="step-card step-card-v30 step-card-v31">
        <div class="step-num">${i + 1}</div>
        <div>
          <strong>${cf31StepName(st, r, i)}</strong>
          <ul class="cf29-step-list cf30-step-list cf31-step-list">
            ${bullets.map(b => `<li><span>${b.label}:</span> ${b.text}</li>`).join("")}
          </ul>
        </div>
      </div>`;
  }).join("");

  const final = `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
  const ending = `<div class="cf25-ending-comment cf26-ending-comment cf27-ending-comment">🦊 ${cf31EndingComment(r)}</div>`;
  return prepNotes + steps + final + ending;
}
window.renderDetailedSteps = renderDetailedSteps;

function cf31InjectStyles() {
  if (document.getElementById("cf31-style")) return;
  const style = document.createElement("style");
  style.id = "cf31-style";
  style.textContent = `
    .step-card-v31 strong {
      font-size: 21px !important;
      line-height: 1.18 !important;
      margin-bottom: 8px !important;
    }
    .cf31-step-list {
      gap: 9px !important;
    }
    .cf31-step-list li span {
      color: #fff5cc !important;
      font-weight: 900 !important;
    }
  `;
  document.head.appendChild(style);
}

(function applyV31SmartStepBullets(){
  if (window.CF31_SMART_STEP_BULLETS_APPLIED) return;
  window.CF31_SMART_STEP_BULLETS_APPLIED = true;
  window.CF31_VERSION = CF31_VERSION;
  cf31InjectStyles();
  if (document && document.body) document.body.dataset.cozyVersion = CF31_VERSION;
  console.info("Cozy Foodie v31 loaded: smart step bullets");
})();
