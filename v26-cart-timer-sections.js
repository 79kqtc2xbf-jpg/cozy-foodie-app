const CF26_VERSION = "webstable26-cart-timer-sections";

function cf26WarmImg(emoji) {
  if (typeof cf25WarmImg === "function") return cf25WarmImg(emoji || "🍽️");
  if (typeof cf24WarmImg === "function") return cf24WarmImg(emoji || "🍽️");
  const safeEmoji = encodeURIComponent(emoji || "🍽️");
  return `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201200%20900'%3E%3Crect%20width='1200'%20height='900'%20fill='%23d89b72'/%3E%3Ctext%20x='600'%20y='500'%20font-size='250'%20text-anchor='middle'%3E${safeEmoji}%3C/text%3E%3C/svg%3E`;
}

function cf26SanitizePhoto(recipe) {
  if (typeof cf25SanitizePhoto === "function") return cf25SanitizePhoto(recipe);
  if (!recipe) return recipe;
  const img = String(recipe.image || "");
  const remoteStock = img.includes("source.unsplash.com") || img.includes("images.pexels.com") || img.includes("pixabay.com") || img.includes("images.unsplash.com");
  if (!img || remoteStock) return { ...recipe, image: cf26WarmImg(recipe.emoji || "🍽️"), photoStatus: "warm_fallback_v26" };
  return recipe;
}

function cf26Toast(text) {
  let toast = document.getElementById("cf26Toast") || document.getElementById("cf25Toast") || document.getElementById("cf24Toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cf26Toast";
    toast.className = "cf24-toast cf26-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function cf26MarkCartButton(id, btn) {
  const target = btn || document.querySelector(`.cart-btn[data-id="${id}"]`);
  if (!target) return;
  target.classList.add("cart-added");
  target.textContent = "✓";
  setTimeout(() => {
    target.classList.remove("cart-added");
    target.textContent = "🛒";
  }, 950);
}

function cf26AddIngredientsDirect(id, btn) {
  const r = (allRecipes || []).find(x => x.id === id);
  if (!r) {
    cf26Toast("Не нашла рецепт 😭");
    return;
  }

  const before = shopping.length;
  (r.ingredients || []).forEach(text => {
    if (!shopping.some(item => item.text === text)) shopping.push({ text, done: false });
  });

  save();
  if (typeof renderShopping === "function") renderShopping();
  cf26MarkCartButton(id, btn);
  cf26Toast(shopping.length > before ? "Добавила в список 🛒" : "Уже есть в списке 🛒");
  if (navigator.vibrate) navigator.vibrate(20);
}

function addIngredients(id) {
  cf26AddIngredientsDirect(id);
}
window.addIngredients = addIngredients;

document.addEventListener("click", function(e) {
  const cart = e.target.closest && e.target.closest(".cart-btn");
  if (!cart) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  cf26AddIngredientsDirect(cart.dataset.id, cart);
}, true);

function cf26Hash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) >>> 0;
  return h;
}

function cf26Pick(arr, key) {
  return arr[cf26Hash(key) % arr.length];
}

