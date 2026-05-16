const CF27_VERSION = "webstable27-logical-recipe-notes";

function cf27Hay(r) {
  return typeof recipeHay === "function" ? recipeHay(r) : [r?.title, ...(r?.category || []), ...(r?.ingredients || []), ...(r?.steps || [])].join(" ").toLowerCase();
}

function cf27RecipeType(r) {
  const hay = cf27Hay(r);
  if (hay.includes("суп") || hay.includes("бульон")) return "soup";
  if (hay.includes("паста") || hay.includes("макарон")) return "pasta";
  if (hay.includes("карто") || hay.includes("драник") || hay.includes("пюре")) return "potato";
  if (hay.includes("куриц")) return "chicken";
  if (hay.includes("сырник") || hay.includes("десерт") || hay.includes("слад") || hay.includes("творог") || hay.includes("ягод")) return "sweet";
  if (hay.includes("яйц") || hay.includes("омлет") || hay.includes("шакш")) return "eggs";
  if (hay.includes("рис") || hay.includes("греч") || hay.includes("булгур") || hay.includes("каша")) return "grains";
  if (hay.includes("лаваш") || hay.includes("тост") || hay.includes("wrap")) return "wrap";
  if (hay.includes("салат") || hay.includes("огур") || hay.includes("зелень")) return "salad";
  if (hay.includes("пельмен")) return "dumplings";
  return "general";
}

function cf27RecipeNotes(r) {
  const type = cf27RecipeType(r);
  const notes = {
    soup: [
      "Кипение должно быть мягким: супу не нужен вулкан, ему нужно спокойно набрать вкус.",
      "Соль лучше доводить в конце, когда бульон уже собрался и стало понятно, чего ему не хватает.",
      "После выключения дай супу постоять 5 минут — он станет вкуснее без твоего участия."
    ],
    pasta: [
      "Пасту лучше снять чуть раньше готовности: она дойдёт в соусе и не станет грустной кашей.",
      "Оставь пару ложек воды от пасты — она помогает соусу стать гладким и цепляться за макароны.",
      "Сыр и сливки любят умеренный огонь, а не кипящий драмкружок."
    ],
    potato: [
      "Картошку для жарки лучше обсушить: меньше влаги — больше шансов на красивую корочку.",
      "Соль добавляй ближе к концу, чтобы картошка не начала разваливаться раньше времени.",
      "Кусочки делай похожего размера: так они приготовятся вместе, а не каждый со своей судьбой."
    ],
    chicken: [
      "Курицу не мучай вечной жаркой: как только готова внутри, дай ей пару минут отдохнуть.",
      "Если кусочки одинакового размера, они готовятся ровно и без сюрпризов с сырой серединой.",
      "Сливки и соусы добавляй после румяности, чтобы курица не варилась вместо жарки."
    ],
    sweet: [
      "В сладком щепотка соли усиливает вкус — это маленькая магия, а не ошибка.",
      "Если творог влажный, добавляй муку постепенно: тесто должно держаться, но не стать кирпичом.",
      "Ягоды и мёд лучше добавлять в конце, чтобы десерт выглядел свежо и не поплыл."
    ],
    eggs: [
      "Яйца любят средний огонь: на максимуме они быстро становятся резиновыми и начинают мстить.",
      "Крышка помогает омлету дойти мягко, без пересушенного низа.",
      "Сыр добавляй ближе к концу, чтобы он расплавился, а не ушёл в странную корку."
    ],
    grains: [
      "Крупу лучше промыть: так вкус чище, а текстура спокойнее.",
      "После готовки дай крупе постоять под крышкой 3–5 минут — она станет мягче и собраннее.",
      "Сливки, масло или соус добавляй на умеренном огне, чтобы вкус распределился равномерно."
    ],
    wrap: [
      "Начинку не клади слишком мокрой: лаваш любит сочность, но не любит превращаться в салфетку.",
      "Сначала клади швом вниз — так рулет закрепится и не раскроется на самом интересном месте.",
      "Сыр внутри горячий: дай лавашу минуту остыть, язык нам ещё нужен."
    ],
    salad: [
      "Сухарики и хрустящие добавки клади в самом конце, чтобы они не стали мокрой грустью.",
      "Заправку добавляй постепенно: салат должен быть сочным, а не плавать в соусе.",
      "Соль проверяй после сыра или соуса — они уже могут быть солёными."
    ],
    dumplings: [
      "Пельмени после всплытия не надо варить вечно: им нужно дойти, а не раствориться в судьбе.",
      "Сливочный соус держи на слабом огне, чтобы он остался гладким.",
      "Перемешивай аккуратно: пельмени нежные, хоть и делают вид, что всё выдержат."
    ],
    general: [
      "Держи средний огонь: почти всё вкуснее мягкого нагрева, чем кухонного вулкана.",
      "Пробуй по ходу — соль, вода и ещё пара минут часто спасают блюдо без паники.",
      "Режь ингредиенты похожего размера, чтобы они готовились вместе, а не каждый в своём сериале."
    ]
  };
  return notes[type] || notes.general;
}

