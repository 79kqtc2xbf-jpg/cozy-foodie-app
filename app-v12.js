let recipes = [];
let allRecipes = [];
let favorites = JSON.parse(localStorage.getItem("cf_favorites_v8") || "[]");
let shopping = JSON.parse(localStorage.getItem("cf_shopping_v8") || "[]");
let recent = JSON.parse(localStorage.getItem("cf_recent_v8") || "[]");
let currentCategory = "все";
let currentTab = "home";
let currentSmart = "all";
let cookStats = JSON.parse(localStorage.getItem("cf_cook_stats_v10") || "{}");
let timerInterval = null;

const moodRules = {
  "устала": {
    label: "😵 Устала",
    weights: { "быстро": 4, "ужин": 1, "паста": 2, "курица": 2 },
    badges: ["⚡ быстро", "🌙 comfort", "💸 budget"],
    words: ["слив", "паста", "омлет", "сэндвич", "рис", "курица"]
  },
  "грустно": {
    label: "🥺 Грустно",
    weights: { "паста": 4, "завтрак": 2, "мясо": 1 },
    badges: ["🌙 comfort", "🍯 cozy"],
    words: ["сыр", "слив", "паста", "олад", "панкейки", "картошка"]
  },
  "энергия": {
    label: "⚡ Нужна энергия",
    weights: { "курица": 4, "мясо": 3, "рыба": 3, "полезное": 2 },
    badges: ["🔥 high protein", "🥦 healthy"],
    words: ["курица", "лосось", "тунец", "говядина", "рис"]
  },
  "ленивая": {
    label: "🦥 Лень готовить",
    weights: { "быстро": 5, "завтрак": 2 },
    badges: ["⚡ быстро", "💸 budget"],
    words: ["тост", "омлет", "сэндвич", "яйцо", "лаваш", "овсянка"]
  },
  "уют": {
    label: "🌙 Хочу уют",
    weights: { "паста": 3, "суп": 3, "ужин": 2 },
    badges: ["🌙 comfort", "🍯 cozy"],
    words: ["суп", "слив", "грибы", "паста", "картофель"]
  }
};

const prefOptions = ["🥩 мясо", "🍗 курица", "🐟 рыба", "🍝 паста", "⚡ быстро", "🥦 полезное"];

const categoryMeta = [
  ["все", "✨"], ["завтрак", "🍳"], ["ужин", "🌙"], ["быстро", "⚡"],
  ["курица", "🍗"], ["мясо", "🥩"], ["рыба", "🐟"], ["паста", "🍝"],
  ["азия", "🍜"], ["суп", "🥣"], ["сладкое", "🍯"], ["полезное", "🥦"]
];

const foodEmoji = {
  "курица": "🍗", "паста": "🍝", "рыба": "🐟", "мясо": "🥩", "завтрак": "🍳",
  "азия": "🍜", "полезное": "🥗", "быстро": "⚡", "ужин": "🍽️", "суп": "🥣", "сладкое": "🍯"
};

function save() {
  localStorage.setItem("cf_favorites_v8", JSON.stringify(favorites));
  localStorage.setItem("cf_shopping_v8", JSON.stringify(shopping));
  localStorage.setItem("cf_recent_v8", JSON.stringify(recent));
  localStorage.setItem("cf_cook_stats_v10", JSON.stringify(cookStats));
}

function getEmoji(recipe) {
  const cats = recipe.category || recipe.categories || [];
  for (const c of cats) if (foodEmoji[c]) return foodEmoji[c];
  const title = (recipe.title || "").toLowerCase();
  if (title.includes("бургер")) return "🍔";
  if (title.includes("пицца")) return "🍕";
  if (title.includes("олад") || title.includes("панкейк")) return "🥞";
  if (title.includes("рис")) return "🍚";
  return "🍽️";
}


function getImageSrc(recipe) {
  if (recipe.imageLocal) return recipe.imageLocal;
  if (recipe.image) return recipe.image;
  return "";
}