function cf26EndingComment(r) {
  const hay = typeof recipeHay === "function" ? recipeHay(r) : String((r && r.title) || "").toLowerCase();
  const key = (r?.id || r?.title || "recipe") + hay;

  const soup = [
    "Суп готов. Можно официально считать, что ты сварила заботу и немного внутреннего спокойствия.",
    "Финиш. Бульон сделал своё дело: теперь в доме пахнет так, будто всё под контролем.",
    "Готово. Ложка, глубокая миска и вид человека, который сегодня справился."
  ];
  const cheesy = [
    "Готово. Всё, что тянется и пахнет уютом, засчитано как маленькая бытовая победа.",
    "Финиш. Сыр расплавился, настроение тоже должно чуть-чуть размягчиться.",
    "Можно есть. Сырная часть вечера официально спасена."
  ];
  const sweet = [
    "Готово. Сладкое — это не слабость, это мягкий способ сказать себе: “я молодец”.",
    "Финиш. Получилось нежно, уютно и без необходимости становиться кондитером года.",
    "Можно брать ложку. Лиса считает, что десерт — это тоже забота, просто симпатичнее."
  ];
  const potato = [
    "Готово. Картошка снова доказала, что простая еда умеет чинить настроение.",
    "Финиш. Уютный углеводный штаб открыт, можно выдыхать.",
    "Можно есть. Это тот случай, когда картошка всё поняла без лишних слов."
  ];
  const chicken = [
    "Готово. Курица не пересушена, ты не перегорела — уже успех.",
    "Финиш. Белок на месте, ужин собран, Лиса довольно кивает.",
    "Можно есть. Получилось сытно и без кулинарного героизма."
  ];
  const pasta = [
    "Готово. Паста выглядит так, будто вечер ещё можно спасти.",
    "Финиш. Соус обнял пасту, а ты можешь обнять тарелку взглядом.",
    "Можно есть. Макароны снова сделали жизнь понятнее."
  ];
  const egg = [
    "Готово. Яйца пережили огонь достойно, завтрак/ужин тоже.",
    "Финиш. Быстро, тепло, без драмы — именно то, что нужно.",
    "Можно есть. Лиса уважает блюда, которые не требуют конференции на кухне."
  ];
  const general = [
    "Готово. Ты молодец: еда случилась, кухня выжила, Лиса одобряет.",
    "Финиш. Не ресторанная критика, а нормальная человеческая еда — и это прекрасно.",
    "Можно есть. Если получилось не идеально, называем это домашним стилем и улыбаемся.",
    "Готово. Один маленький ужин для человека, один большой шаг против голодной грусти.",
    "Финиш. Тарелка есть, план выполнен, можно не объяснять никому, как ты к этому пришла."
  ];

  if (hay.includes("суп") || hay.includes("бульон")) return cf26Pick(soup, key);
  if (hay.includes("сыр") || hay.includes("слив")) return cf26Pick(cheesy, key);
  if (hay.includes("слад") || hay.includes("сырник") || hay.includes("десерт") || hay.includes("ягод") || hay.includes("банан")) return cf26Pick(sweet, key);
  if (hay.includes("карто")) return cf26Pick(potato, key);
  if (hay.includes("куриц")) return cf26Pick(chicken, key);
  if (hay.includes("паста") || hay.includes("макарон")) return cf26Pick(pasta, key);
  if (hay.includes("яйц") || hay.includes("омлет")) return cf26Pick(egg, key);
  return cf26Pick(general, key);
}

function cf26CleanText(text, r) {
  if (typeof cf25CleanText === "function") return cf25CleanText(text, r);
  if (typeof cf24CleanCookingText === "function") return cf24CleanCookingText(text, r);
  return String(text || "").trim();
}

function cf26RecipeNote(r) {
  const raw = typeof cf25RecipeNote === "function" ? cf25RecipeNote(r) : "Готовь спокойно: блюдо не экзаменует тебя, оно просто хочет стать ужином.";
  return cf26CleanText(raw, r);
}

function renderDetailedSteps(r) {
  const trickText = typeof cf20DailyTrickText === "function" ? cf20DailyTrickText(r) : "Держи огонь умеренным и пробуй по ходу.";
  const cleanTrick = cf26CleanText(trickText, r);
  const finalRaw = typeof cf17QualityCheck === "function"
    ? cf26CleanText(cf17QualityCheck(r), r)
    : "Финальный фокус: попробуй маленький кусочек и доведи соль, огонь и текстуру до состояния “да, это можно есть”.";

  const prepNotes = `
    <section class="cf26-prep-notes">
      <h3>Перед готовкой</h3>
      <div class="step-card daily-trick-card">
        <div class="step-num">✨</div>
        <div><strong>Хитрость дня</strong><p>${cleanTrick}</p></div>
      </div>
      <div class="step-card daily-note-card">
        <div class="step-num">💛</div>
        <div><strong>Милое замечание</strong><p>${cf26RecipeNote(r)}</p></div>
      </div>
    </section>
    <div class="cf26-section-divider"></div>`;

  const steps = (r.steps || []).map((st, i) => `
    <div class="step-card step-card-v26">
      <div class="step-num">${i + 1}</div>
      <div>
        <strong>${typeof cf24StepTitle === "function" ? cf26CleanText(cf24StepTitle(st, r, i), r) : cf26CleanText(st, r)}</strong>
        <p>${typeof cf24StepDetail === "function" ? cf26CleanText(cf24StepDetail(st, r, i), r) : "Готовь спокойно и пробуй по ходу."}</p>
      </div>
    </div>`).join("");

  const final = `<div class="step-card final-check"><div class="step-num">✓</div><div><strong>${finalRaw}</strong><p>Если вкус кажется пустым — добавь щепотку соли, немного кислоты или дай блюду постоять 2–5 минут.</p></div></div>`;
  const ending = `<div class="cf25-ending-comment cf26-ending-comment">🦊 ${cf26EndingComment(r)}</div>`;
  return prepNotes + steps + final + ending;
}

