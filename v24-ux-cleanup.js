const CF24_VERSION = "webstable24-ux-cleanup";

function cf24WarmImg(emoji) {
  const safeEmoji = encodeURIComponent(emoji || "🍽️");
  return `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201200%20900'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%23f6dcc4'/%3E%3Cstop%20offset='0.55'%20stop-color='%23c68662'/%3E%3Cstop%20offset='1'%20stop-color='%23542f2f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='1200'%20height='900'%20rx='46'%20fill='url(%23g)'/%3E%3Ccircle%20cx='215'%20cy='185'%20r='170'%20fill='%23fff7ed'%20opacity='.35'/%3E%3Ccircle%20cx='1010'%20cy='735'%20r='260'%20fill='%23fff7ed'%20opacity='.16'/%3E%3Ctext%20x='600'%20y='485'%20font-size='250'%20text-anchor='middle'%3E${safeEmoji}%3C/text%3E%3Ctext%20x='600'%20y='710'%20font-family='Arial,%20sans-serif'%20font-size='54'%20font-weight='900'%20fill='%23fffaf3'%20text-anchor='middle'%3ECozy%20Foodie%3C/text%3E%3C/svg%3E`;
}

function cf24SanitizePhoto(recipe) {
  if (!recipe) return recipe;
  const img = String(recipe.image || "");
  const remoteStock = img.includes("source.unsplash.com") || img.includes("images.pexels.com") || img.includes("pixabay.com") || img.includes("images.unsplash.com");
  const brokenStockStatus = String(recipe.photoStatus || "").includes("stock");
  if (!img || remoteStock || brokenStockStatus) {
    return { ...recipe, image: cf24WarmImg(recipe.emoji || "🍽️"), photoStatus: "warm_fallback_v24" };
  }
  return recipe;
}

function cf24CleanCookingText(text, r) {
  let out = String(text || "");
  const title = String((r && r.title) || "").trim();

  if (title) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`для «${escaped}»`, "gi"), "")
      .replace(new RegExp(`в «${escaped}»`, "gi"), "")
      .replace(new RegExp(`В «${escaped}»`, "g"), "")
      .replace(new RegExp(`«${escaped}»`, "gi"), "")
      .replace(new RegExp(escaped, "gi"), "");
  }

  out = out
    .replace(/для «[^»]+»/gi, "")
    .replace(/в «[^»]+»/gi, "")
    .replace(/В «[^»]+»/g, "")
    .replace(/«[^»]+»/g, "")
    .replace(/^\s*:\s*/g, "")
    .replace(/\s+:/g, ":")
    .replace(/:\s*:/g, ":")
    .replace(/\s{2,}/g, " ")
    .replace(/^Финальный фокус\s*:/i, "Финальный фокус:")
    .replace(/^Проверка готовности\s*:/i, "Проверка готовности:")
    .replace(/^Подготовь\s+([^:]+)\s*:\s*/i, "Подготовь ингредиенты: ")
    .trim();

  return out || text;
}

function cf24StepTitle(st, r, i) {
  const raw = typeof cf17MainStep === "function" ? cf17MainStep(st, r, i) : st;
  return cf24CleanCookingText(raw, r);
}

function cf24StepDetail(st, r, i) {
  const raw = typeof stepDetail === "function" ? stepDetail(st, r, i) : "Готовь спокойно и пробуй по ходу.";
  return cf24CleanCookingText(raw, r);
}

function cf24RecipeNote(r) {
  const fallback = "Не пытайся готовить идеально. Средний огонь, спокойствие и маленькие правки по ходу спасают почти всё.";
  if (!r || !Array.isArray(r.steps) || typeof stepMistake !== "function") return fallback;
  const notes = [];
  const seen = new Set();
  for (let i = 0; i < r.steps.length; i++) {
    let note = cf24CleanCookingText(stepMistake(r.steps[i], r, i), r)
      .replace(/^⚠️\s*/i, "")
      .replace(/^Ошибка:\s*/i, "")
      .replace(/^Ошибочка:\s*/i, "")
      .replace(/^Милое замечание:\s*/i, "")
      .trim();
    const key = note.toLowerCase();
    if (note && !seen.has(key)) {
      seen.add(key);
      notes.push(note);
    }
    if (notes.length >= 2) break;
  }
  return notes.length ? notes.join(" ") : fallback;
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf24CleanCookingText(trickText, r);

  const topBlocks = `
    <div class="step-card daily-trick-card">
      <div class="step-num">✨</div>
      <div><strong>Хитрость дня</strong><p>${cleanTrick}</p></div>
    </div>
    <div class="step-card daily-note-card">
      <div class="step-num">💛</div>
      <div><strong>Милое замечание</strong><p>${cf24RecipeNote(r)}</p></div>
    </div>`;

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v24">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${cf24StepTitle(st, r, i)}</strong>
        <p>${cf24StepDetail(st, r, i)}</p>
      </div>
    </div>`).join("");

  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf24CleanCookingText(cf17QualityCheck(r), r)
    : "Проверка готовности: попробуй маленький кусочек и доведи соль, огонь и текстуру до состояния “да, это можно есть”.";

  return topBlocks + steps + `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
}