function cf27CleanText(text, r) {
  const base = typeof cf26CleanText === "function" ? cf26CleanText(text, r) : (typeof cf25CleanText === "function" ? cf25CleanText(text, r) : String(text || ""));
  return String(base)
    .replace(/^Ошибка:\s*/i, "")
    .replace(/^Ошибочка:\s*/i, "")
    .replace(/^Милое замечание:\s*/i, "")
    .replace(/^⚠️\s*/i, "")
    .trim();
}

function cf27EndingComment(r) {
  if (typeof cf26EndingComment === "function") return cf26EndingComment(r);
  return "Готово. Ты молодец: еда случилась, кухня выжила, Лиса одобряет.";
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf27CleanText(trickText, r);
  const notes = cf27RecipeNotes(r);
  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf27CleanText(cf17QualityCheck(r), r)
    : "Финальный фокус: попробуй маленький кусочек и доведи соль, огонь и текстуру до состояния “да, это можно есть”.";

  const prepNotes = `
    <section class="cf27-prep-notes">
      <h3>Перед готовкой</h3>
      <div class="step-card daily-trick-card cf27-note-card">
        <div class="step-num">✨</div>
        <div><strong>Хитрость дня</strong><p>${cleanTrick}</p></div>
      </div>
      <div class="step-card daily-note-card cf27-note-card">
        <div class="step-num">💛</div>
        <div>
          <strong>Милое замечание</strong>
          <ul class="cf27-note-list">
            ${notes.map(note => `<li>${note}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
    <div class="cf26-section-divider cf27-section-divider"></div>`;

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v27">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${typeof cf24StepTitle === "function" ? cf27CleanText(cf24StepTitle(st, r, i), r) : cf27CleanText(st, r)}</strong>
        <p>${typeof cf24StepDetail === "function" ? cf27CleanText(cf24StepDetail(st, r, i), r) : "Готовь спокойно и пробуй по ходу."}</p>
      </div>
    </div>`).join("");

  const final = `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
  const ending = `<div class="cf25-ending-comment cf26-ending-comment cf27-ending-comment">🦊 ${cf27EndingComment(r)}</div>`;
  return prepNotes + steps + final + ending;
}
window.renderDetailedSteps = renderDetailedSteps;

function cf27InjectStyles() {
  if (document.getElementById("cf27-style")) return;
  const style = document.createElement("style");
  style.id = "cf27-style";
  style.textContent = `
    .cf27-prep-notes h3 {
      margin: 0 0 12px;
      font-size: 18px;
      opacity: .95;
    }
    .cf27-note-card {
      align-items: flex-start !important;
    }
    .cf27-note-card .step-num {
      flex: 0 0 auto;
    }
    .cf27-note-list {
      margin: 10px 0 0 !important;
      padding-left: 0 !important;
      list-style: none !important;
      display: grid !important;
      gap: 10px !important;
    }
    .cf27-note-list li {
      position: relative;
      padding-left: 22px;
      font-size: 16px;
      line-height: 1.45;
      opacity: .92;
    }
    .cf27-note-list li::before {
      content: "•";
      position: absolute;
      left: 4px;
      top: 0;
      color: #ffe08a;
      font-size: 20px;
      line-height: 1.1;
    }
    .daily-note-card p {
      display: none !important;
    }
    .cf27-section-divider {
      margin-top: 20px !important;
      margin-bottom: 20px !important;
    }
    .step-card-v27 .mistake,
    .step-card-v27 .trick {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

(function applyV27LogicalRecipeNotes(){
  if (window.CF27_LOGICAL_RECIPE_NOTES_APPLIED) return;
  window.CF27_LOGICAL_RECIPE_NOTES_APPLIED = true;
  window.CF27_VERSION = CF27_VERSION;
  cf27InjectStyles();
  if (document && document.body) document.body.dataset.cozyVersion = CF27_VERSION;
  console.info("Cozy Foodie v27 loaded: logical bullet recipe notes");
})();
