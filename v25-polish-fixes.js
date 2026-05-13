const CF25_VERSION = "webstable25-polish-fixes";

function cf25WarmImg(emoji) {
  if (typeof cf24WarmImg === "function") return cf24WarmImg(emoji || "🍽️");
  const safeEmoji = encodeURIComponent(emoji || "🍽️");
  return `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201200%20900'%3E%3Crect%20width='1200'%20height='900'%20fill='%23d89b72'/%3E%3Ctext%20x='600'%20y='500'%20font-size='250'%20text-anchor='middle'%3E${safeEmoji}%3C/text%3E%3C/svg%3E`;
}

function cf25SanitizePhoto(recipe) {
  if (!recipe) return recipe;
  const img = String(recipe.image || "");
  const remoteStock = img.includes("source.unsplash.com") || img.includes("images.pexels.com") || img.includes("pixabay.com") || img.includes("images.unsplash.com");
  const brokenStockStatus = String(recipe.photoStatus || "").includes("stock");
  const blackRisk = !img || remoteStock || brokenStockStatus;
  if (blackRisk) return { ...recipe, image: cf25WarmImg(recipe.emoji || "🍽️"), photoStatus: "warm_fallback_v25" };
  return recipe;
}

if (typeof normalizeRecipe === "function" && !window.CF25_NORMALIZE_WRAPPED) {
  window.CF25_NORMALIZE_WRAPPED = true;
  const cf25OldNormalizeRecipe = normalizeRecipe;
  normalizeRecipe = function(r, i) {
    return cf25SanitizePhoto(cf25OldNormalizeRecipe(r, i));
  };
  window.normalizeRecipe = normalizeRecipe;
}

if (typeof renderGrid === "function" && !window.CF25_RENDER_GRID_WRAPPED) {
  window.CF25_RENDER_GRID_WRAPPED = true;
  const cf25OldRenderGrid = renderGrid;
  renderGrid = function(list, id) {
    return cf25OldRenderGrid((list || []).map(cf25SanitizePhoto), id);
  };
  window.renderGrid = renderGrid;
}

function cf25CleanText(text, r) {
  let out = typeof cf24CleanCookingText === "function" ? cf24CleanCookingText(text, r) : String(text || "");
  const title = String((r && r.title) || "").trim();
  if (title) out = out.split(title).join("").replace(/«»/g, "");
  return out
    .replace(/для\s+$/i, "")
    .replace(/в\s+$/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+:/g, ":")
    .trim();
}

function cf25RecipeNote(r) {
  if (typeof cf24RecipeNote === "function") return cf25CleanText(cf24RecipeNote(r), r);
  return "Готовь спокойно: блюдо не экзаменует тебя, оно просто хочет стать ужином.";
}

function cf25EndingComment(r) {
  const hay = typeof recipeHay === "function" ? recipeHay(r) : String((r && r.title) || "").toLowerCase();
  if (hay.includes("суп")) return "Готово. Ты сварила заботу в жидком формате — можно гордо шуршать ложкой.";
  if (hay.includes("сыр") || hay.includes("слив")) return "Готово. Всё, что тянется и пахнет уютом, официально засчитано как маленькая победа.";
  if (hay.includes("слад") || hay.includes("сырник") || hay.includes("десерт")) return "Готово. Сладкое — это не слабость, это мягкий способ сказать себе: ‘я молодец’.";
  if (hay.includes("карто")) return "Готово. Картошка снова доказала, что простая еда умеет лечить настроение.";
  return "Готово. Ты молодец: еда случилась, кухня выжила, Лиса одобряет.";
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf25CleanText(trickText, r);
  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf25CleanText(cf17QualityCheck(r), r)
    : "Финальный фокус: попробуй маленький кусочек и доведи соль, огонь и текстуру до состояния “да, это можно есть”.";

  const topBlocks = `
    <div class="step-card daily-trick-card">
      <div class="step-num">✨</div>
      <div><strong>Хитрость дня</strong><p>${cleanTrick}</p></div>
    </div>
    <div class="step-card daily-note-card">
      <div class="step-num">💛</div>
      <div><strong>Милое замечание</strong><p>${cf25RecipeNote(r)}</p></div>
    </div>
    <div class="cf25-recipe-divider"></div>`;

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v25">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${typeof cf24StepTitle === "function" ? cf25CleanText(cf24StepTitle(st, r, i), r) : cf25CleanText(st, r)}</strong>
        <p>${typeof cf24StepDetail === "function" ? cf25CleanText(cf24StepDetail(st, r, i), r) : "Готовь спокойно и пробуй по ходу."}</p>
      </div>
    </div>`).join("");

  const final = `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
  const ending = `<div class="cf25-ending-comment">🦊 ${cf25EndingComment(r)}</div>`;
  return topBlocks + steps + final + ending;
}