function normalizeRecipe(r, i) {
  const cats = r.category || r.categories || ["ужин"];
  return {
    id: r.id || `user_${Date.now()}_${i}`,
    title: r.title || "Безымянный рецепт",
    category: Array.isArray(cats) ? cats : String(cats).split(",").map(x => x.trim()),
    time: r.time || "25 мин",
    heat: r.heat || "5 из 9",
    portions: r.portions || "2 порц.",
    difficulty: r.difficulty || "легко",
    badges: r.badges || guessBadges(cats, r.title || ""),
    mood: r.mood || "уют",
    image: r.image || "",
    imageLocal: r.imageLocal || "",
    calories: r.calories || guessCalories(r),
    protein: r.protein || guessProtein(r),
    ingredients: r.ingredients || [],
    steps: r.steps || [],
    tips: r.tips || ["Если что-то пошло не так — убавь огонь. Это кулинарная кнопка спасения."]
  };
}

function guessBadges(cats, title) {
  const c = Array.isArray(cats) ? cats : String(cats).split(",");
  const badges = [];
  if (c.includes("быстро")) badges.push("⚡ быстро");
  if (c.some(x => ["курица","мясо","рыба"].includes(x))) badges.push("🔥 high protein");
  if (c.includes("полезное")) badges.push("🥦 healthy");
  if (!badges.length) badges.push("🌙 comfort");
  return badges;
}

function guessCalories(r) {
  const title = (r.title || "").toLowerCase();
  if (title.includes("салат")) return "280–420 ккал";
  if (title.includes("паста") || title.includes("бургер")) return "550–750 ккал";
  if (title.includes("овсян") || title.includes("омлет")) return "300–450 ккал";
  return "400–650 ккал";
}

function guessProtein(r) {
  const title = (r.title || "").toLowerCase();
  if (title.includes("кур") || title.includes("лосос") || title.includes("говядин") || title.includes("тунец")) return "25–40 г белка";
  if (title.includes("яйц") || title.includes("омлет") || title.includes("сыр")) return "15–25 г белка";
  return "10–25 г белка";
}

async function loadRecipes() {
  try {
    const res = await fetch("recipes.json?v=8");
    const data = await res.json();
    const user = JSON.parse(localStorage.getItem("cf_user_recipes_v8") || "[]");
    allRecipes = [...data, ...user].map(normalizeRecipe);
  } catch (e) {
    allRecipes = [];
    console.error(e);
  }
  recipes = [...allRecipes];
  init();
}

function init() {
  renderOnboarding();
  renderMood();
  renderCategories();
  renderDaily();
  renderSmartFilters();
  renderRecent();
  renderTrending();
  renderAll();
  renderShopping();
  bindEvents();
}

function bindEvents() {
  document.getElementById("randomBtn").onclick = () => openRecipe(pickRandom(recipes));
  document.getElementById("searchInput").oninput = e => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = filterRecipes(q, currentCategory);
    renderGrid(filtered, "recipesGrid");
    document.getElementById("resultsNote").textContent = `${filtered.length} рецептов`;
  };
  document.getElementById("closeModal").onclick = closeModal;
  document.getElementById("modal").onclick = e => { if (e.target.id === "modal") closeModal(); };

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  document.getElementById("fridgeBtn").onclick = runFridgeSearch;
  const manualInput = document.getElementById("manualShopInput");
  const manualBtn = document.getElementById("manualShopBtn");
  manualBtn.onclick = addManualShop;
  manualInput.addEventListener("input", () => {
    const hasText = manualInput.value.trim().length > 0;
    manualBtn.disabled = !hasText;
    manualBtn.classList.toggle("ready", hasText);
    manualBtn.classList.toggle("add-disabled", !hasText);
  });
  document.getElementById("clearShoppingBtn").onclick = () => { shopping = []; save(); renderShopping(); };
  document.getElementById("addRecipeBtn").onclick = addUserRecipe;
  document.getElementById("importBtn").onclick = importRecipes;
  document.getElementById("cravingBtn").onclick = runCravingSearch;
  document.getElementById("cravingInput").addEventListener("keydown", e => {
    if (e.key === "Enter") runCravingSearch();
  });
  document.querySelectorAll(".smart").forEach(btn => {
    btn.onclick = () => {
      currentSmart = btn.dataset.smart;
      document.querySelectorAll(".smart").forEach(b => b.classList.toggle("active", b.dataset.smart === currentSmart));
      const q = document.getElementById("searchInput").value.toLowerCase().trim();
      const filtered = filterRecipes(q, currentCategory);
      renderGrid(filtered, "recipesGrid");
      document.getElementById("resultsNote").textContent = `${filtered.length} рецептов`;
    };
  });
}