function cf26SetTimer(minutes, label) {
  pauseTimer();
  timerTotalSeconds = minutes * 60;
  timerSecondsLeft = timerTotalSeconds;
  const d = document.getElementById("timerDisplay");
  if (d) d.textContent = formatTimer(timerSecondsLeft);
  const labelBox = document.getElementById("cf26TimerChosen");
  if (labelBox) labelBox.textContent = label || `${minutes} мин`;
  cf26Toast("Таймер выбран. Нажми старт ⏲️");
}

function cf26StartSelectedTimer() {
  if (!timerTotalSeconds || timerTotalSeconds <= 0) {
    cf26Toast("Сначала выбери таймер ⏲️");
    return;
  }
  startTimer();
}

function cf26ResetTimer() {
  pauseTimer();
  if (!timerTotalSeconds || timerTotalSeconds <= 0) {
    const d = document.getElementById("timerDisplay");
    if (d) d.textContent = "выбери таймер";
    return;
  }
  timerSecondsLeft = timerTotalSeconds;
  updateTimerDisplay();
}

window.cf26SetTimer = cf26SetTimer;
window.cf26StartSelectedTimer = cf26StartSelectedTimer;
window.cf26ResetTimer = cf26ResetTimer;

function cf26QuickTimers() {
  const classic = [1, 3, 5, 10, 15, 20];
  return classic.map(m => `<button class="timer-chip ghost" onclick="cf26SetTimer(${m}, '${m} мин')">${m} мин</button>`).join("");
}

function cf26CookingTimers(r) {
  const stage = typeof getStageTimers === "function" ? getStageTimers(r) : [];
  if (!stage.length) return `<p class="muted">Для этого рецепта специальных этапов нет. Можно пользоваться быстрым таймером.</p>`;
  return stage.map(t => `<button class="timer-chip" onclick="cf26SetTimer(${t.minutes}, '${String(t.label).replace(/'/g, "")} · ${t.minutes} мин')">${t.label}: ${t.minutes} мин</button>`).join("");
}

function cf26LisaAdvice(r) {
  const raw = typeof cf25LisaAdvice === "function" ? cf25LisaAdvice(r) : (typeof cf24LisaAdvice === "function" ? cf24LisaAdvice(r) : "Если получилось не идеально — называем это авторской подачей и двигаемся дальше.");
  return cf26CleanText(raw, r);
}

function openRecipe(id) {
  let r = (allRecipes || []).find(x => x.id === id);
  if (!r) return;
  r = cf26SanitizePhoto(r);
  recent = [id, ...recent.filter(x => x !== id)].slice(0, 20);
  save();
  pauseTimer();
  timerTotalSeconds = 0;
  timerSecondsLeft = 0;

  $("modalInner").innerHTML = `
    <img class="modal-img" src="${r.image || cf26WarmImg(r.emoji)}" alt="" onerror="this.onerror=null;this.src='${cf26WarmImg(r.emoji)}'">
    <div class="modal-content">
      <h2>${r.title}</h2>
      <p class="muted">⏱ ${r.time} · 🔥 ${r.heat} · 🍽 ${r.portions}</p>

      <div class="fox-note fox-note-v24"><strong>🦊 Совет от Лисы</strong><p>${cf26LisaAdvice(r)}</p></div>
      <div class="food-fact">💡 ${typeof recipeFact === "function" ? cf26CleanText(recipeFact(r), r) : "Еда не обязана быть идеальной. Она обязана помочь."}</div>
      <button class="primary full" onclick="addIngredients('${r.id}')">🛒 Добавить ингредиенты в список</button>

      <div class="cf26-section-divider"></div>
      <section class="timer-panel-v24 timer-panel-v25 timer-panel-v26">
        <h3>⏲️ Таймер</h3>
        <div class="timer-live-v24 timer-live-v25 timer-live-v26">
          <span class="timer-label">Выбрано: <b id="cf26TimerChosen">пока ничего</b></span>
          <strong id="timerDisplay" class="timer-display">выбери таймер</strong>
          <div class="timer-actions timer-actions-v26">
            <button class="secondary" onclick="cf26StartSelectedTimer()">старт</button>
            <button class="ghost" onclick="pauseTimer()">пауза</button>
            <button class="ghost" onclick="cf26ResetTimer()">сброс</button>
          </div>
        </div>
        <details class="timer-compact-box timer-compact-box-v25 timer-compact-box-v26">
          <summary>⚡ Быстрый таймер</summary>
          <div class="timer-chip-row timer-chip-row-compact timer-chip-row-v25 timer-chip-row-v26">${cf26QuickTimers()}</div>
        </details>
        <details class="timer-compact-box timer-compact-box-v25 timer-compact-box-v26">
          <summary>🍳 Таймеры для готовки</summary>
          <div class="timer-chip-row timer-chip-row-compact timer-chip-row-v25 timer-chip-row-v26">${cf26CookingTimers(r)}</div>
        </details>
      </section>

      <div class="cf26-section-divider"></div>
      <section class="cf26-ingredients-section">
        <h3>Ингредиенты</h3>
        ${(r.ingredients || []).map(x => `<label class="ingredient-row"><input type="checkbox"><span>${x}</span></label>`).join("")}
      </section>

      <div class="cf26-section-divider"></div>
      <section class="cf26-steps-section">
        <h3>Как готовить подробно</h3>
        <div class="detailed-steps">${renderDetailedSteps(r)}</div>
      </section>
    </div>`;

  $("modal").classList.add("open");
}
window.openRecipe = openRecipe;