function cf25QuickTimers() {
  const classic = [1, 3, 5, 10, 15, 20];
  return classic.map(m => `<button class="timer-chip ghost" onclick="setTimer(${m},true)">${m} мин</button>`).join("");
}

function cf25CookingTimers(r) {
  const stage = typeof getStageTimers === "function" ? getStageTimers(r) : [];
  if (!stage.length) return `<p class="muted">Для этого рецепта специальных этапов нет. Можно пользоваться быстрым таймером.</p>`;
  return stage.map(t => `<button class="timer-chip" onclick="setTimer(${t.minutes},true)">${t.label}: ${t.minutes} мин</button>`).join("");
}

function cf25LisaAdvice(r) {
  const raw = typeof cf24LisaAdvice === "function" ? cf24LisaAdvice(r) : (typeof lisaNote === "function" ? lisaNote(r) : "Если получилось не идеально — называем это авторской подачей и двигаемся дальше.");
  return cf25CleanText(String(raw).replace(/^Комментарий Лисы:\s*/i, "").replace(/^Совет от Лисы:\s*/i, ""), r);
}

function cf25ShowToast(text) {
  let toast = document.getElementById("cf25Toast") || document.getElementById("cf24Toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cf25Toast";
    toast.className = "cf24-toast cf25-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function cf25MarkCartButton(id) {
  const btn = window.CF25_LAST_CART_BTN || document.querySelector(`.cart-btn[data-id="${id}"]`);
  if (!btn) return;
  btn.classList.add("cart-added");
  const old = btn.textContent;
  btn.textContent = "✓";
  setTimeout(() => {
    btn.classList.remove("cart-added");
    btn.textContent = old && old !== "✓" ? old : "🛒";
  }, 900);
}

document.addEventListener("click", function(e) {
  const cart = e.target.closest && e.target.closest(".cart-btn");
  if (cart) window.CF25_LAST_CART_BTN = cart;
}, true);

const cf25OriginalAddIngredients = typeof addIngredients === "function" ? addIngredients : null;
function addIngredients(id) {
  if (cf25OriginalAddIngredients) cf25OriginalAddIngredients(id);
  cf25MarkCartButton(id);
  cf25ShowToast("Добавила в список 🛒");
  if (navigator.vibrate) navigator.vibrate(20);
}
window.addIngredients = addIngredients;

function openRecipe(id) {
  let r = allRecipes.find(x => x.id === id);
  if (!r) return;
  r = cf25SanitizePhoto(r);
  recent = [id, ...recent.filter(x => x !== id)].slice(0, 20);
  save();
  pauseTimer();

  $("modalInner").innerHTML = `
    <img class="modal-img" src="${r.image || cf25WarmImg(r.emoji)}" alt="" onerror="this.onerror=null;this.src='${cf25WarmImg(r.emoji)}'">
    <div class="modal-content">
      <h2>${r.title}</h2>
      <p class="muted">⏱ ${r.time} · 🔥 ${r.heat} · 🍽 ${r.portions}</p>
      <div class="fox-note fox-note-v24"><strong>🦊 Совет от Лисы</strong><p>${cf25LisaAdvice(r)}</p></div>
      <div class="food-fact">💡 ${typeof recipeFact === "function" ? cf25CleanText(recipeFact(r), r) : "Еда не обязана быть идеальной. Она обязана помочь."}</div>
      <button class="primary full" onclick="addIngredients('${r.id}')">🛒 Добавить ингредиенты в список</button>
      <section class="timer-panel-v24 timer-panel-v25">
        <h3>⏲️ Таймер</h3>
        <div class="timer-live-v24 timer-live-v25">
          <span class="timer-label">Активный таймер</span>
          <strong id="timerDisplay" class="timer-display">выбери таймер</strong>
          <div class="timer-actions"><button class="ghost" onclick="pauseTimer()">пауза</button><button class="ghost" onclick="resetTimer()">сброс</button></div>
        </div>
        <details class="timer-compact-box timer-compact-box-v25">
          <summary>⚡ Быстрый таймер</summary>
          <div class="timer-chip-row timer-chip-row-compact timer-chip-row-v25">${cf25QuickTimers()}</div>
        </details>
        <details class="timer-compact-box timer-compact-box-v25">
          <summary>🍳 Таймеры для готовки</summary>
          <div class="timer-chip-row timer-chip-row-compact timer-chip-row-v25">${cf25CookingTimers(r)}</div>
        </details>
      </section>
      <h3>Ингредиенты</h3>
      ${(r.ingredients || []).map(x => `<label class="ingredient-row"><input type="checkbox"><span>${x}</span></label>`).join("")}
      <h3>Как готовить подробно</h3>
      <div class="detailed-steps">${renderDetailedSteps(r)}</div>
    </div>`;

  $("modal").classList.add("open");
  timerTotalSeconds = 0;
  timerSecondsLeft = 0;
}
window.openRecipe = openRecipe;

function cf25PlaceAddRecipeButton() {
  const ugly = document.getElementById("cf24AddRecipeHomeBtn");
  if (ugly) ugly.remove();
  const head = document.querySelector(".section-head");
  if (!head || document.getElementById("cf25AddRecipeMiniBtn")) return;
  const btn = document.createElement("button");
  btn.id = "cf25AddRecipeMiniBtn";
  btn.className = "cf25-add-mini";
  btn.innerHTML = "＋";
  btn.title = "Добавить рецепт";
  btn.onclick = () => showTab("add");
  head.appendChild(btn);
}

function cf25AddCloseButton() {
  const addTab = document.getElementById("addTab");
  if (!addTab || document.getElementById("cf25CloseAddBtn")) return;
  const btn = document.createElement("button");
  btn.id = "cf25CloseAddBtn";
  btn.className = "ghost full cf25-close-add";
  btn.textContent = "← Вернуться к рецептам";
  btn.onclick = () => showTab("home");
  addTab.insertBefore(btn, addTab.children[1] || null);
}

function cf25KeepTitle() {
  const hero = document.getElementById("homeHero");
  if (!hero) return;
  hero.classList.remove("cf24-hero-hidden");
  hero.classList.add("cf25-hero-compact");
}

function cf25ApplyImages() {
  if (Array.isArray(recipes)) recipes = recipes.map(cf25SanitizePhoto);
  if (Array.isArray(allRecipes)) allRecipes = allRecipes.map(cf25SanitizePhoto);
  if (typeof renderAll === "function") renderAll();
}

function cf25InjectStyles() {
  if (document.getElementById("cf25-polish-style")) return;
  const style = document.createElement("style");
  style.id = "cf25-polish-style";
  style.textContent = `
    #homeHero.cf24-hero-hidden, #homeHero.cf25-hero-compact {
      opacity: 1 !important;
      transform: none !important;
      max-height: none !important;
      margin: 0 0 14px 0 !important;
      padding: 16px !important;
      pointer-events: auto !important;
    }
    #homeHero.cf25-hero-compact .brand { align-items: center; }
    #homeHero.cf25-hero-compact .fox { font-size: 34px; }
    #homeHero.cf25-hero-compact .eyebrow { font-size: 11px; opacity: .78; }
    #homeHero.cf25-hero-compact h1 { font-size: 24px; margin: 2px 0 4px; }
    #homeHero.cf25-hero-compact p { font-size: 13px; margin: 0; opacity: .75; }
    #randomBtn { display: none !important; }
    .section-head { display: flex; align-items: center; gap: 10px; }
    .section-head #countText { margin-left: auto; }
    .cf25-add-mini {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 999px;
      font-size: 22px;
      line-height: 1;
      font-weight: 900;
      background: linear-gradient(135deg, #ffd27a, #ff8e65);
      color: #241313;
      box-shadow: 0 10px 24px rgba(255,142,101,.26);
    }
    .cf25-close-add { margin: 8px 0 14px; }
    .cart-btn.cart-added {
      background: #ffe08a !important;
      color: #201214 !important;
      transform: scale(1.12);
      box-shadow: 0 0 0 5px rgba(255,224,138,.22);
    }
    .timer-panel-v25 { padding: 16px !important; }
    .timer-panel-v25 h3 { font-size: 20px; margin-bottom: 12px; }
    .timer-live-v25 .timer-display { font-size: 22px !important; opacity: .9; }
    .timer-compact-box-v25 {
      padding: 14px 15px !important;
      border-radius: 20px !important;
      background: rgba(255,255,255,.065) !important;
    }
    .timer-compact-box-v25 summary { font-size: 17px !important; }
    .timer-chip-row-v25 .timer-chip {
      font-size: 15px !important;
      padding: 11px 13px !important;
      min-height: 42px;
    }
    .cf25-recipe-divider {
      height: 1px;
      margin: 16px 6px 18px;
      background: linear-gradient(90deg, transparent, rgba(255,224,138,.55), transparent);
    }
    .cf25-ending-comment {
      margin: 18px 0 4px;
      padding: 15px 16px;
      border-radius: 22px;
      background: rgba(255,210,122,.12);
      border: 1px solid rgba(255,210,122,.22);
      font-weight: 800;
      line-height: 1.45;
    }
  `;
  document.head.appendChild(style);
}

(function applyV25PolishFixes(){
  if (window.CF25_POLISH_FIXES_APPLIED) return;
  window.CF25_POLISH_FIXES_APPLIED = true;
  window.CF25_VERSION = CF25_VERSION;
  cf25InjectStyles();
  cf25KeepTitle();
  cf25PlaceAddRecipeButton();
  cf25AddCloseButton();
  cf25ApplyImages();
  setTimeout(() => { cf25KeepTitle(); cf25PlaceAddRecipeButton(); cf25ApplyImages(); }, 3600);
  if (document && document.body) document.body.dataset.cozyVersion = CF25_VERSION;
  console.info("Cozy Foodie v25 loaded: polish fixes");
})();