function renderOnboarding() {
  if (localStorage.getItem("cf_onboarded_v8")) return;
  const box = document.getElementById("onboarding");
  const grid = document.getElementById("prefGrid");
  box.classList.remove("hidden");
  grid.innerHTML = prefOptions.map(p => `<button class="pref">${p}</button>`).join("");
  grid.querySelectorAll(".pref").forEach(b => b.onclick = () => b.classList.toggle("on"));
  document.getElementById("finishOnboarding").onclick = () => {
    const prefs = [...grid.querySelectorAll(".pref.on")].map(x => x.textContent);
    localStorage.setItem("cf_prefs_v8", JSON.stringify(prefs));
    localStorage.setItem("cf_onboarded_v8", "1");
    box.classList.add("hidden");
  };
}

function renderMood() {
  const wrap = document.getElementById("moodButtons");
  wrap.innerHTML = Object.entries(moodRules).map(([key, rule]) =>
    `<button class="mood-btn" data-mood="${key}">${rule.label}</button>`
  ).join("");
  wrap.querySelectorAll(".mood-btn").forEach(btn => {
    btn.onclick = () => {
      wrap.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      recommendByMood(btn.dataset.mood);
    };
  });
}

function recommendByMood(mood) {
  const ranked = [...allRecipes].map(r => ({ r, score: moodScore(r, mood) }))
    .sort((a,b) => b.score - a.score);
  const topPool = ranked.filter(x => x.score > 0).slice(0, 12);
  const pick = topPool.length ? topPool[Math.floor(Math.random() * Math.min(topPool.length, 6))].r : pickRandom(allRecipes);
  const box = document.getElementById("moodResult");
  box.classList.remove("hidden");
  box.innerHTML = `
    <div class="eyebrow">Рекомендация</div>
    <h3>${getEmoji(pick)} ${pick.title}</h3>
    <p class="muted">Почему: ${explainMood(pick, mood)}</p>
    <button class="primary" onclick="openRecipeById('${pick.id}')">Открыть рецепт</button>
  `;
}

function moodScore(recipe, mood) {
  const rule = moodRules[mood];
  let score = Math.random() * 0.7; // небольшая вариативность
  const cats = recipe.category || [];
  cats.forEach(c => score += rule.weights[c] || 0);
  (recipe.badges || []).forEach(b => {
    if (rule.badges.some(rb => b.includes(rb.replace(/[^\wа-яА-ЯёЁ ]/g, "").trim()) || rb.includes(b))) score += 2;
  });
  const hay = [
    recipe.title, ...(recipe.ingredients || []), ...(recipe.steps || []), ...(recipe.badges || [])
  ].join(" ").toLowerCase();
  rule.words.forEach(w => { if (hay.includes(w)) score += 1.5; });
  return score;
}

