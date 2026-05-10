const grid = document.getElementById('recipesGrid');
const filtersWrap = document.getElementById('filters');
const randomBtn = document.getElementById('randomBtn');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('recipeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalTags = document.getElementById('modalTags');
const modalIngredients = document.getElementById('modalIngredients');
const modalSteps = document.getElementById('modalSteps');
const modalTips = document.getElementById('modalTips');
const favoriteBtn = document.getElementById('favoriteBtn');

let recipes = [];
let activeFilter = 'все';
let activeRecipeId = null;
let favorites = JSON.parse(localStorage.getItem('cozyFoodieFavorites') || '[]');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
}

function recipeId(recipe) {
  return recipe.id || recipe.title.toLowerCase().replace(/[^а-яa-z0-9]+/gi, '-').replace(/^-|-$/g, '');
}

async function init() {
  try {
    const response = await fetch(`recipes.json?v=3-${Date.now()}`);
    recipes = await response.json();
    buildFilters();
    renderRecipes();
  } catch (error) {
    grid.innerHTML = `<div class="empty">Не смогла загрузить рецепты. GitHub опять душнит.</div>`;
    console.error(error);
  }
}

function allCategories() {
  const categories = new Set(['все', 'избранное']);
  recipes.forEach(recipe => (recipe.category || []).forEach(cat => categories.add(cat)));
  return Array.from(categories);
}

function buildFilters() {
  filtersWrap.innerHTML = allCategories().map(cat => `<button class="filter-btn ${cat === activeFilter ? 'active' : ''}" data-filter="${cat}" type="button">${cat}</button>`).join('');
  filtersWrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      buildFilters();
      renderRecipes();
    });
  });
}

function filteredRecipes() {
  const query = searchInput.value.trim().toLowerCase();
  return recipes.filter(recipe => {
    const id = recipeId(recipe);
    const haystack = [recipe.title, ...(recipe.category || []), ...(recipe.ingredients || []), ...(recipe.steps || [])].join(' ').toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFilter = activeFilter === 'все' || (activeFilter === 'избранное' ? favorites.includes(id) : (recipe.category || []).includes(activeFilter));
    return matchesQuery && matchesFilter;
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
}

function renderRecipes() {
  const list = filteredRecipes();
  if (!list.length) {
    grid.innerHTML = `<div class="empty">Ничего не нашлось. Холодильник тоже иногда молчит.</div>`;
    return;
  }

  grid.innerHTML = list.map(recipe => {
    const id = recipeId(recipe);
    const isFav = favorites.includes(id);
    return `<article class="recipe-card">
      <img class="recipe-image" src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.title)}" loading="lazy" />
      <div class="recipe-content">
        <h2 class="recipe-title">${escapeHtml(recipe.title)}</h2>
        <p class="recipe-meta">⏱ ${escapeHtml(recipe.time)} · 🔥 ${escapeHtml(recipe.heat)}<br>🍽 ${escapeHtml(recipe.portions)} · ${escapeHtml(recipe.difficulty)}</p>
        <div class="tags">${(recipe.category || []).slice(0,3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="card-actions">
          <button class="open-btn" data-open="${escapeHtml(id)}" type="button">Открыть</button>
          <button class="heart-btn ${isFav ? 'active' : ''}" data-heart="${escapeHtml(id)}" type="button">${isFav ? '♥' : '♡'}</button>
        </div>
      </div>
    </article>`;
  }).join('');

  grid.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => openRecipe(btn.dataset.open)));
  grid.querySelectorAll('[data-heart]').forEach(btn => btn.addEventListener('click', () => toggleFavorite(btn.dataset.heart)));
}

function openRecipe(id) {
  const recipe = recipes.find(item => recipeId(item) === id);
  if (!recipe) return;

  activeRecipeId = id;
  modalImage.src = recipe.image;
  modalImage.alt = recipe.title;
  modalTitle.textContent = recipe.title;
  modalMeta.textContent = `⏱ ${recipe.time} · 🔥 ${recipe.heat} · 🍽 ${recipe.portions} · ${recipe.difficulty}`;
  modalTags.innerHTML = (recipe.category || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  modalIngredients.innerHTML = (recipe.ingredients || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
  modalSteps.innerHTML = (recipe.steps || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
  modalTips.textContent = recipe.tip || '💡 Если что-то начало гореть — убавь огонь. Это не слабость, это стратегия.';
  updateFavoriteButton();
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeRecipe() {
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  localStorage.setItem('cozyFoodieFavorites', JSON.stringify(favorites));
  updateFavoriteButton();
  renderRecipes();
}

function updateFavoriteButton() {
  if (!activeRecipeId) return;
  const isFav = favorites.includes(activeRecipeId);
  favoriteBtn.textContent = isFav ? '♥' : '♡';
  favoriteBtn.classList.toggle('active', isFav);
}

randomBtn.addEventListener('click', () => {
  const list = filteredRecipes().length ? filteredRecipes() : recipes;
  if (!list.length) return;
  const recipe = list[Math.floor(Math.random() * list.length)];
  openRecipe(recipeId(recipe));
});
searchInput.addEventListener('input', renderRecipes);
favoriteBtn.addEventListener('click', () => activeRecipeId && toggleFavorite(activeRecipeId));
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeRecipe));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeRecipe(); });

init();