function cf26ApplyImages() {
  if (Array.isArray(recipes)) recipes = recipes.map(cf26SanitizePhoto);
  if (Array.isArray(allRecipes)) allRecipes = allRecipes.map(cf26SanitizePhoto);
  if (typeof renderAll === "function") renderAll();
}

function cf26BrightenBackButton() {
  const btn = document.getElementById("cf25CloseAddBtn");
  if (btn) btn.classList.add("cf26-close-add-bright");
}

function cf26InjectStyles() {
  if (document.getElementById("cf26-style")) return;
  const style = document.createElement("style");
  style.id = "cf26-style";
  style.textContent = `
    .cart-btn.cart-added {
      background: #ffe08a !important;
      color: #201214 !important;
      transform: scale(1.14);
      box-shadow: 0 0 0 6px rgba(255,224,138,.24) !important;
    }
    .cf26-section-divider {
      height: 1px;
      margin: 18px 2px;
      background: linear-gradient(90deg, transparent, rgba(255,224,138,.62), transparent);
    }
    .cf26-prep-notes {
      padding: 2px 0 0;
    }
    .cf26-prep-notes h3 {
      margin: 0 0 10px;
      font-size: 18px;
      opacity: .94;
    }
    .timer-panel-v26 {
      margin: 0 !important;
      padding: 17px !important;
    }
    .timer-live-v26 .timer-display {
      font-size: 24px !important;
    }
    .timer-actions-v26 {
      display: grid !important;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 9px !important;
    }
    .timer-actions-v26 button {
      min-height: 40px;
    }
    .timer-chip-row-v26 .timer-chip {
      font-size: 16px !important;
      padding: 12px 14px !important;
      min-height: 46px !important;
    }
    .timer-compact-box-v26 summary {
      font-size: 18px !important;
    }
    .cf26-ingredients-section h3,
    .cf26-steps-section h3 {
      margin-top: 0;
    }
    .cf26-ending-comment {
      background: rgba(255,210,122,.14) !important;
      border-color: rgba(255,210,122,.28) !important;
    }
    .cf26-close-add-bright, #cf25CloseAddBtn {
      background: linear-gradient(135deg, #ffe08a, #ff9b6a) !important;
      color: #241313 !important;
      border: 0 !important;
      font-weight: 900 !important;
      box-shadow: 0 12px 28px rgba(255,155,106,.24) !important;
    }
  `;
  document.head.appendChild(style);
}

(function applyV26CartTimerSections(){
  if (window.CF26_CART_TIMER_SECTIONS_APPLIED) return;
  window.CF26_CART_TIMER_SECTIONS_APPLIED = true;
  window.CF26_VERSION = CF26_VERSION;
  cf26InjectStyles();
  cf26BrightenBackButton();
  cf26ApplyImages();
  setTimeout(() => { cf26BrightenBackButton(); cf26ApplyImages(); }, 800);
  if (document && document.body) document.body.dataset.cozyVersion = CF26_VERSION;
  console.info("Cozy Foodie v26 loaded: cart, timer start, sections");
})();