function explainMood(recipe, mood) {
  const cats = recipe.category || [];
  if (mood === "устала") return "быстро, сытно и без кухонного героизма";
  if (mood === "грустно") return "comfort food, чтобы жизнь стала чуть менее кринжовой";
  if (mood === "энергия") return "больше белка и нормальная еда, не просто печенька в панике";
  if (mood === "ленивая") return "минимум телодвижений, максимум «я молодец»";
  return "уютно, тепло и не похоже на наказание";
}

function renderCategories() {
  const row = document.getElementById("categoryRow");
  row.innerHTML = categoryMeta.map(([cat, icon]) => {
    const count = cat === "все" ? allRecipes.length : allRecipes.filter(r => (r.category || []).includes(cat)).length;
    return `<div class="cat-card ${cat === currentCategory ? "active" : ""}" data-cat="${cat}">
      <div class="cat-icon">${icon}</div>
      <div class="cat-title">${cat}</div>
      <div class="cat-count">${count} рецептов</div>
    </div>`;
  }).join("");
  row.querySelectorAll(".cat-card").forEach(card => {
    card.onclick = () => {
      currentCategory = card.dataset.cat;
      renderCategories();
      const q = document.getElementById("searchInput").value.toLowerCase().trim();
      const filtered = filterRecipes(q, currentCategory);
      renderGrid(filtered, "recipesGrid");
      document.getElementById("resultsNote").textContent = `${filtered.length} рецептов`;
    };
  });
}

function renderAll() {
  const filtered = filterRecipes("", currentCategory);
  renderGrid(filtered, "recipesGrid");
  renderGrid(allRecipes.filter(r => favorites.includes(r.id)), "favoritesGrid");
  document.getElementById("resultsNote").textContent = `${filtered.length} рецептов`;
}

function filterRecipes(q, cat) {
  return allRecipes.filter(r => {
    const inCat = cat === "все" || (r.category || []).includes(cat);
    const hay = [r.title, ...(r.category || []), ...(r.ingredients || []), ...(r.steps || []), ...(r.badges || [])].join(" ").toLowerCase();
    const matchesText = !q || hay.includes(q);
    const matchesSmart = smartMatch(r, currentSmart);
    return inCat && matchesText && matchesSmart;
  });
}

function smartMatch(r, smart) {
  if (smart === "all") return true;
  const hay = [r.title, ...(r.category || []), ...(r.badges || []), ...(r.ingredients || [])].join(" ").toLowerCase();
  const timeNum = parseInt(String(r.time || "").match(/\d+/)?.[0] || "99", 10);
  if (smart === "fast") return timeNum <= 20 || hay.includes("быстро");
  if (smart === "protein") return hay.includes("кур") || hay.includes("мяс") || hay.includes("рыб") || hay.includes("тунец") || hay.includes("белок") || hay.includes("high protein");
  if (smart === "budget") return hay.includes("budget") || hay.includes("бюджет") || hay.includes("карто") || hay.includes("рис") || hay.includes("греч") || hay.includes("яйц");
  if (smart === "comfort") return hay.includes("comfort") || hay.includes("уют") || hay.includes("слив") || hay.includes("сыр") || hay.includes("паста") || hay.includes("суп");
  return true;
}

function renderGrid(list, targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  grid.innerHTML = list.map(cardHtml).join("") || `<p class="muted">Пусто. Еда ушла в отпуск.</p>`;
  grid.querySelectorAll(".card").forEach(card => {
    card.onclick = e => {
      if (e.target.closest("button")) return;
      openRecipeById(card.dataset.id);
    };
  });
  grid.querySelectorAll(".heart").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.id);
    };
  });
  grid.querySelectorAll(".quick-add").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const r = allRecipes.find(x => x.id === btn.dataset.id);
      addIngredientsToShopping(r);
    };
  });
}