function cf24QuickTimers() {
  const classic = [1, 3, 5, 10, 15, 20];
  return classic.map(m => `<button class="timer-chip ghost" onclick="setTimer(${m},true)">${m} мин</button>`).join("");
}

function cf24CookingTimers(r) {
  const stage = typeof getStageTimers === "function" ? getStageTimers(r) : [];
  if (!stage.length) return `<p class="muted">Для этого рецепта специальных этапов нет. Можно пользоваться быстрым таймером.</p>`;
  return stage.map(t => `<button class="timer-chip" onclick="setTimer(${t.minutes},true)">${t.label}: ${t.minutes} мин</button>`).join("");
}

function cf24LisaAdvice(r) {
  let note = typeof lisaNote === "function" ? lisaNote(r) : "Если получилось не идеально — называем это авторской подачей и двигаемся дальше.";
  return String(note || "")
    .replace(/^Комментарий Лисы:\s*/i, "")
    .replace(/^Совет от Лисы:\s*/i, "")
    .trim();
}

function cf24ShowToast(text) {
  let toast = document.getElementById("cf24Toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cf24Toast";
    toast.className = "cf24-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1300);
}

const cf24OriginalAddIngredients = typeof addIngredients === "function" ? addIngredients : null;
function addIngredients(id) {
  if (cf24OriginalAddIngredients) cf24OriginalAddIngredients(id);
  cf24ShowToast("Добавила в список 🛒");
  if (navigator.vibrate) navigator.vibrate(18);
}

function openRecipe(id) {
  let r = allRecipes.find(x => x.id === id);
  if (!r) return;
  r = cf24SanitizePhoto(r);
  recent = [id, ...recent.filter(x => x !== id)].slice(0, 20);
  save();
  pauseTimer();

  $("modalInner").innerHTML = `
    <img class="modal-img" src="${r.image || cf24WarmImg(r.emoji)}" alt="" onerror="this.onerror=null;this.src='${cf24WarmImg(r.emoji)}'">
    <div class="modal-content">
      <h2>${r.title}</h2>
      <p class="muted">⏱ ${r.time} · 🔥 ${r.heat} · 🍽 ${r.portions}</p>

      <div class="fox-note fox-note-v24"><strong>🦊 Совет от Лисы</strong><p>${cf24LisaAdvice(r)}</p></div>
      <div class="food-fact">💡 ${typeof recipeFact === "function" ? cf24CleanCookingText(recipeFact(r), r) : "Еда не обязана быть идеальной. Она обязана помочь."}</div>

      <button class="primary full" onclick="addIngredients('${r.id}')">🛒 Добавить ингредиенты в список</button>

      <section class="timer-panel-v24">
        <h3>⏲️ Таймер</h3>
        <div class="timer-live-v24">
          <span class="timer-label">Активный таймер</span>
          <strong id="timerDisplay" class="timer-display">выбери таймер</strong>
          <div class="timer-actions">
            <button class="ghost" onclick="pauseTimer()">пауза</button>
            <button class="ghost" onclick="resetTimer()">сброс</button>
          </div>
        </div>
        <details class="timer-compact-box">
          <summary>⚡ Быстрый таймер</summary>
          <div class="timer-chip-row timer-chip-row-compact">${cf24QuickTimers()}</div>
        </details>
        <details class="timer-compact-box">
          <summary>🍳 Таймеры для готовки</summary>
          <div class="timer-chip-row timer-chip-row-compact">${cf24CookingTimers(r)}</div>
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

function renderFavorites() {
  const tab = $("favoritesTab");
  if (tab && !document.getElementById("cf24RecentInFavorites")) {
    const block = document.createElement("section");
    block.id = "cf24RecentInFavorites";
    block.className = "panel cf24-recent-block";
    block.innerHTML = `<h2>🔥 Снова</h2><p class="muted">Недавно открытые рецепты — теперь здесь, рядом с любимым.</p><div id="recentGridInFavorites" class="grid"></div>`;
    tab.appendChild(block);
  }
  renderGrid(allRecipes.filter(r => favorites.includes(r.id)).map(cf24SanitizePhoto), "favoritesGrid");
  renderGrid(recent.map(id => allRecipes.find(r => r.id === id)).filter(Boolean).map(cf24SanitizePhoto), "recentGridInFavorites");
}

function cf24ApplyImages() {
  if (Array.isArray(recipes)) recipes = recipes.map(cf24SanitizePhoto);
  if (Array.isArray(allRecipes)) allRecipes = allRecipes.map(cf24SanitizePhoto);
  if (typeof renderAll === "function") renderAll();
}

function cf24AddHomeActions() {
  const searchPanel = document.querySelector(".search-panel");
  if (searchPanel && !document.getElementById("cf24AddRecipeHomeBtn")) {
    const btn = document.createElement("button");
    btn.id = "cf24AddRecipeHomeBtn";
    btn.className = "secondary full cf24-add-home";
    btn.textContent = "➕ Добавить свой рецепт";
    btn.onclick = () => showTab("add");
    searchPanel.appendChild(btn);
  }
}

function cf24TuneNav() {
  const home = document.querySelector('.nav-btn[data-tab="home"] span');
  if (home) home.textContent = "🦊";
  const fridge = document.querySelector('.nav-btn[data-tab="fridge"] span');
  if (fridge) fridge.textContent = "🏠";
  const fridgeBtn = document.querySelector('.nav-btn[data-tab="fridge"]');
  if (fridgeBtn) fridgeBtn.childNodes[1] && (fridgeBtn.childNodes[1].textContent = "Дома");
}

function cf24HeroIntro() {
  const hero = $("homeHero");
  if (!hero) return;
  hero.classList.add("cf24-hero-intro");
  setTimeout(() => hero.classList.add("cf24-hero-hidden"), 3200);
}

function cf24InjectStyles() {
  if (document.getElementById("cf24-ux-style")) return;
  const style = document.createElement("style");
  style.id = "cf24-ux-style";
  style.textContent = `
    #randomBtn { display: none !important; }
    .nav-btn[data-tab="again"], .nav-btn[data-tab="add"] { display: none !important; }
    #againTab { display: none !important; }
    .bottom-nav { grid-template-columns: repeat(4, 1fr) !important; }
    .cf24-add-home { margin-top: 12px; }
    .cf24-hero-intro {
      transition: opacity .55s ease, transform .55s ease, max-height .65s ease, margin .65s ease, padding .65s ease;
      overflow: hidden;
    }
    .cf24-hero-hidden {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0 !important;
      margin: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      pointer-events: none;
    }
    .card img[src*="source.unsplash"], .card img[src*="pexels"], .modal-img[src*="source.unsplash"], .modal-img[src*="pexels"] { background: #f1c7a8; }
    .timer-box, .timer-presets { display: none !important; }
    .timer-panel-v24 {
      margin: 14px 0;
      padding: 14px;
      border-radius: 22px;
      background: rgba(255,255,255,.045);
      border: 1px solid rgba(255,255,255,.09);
    }
    .timer-panel-v24 h3 { margin-top: 0; }
    .timer-live-v24 {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border-radius: 18px;
      background: rgba(0,0,0,.18);
      margin-bottom: 10px;
    }
    .timer-live-v24 .timer-display { font-size: 24px; line-height: 1.1; }
    .timer-live-v24 .timer-actions { display: flex; gap: 8px; }
    .timer-compact-box {
      margin: 10px 0;
      padding: 11px 12px;
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 18px;
      background: rgba(255,255,255,.04);
    }
    .timer-compact-box summary { cursor: pointer; font-weight: 900; }
    .timer-chip-row-compact { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    .timer-chip-row-compact .timer-chip { padding: 8px 10px; border-radius: 999px; font-size: 13px; }
    .fox-note-v24 strong { display: block; margin-bottom: 6px; }
    .fox-note-v24 p { margin: 0; }
    .step-card-v24 .mistake, .step-card-v24 .trick { display: none !important; }
    .daily-note-card ul, .recipe-note-list { display: none !important; }
    .cf24-toast {
      position: fixed;
      left: 50%;
      bottom: 92px;
      transform: translateX(-50%) translateY(12px);
      padding: 11px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,.92);
      color: #241516;
      font-weight: 900;
      box-shadow: 0 12px 35px rgba(0,0,0,.28);
      opacity: 0;
      pointer-events: none;
      transition: .22s ease;
      z-index: 9999;
    }
    .cf24-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .cf24-recent-block { margin-top: 22px; }
  `;
  document.head.appendChild(style);
}

(function applyV24UxCleanup(){
  if (window.CF24_UX_CLEANUP_APPLIED) return;
  window.CF24_UX_CLEANUP_APPLIED = true;
  window.CF24_VERSION = CF24_VERSION;
  cf24InjectStyles();
  cf24TuneNav();
  cf24AddHomeActions();
  cf24HeroIntro();
  cf24ApplyImages();
  if (document && document.body) document.body.dataset.cozyVersion = CF24_VERSION;
  console.info("Cozy Foodie v24 loaded: UX cleanup");
})();