function cardHtml(r) {
  const liked = favorites.includes(r.id);
  const imageSrc = getImageSrc(r);
  const img = imageSrc
    ? `<img class="local-food-img" src="${imageSrc}" alt="${r.title}" loading="lazy" onerror="this.outerHTML='<div class=&quot;img-fallback&quot;>${getEmoji(r)}</div>'">`
    : `<div class="img-fallback">${getEmoji(r)}</div>`;
  return `<article class="card" data-id="${r.id}">
    <button class="heart ${liked ? "on" : ""}" data-id="${r.id}">♥</button>
    <button class="tiny-btn quick-add" data-id="${r.id}">🛒</button>
    ${img}
    <div class="card-body">
      <h3>${r.title}</h3>
      <div class="meta">${r.time} · ${r.heat}</div>
      <div class="stats">
        <div class="stat">🔥 ${r.calories || "400–650 ккал"}</div>
        <div class="stat">💪 ${r.protein || "10–25 г белка"}</div>
      </div>
      <div class="badges">${(r.badges || []).map(b => `<span class="badge">${b}</span>`).join("")}</div>
      <div class="tags">${(r.category || []).slice(0,3).map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </div>
  </article>`;
}

function openRecipeById(id) {
  const r = allRecipes.find(x => x.id === id);
  if (r) openRecipe(r);
}

function openRecipe(r) {
  if (!r) return;
  recent = [r.id, ...recent.filter(id => id !== r.id)].slice(0, 20);
  cookStats[r.id] = (cookStats[r.id] || 0) + 1;
  save();
  renderRecent();
  renderTrending();

  const modal = document.getElementById("modal");
  const inner = document.getElementById("modalInner");
  const liked = favorites.includes(r.id);
  const imageSrc = getImageSrc(r);
  const image = imageSrc
    ? `<img class="modal-img local-food-img" src="${imageSrc}" alt="${r.title}" onerror="this.outerHTML='<div class=&quot;modal-fallback&quot;>${getEmoji(r)}</div>'">`
    : `<div class="modal-fallback">${getEmoji(r)}</div>`;

  inner.innerHTML = `
    ${image}
    <div class="modal-content">
      <div class="badges">${(r.badges || []).map(b => `<span class="badge">${b}</span>`).join("")}</div>
      <h2>${r.title}</h2>
      <div class="meta">${r.time} · ${r.heat} · ${r.portions} · ${r.difficulty}</div>
      <div class="stats">
        <div class="stat">🔥 ${r.calories || "400–650 ккал"}</div>
        <div class="stat">💪 ${r.protein || "10–25 г белка"}</div>
      </div>

      <div class="modal-actions">
        <button class="primary" onclick="addIngredientsToShoppingById('${r.id}')">🛒 В список</button>
        <button class="secondary" onclick="toggleFavorite('${r.id}')">${liked ? "❤️ В любимом" : "♡ В избранное"}</button>
        <button class="secondary" onclick="shareRecipe('${r.id}')">↗️ Поделиться</button>
      </div>

      <h3>Ингредиенты</h3>
      <ul>${(r.ingredients || []).map(x => `<li>${x}</li>`).join("")}</ul>

      <h3>Как готовить</h3>
      <ol>${(r.steps || []).map(x => `<li>${x}</li>`).join("")}</ol>

      <div class="timer-box">
        <h3>⏱ Таймер</h3>
        <p class="muted">Для этапов, где надо “ждать и не трогать”. Да, это сложно.</p>
        <div class="timer-row">
          <button class="timer-btn" onclick="startTimer(3)">3 мин</button>
          <button class="timer-btn" onclick="startTimer(5)">5 мин</button>
          <button class="timer-btn" onclick="startTimer(10)">10 мин</button>
          <button class="timer-btn" onclick="stopTimer()">Стоп</button>
        </div>
        <div id="timerDisplay" class="timer-display">00:00</div>
      </div>

      <h3>Советы, чтобы не накосячить</h3>
      <ul>${(r.tips || []).map(x => `<li>${x}</li>`).join("")}</ul>
    </div>`;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
  renderAll();
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  save();
  renderAll();
  const r = allRecipes.find(x => x.id === id);
  if (document.getElementById("modal").classList.contains("open") && r) openRecipe(r);
}

function addIngredientsToShoppingById(id) {
  const r = allRecipes.find(x => x.id === id);
  addIngredientsToShopping(r);
}

function addIngredientsToShopping(r) {
  if (!r) return;
  (r.ingredients || []).forEach(item => {
    if (!shopping.some(s => s.text === item)) shopping.push({ text: item, done: false });
  });
  save();
  renderShopping();
}

function addManualShop() {
  const input = document.getElementById("manualShopInput");
  const value = input.value.trim();
  if (!value) return;
  value.split(",").map(x => x.trim()).filter(Boolean).forEach(text => shopping.push({ text, done: false }));
  input.value = "";
  save();
  renderShopping();
}

function renderShopping() {
  const box = document.getElementById("shoppingList");
  box.innerHTML = shopping.map((item, i) => `
    <div class="shop-item ${item.done ? "done" : ""}">
      <input type="checkbox" ${item.done ? "checked" : ""} onchange="toggleShop(${i})">
      <span>${item.text}</span>
      <button class="ghost" onclick="removeShop(${i})">×</button>
    </div>`).join("") || `<p class="muted">Список пуст. Магазин пока не знает, что ты существуешь.</p>`;
}

function toggleShop(i) { shopping[i].done = !shopping[i].done; save(); renderShopping(); }
function removeShop(i) { shopping.splice(i,1); save(); renderShopping(); }

function runFridgeSearch() {
  const items = document.getElementById("fridgeInput").value.toLowerCase().split(",").map(x => x.trim()).filter(Boolean);
  const scored = allRecipes.map(r => {
    const hay = [r.title, ...(r.ingredients || []), ...(r.category || [])].join(" ").toLowerCase();
    const score = items.reduce((s, it) => s + (hay.includes(it) ? 1 : 0), 0);
    return { r, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).map(x => x.r);
  renderGrid(scored, "fridgeResults");
}

function addUserRecipe() {
  const title = document.getElementById("newTitle").value.trim();
  if (!title) return alert("Название нужно. Без имени рецепт как кот без наглости.");
  const r = normalizeRecipe({
    id: `u_${Date.now()}`,
    title,
    category: document.getElementById("newCategories").value.split(",").map(x => x.trim()).filter(Boolean),
    time: document.getElementById("newTime").value || "25 мин",
    image: document.getElementById("newImage").value.trim(),
    ingredients: document.getElementById("newIngredients").value.split("\n").map(x => x.trim()).filter(Boolean),
    steps: document.getElementById("newSteps").value.split("\n").map(x => x.trim()).filter(Boolean),
    badges: ["✍️ user recipe"]
  }, 0);
  const user = JSON.parse(localStorage.getItem("cf_user_recipes_v8") || "[]");
  user.push(r);
  localStorage.setItem("cf_user_recipes_v8", JSON.stringify(user));
  allRecipes.push(r);
  recipes = [...allRecipes];
  renderCategories();
  renderDaily();
  renderSmartFilters();
  renderRecent();
  renderTrending();
  renderAll();
  alert("Рецепт добавлен. Ты шеф, просто пока без белого колпака.");
}

function importRecipes() {
  try {
    const raw = document.getElementById("importJson").value;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("not array");
    const user = JSON.parse(localStorage.getItem("cf_user_recipes_v8") || "[]");
    const normalized = arr.map(normalizeRecipe);
    localStorage.setItem("cf_user_recipes_v8", JSON.stringify([...user, ...normalized]));
    allRecipes = [...allRecipes, ...normalized];
    renderCategories();
    renderAll();
    alert(`Импортировано: ${normalized.length}`);
  } catch {
    alert("JSON кривой. Он старался, но не смог.");
  }
}

function shareRecipe(id) {
  const r = allRecipes.find(x => x.id === id);
  if (!r) return;
  const text = `${r.title}\n\nИнгредиенты:\n${(r.ingredients || []).join("\n")}\n\nКак готовить:\n${(r.steps || []).join("\n")}`;
  if (navigator.share) {
    navigator.share({ title: r.title, text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Рецепт скопирован. Распространяй кулинарное безумие.");
  }
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById("heroSection")?.classList.toggle("hidden", tab !== "home");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  ["homeSection","favoritesSection","cookAgainSection","fridgeSection","shoppingSection","addSection"].forEach(id => document.getElementById(id).classList.add("hidden"));
  document.querySelector(".mood-panel").classList.toggle("hidden", tab !== "home");
  document.querySelector(".top-actions").classList.toggle("hidden", tab !== "home");
  document.getElementById("categoryRow").classList.toggle("hidden", tab !== "home");
  document.getElementById("dailyPanel").classList.toggle("hidden", tab !== "home");
  document.getElementById("smartFilters").classList.toggle("hidden", tab !== "home");
  document.querySelector(".craving-panel").classList.toggle("hidden", tab !== "home");

  const map = {
    home: "homeSection",
    favorites: "favoritesSection",
    cook: "cookAgainSection",
    fridge: "fridgeSection",
    shopping: "shoppingSection",
    add: "addSection"
  };
  document.getElementById(map[tab]).classList.remove("hidden");
  if (tab === "favorites") {
    renderGrid(allRecipes.filter(r => favorites.includes(r.id)), "favoritesGrid");
    renderRecent();
  }
  if (tab === "cook") renderCookAgainGrid();
  if (tab === "shopping") renderShopping();
}

function pickRandom(list) {
  if (!list || !list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}


function renderDaily() {
  const box = document.getElementById("dailyPanel");
  if (!box || !allRecipes.length) return;
  const key = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed += key.charCodeAt(i);
  const prefs = JSON.parse(localStorage.getItem("cf_prefs_v8") || "[]").join(" ").toLowerCase();
  const preferred = allRecipes.filter(r => {
    const hay = [r.title, ...(r.category || [])].join(" ").toLowerCase();
    return !prefs || prefs.split(" ").some(p => p && hay.includes(p.replace(/[^\wа-яА-ЯёЁ]/g, "")));
  });
  const pool = preferred.length ? preferred : allRecipes;
  const r = pool[seed % pool.length];
  box.innerHTML = `
    <div class="daily-card" onclick="openRecipeById('${r.id}')">
      <div class="daily-emoji">${getEmoji(r)}</div>
      <div>
        <div class="eyebrow">Рецепт дня</div>
        <div class="daily-title">${r.title}</div>
        <div class="muted">${r.time} · ${r.heat} · ${explainDaily(r)}</div>
      </div>
    </div>`;
}

function explainDaily(r) {
  const cats = r.category || [];
  if (cats.includes("быстро")) return "без кухонного подвига";
  if (cats.includes("курица") || cats.includes("мясо") || cats.includes("рыба")) return "нормально по белку";
  if (cats.includes("паста")) return "comfort food, как терапия, только дешевле";
  return "просто хорошая идея на сегодня";
}

function renderSmartFilters() {
  document.querySelectorAll(".smart").forEach(b => b.classList.toggle("active", b.dataset.smart === currentSmart));
}

function miniCardHtml(r) {
  return `<div class="mini-card" onclick="openRecipeById('${r.id}')">
    <div class="mini-img">${getEmoji(r)}</div>
    <div class="mini-body">
      <div class="mini-title">${r.title}</div>
      <div class="mini-meta">${r.time}</div>
    </div>
  </div>`;
}

function renderRecent() {
  const panel = document.getElementById("recentPanel");
  const box = document.getElementById("recentGrid");
  if (!panel || !box) return;
  const list = recent.map(id => allRecipes.find(r => r.id === id)).filter(Boolean).slice(0, 10);
  panel.classList.toggle("hidden", list.length === 0);
  box.innerHTML = list.map(miniCardHtml).join("") || `<p class="muted">Пока пусто. Посмотри пару рецептов — и я начну запоминать.</p>`;
}


function renderCookAgainGrid() {
  const list = [...allRecipes]
    .sort((a,b) => (cookStats[b.id] || 0) - (cookStats[a.id] || 0))
    .filter(r => (cookStats[r.id] || 0) > 0)
    .slice(0, 40);
  const fallback = allRecipes
    .filter(r => (r.badges || []).some(b => b.includes("быстро") || b.includes("comfort") || b.includes("уют")))
    .slice(0, 30);
  renderGrid(list.length ? list : fallback, "trendingGrid");
}

function runCravingSearch() {
  const q = document.getElementById("cravingInput").value.toLowerCase().trim();
  const box = document.getElementById("cravingResult");
  if (!q) {
    box.innerHTML = `<p class="muted">Напиши желание. Например: “суп”, “сладкое”, “сырное”.</p>`;
    return;
  }
  const results = [...allRecipes]
    .map(r => ({ r, score: cravingScore(r, q) }))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, 12)
    .map(x => x.r);
  box.innerHTML = results.length
    ? results.map(miniCardHtml).join("")
    : `<p class="muted">Ничего не нашла. Еда спряталась. Попробуй: “сладкое”, “суп”, “курица”.</p>`;
}

function cravingScore(r, q) {
  const hay = [r.title, ...(r.category || []), ...(r.ingredients || []), ...(r.steps || []), ...(r.badges || []), r.mood || ""].join(" ").toLowerCase();
  const synonyms = {
    "сладкое": ["слад", "десерт", "панкейк", "олад", "блин", "овсян", "творож", "банан", "шоколад", "ягод"],
    "суп": ["суп", "бульон", "крем-суп", "том ям", "рамен"],
    "сырное": ["сыр", "слив", "альфредо", "гратен", "жульен"],
    "легкое": ["салат", "овощ", "рыба", "тунец", "авокадо"],
    "быстро": ["быстро", "тост", "омлет", "сэндвич", "15 мин", "20 мин"],
    "мясо": ["мяс", "говядин", "бекон", "котлет", "бургер"],
    "курица": ["кур", "бедра", "наггет"],
    "рыба": ["рыб", "лосос", "тунец", "кревет"],
    "паста": ["паста", "спагетти", "макароны", "карбонара"],
    "завтрак": ["завтрак", "яйц", "омлет", "тост", "овсян", "сырник", "блин"]
  };
  let score = 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  tokens.forEach(t => { if (hay.includes(t)) score += 3; });
  Object.entries(synonyms).forEach(([key, arr]) => {
    if (q.includes(key)) arr.forEach(w => { if (hay.includes(w)) score += 2; });
  });
  if (q.includes("без мяса") && !hay.includes("мяс") && !hay.includes("кур") && !hay.includes("бекон") && !hay.includes("говядин")) score += 4;
  return score;
}


function renderTrending() {
  renderCookAgainGrid();
}

function startTimer(minutes) {
  stopTimer();
  let seconds = minutes * 60;
  const display = document.getElementById("timerDisplay");
  const tick = () => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    if (display) display.textContent = `${m}:${s}`;
    if (seconds <= 0) {
      stopTimer();
      if (display) display.textContent = "Готово!";
      try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch(e) {}
      return;
    }
    seconds--;
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}


window.openRecipeById = openRecipeById;
window.toggleFavorite = toggleFavorite;
window.addIngredientsToShoppingById = addIngredientsToShoppingById;
window.shareRecipe = shareRecipe;
window.toggleShop = toggleShop;
window.removeShop = removeShop;
window.startTimer = startTimer;
window.stopTimer = stopTimer;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js?v=12").catch(() => {});
}

loadRecipes();
