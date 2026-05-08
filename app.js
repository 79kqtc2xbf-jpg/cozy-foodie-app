let recipes = [];
let activeCategory = 'все';
const grid = document.getElementById('recipeGrid');
const filters = document.getElementById('filters');
const dialog = document.getElementById('recipeDialog');
const detail = document.getElementById('recipeDetail');

async function loadRecipes(){
  const res = await fetch('recipes.json');
  recipes = await res.json();
  renderFilters();
  renderGrid();
}
function categories(){ return ['все', ...Array.from(new Set(recipes.flatMap(r=>r.category)))]; }
function filtered(){ return activeCategory === 'все' ? recipes : recipes.filter(r=>r.category.includes(activeCategory)); }
function renderFilters(){
  filters.innerHTML = categories().map(c=>`<button class="chip ${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join('');
  filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat; renderFilters(); renderGrid();});
}
function renderGrid(){
  grid.innerHTML = filtered().map(r=>`<article class="card"><img src="${r.image}" alt="${r.title}"><div class="card-body"><h2>${r.title}</h2><div class="meta">⏱ ${r.timeMinutes} мин · 🔥 ${r.heat}<br>🍽 ${r.servings} порц. · ${r.difficulty}</div><div class="tags">${r.category.map(t=>`<span class="tag">${t}</span>`).join('')}</div><button class="open" data-id="${r.id}">Открыть рецепт</button></div></article>`).join('');
  grid.querySelectorAll('.open').forEach(b=>b.onclick=()=>openRecipe(b.dataset.id));
}
function openRecipe(id){
  const r = recipes.find(x=>x.id===id);
  detail.innerHTML = `<section class="detail"><img src="${r.image}" alt="${r.title}"><h2>${r.title}</h2><p class="meta">⏱ ${r.timeMinutes} мин · 🔥 ${r.heat} · 🍽 ${r.servings} порц. · ${r.difficulty}</p><div class="columns"><div class="box"><h3>Ингредиенты</h3><ul>${r.ingredients.map(i=>`<li>${i}</li>`).join('')}</ul></div><div class="box"><h3>Как готовить</h3><ol>${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h3>Не накосячить</h3><ul>${r.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div></div></section>`;
  dialog.showModal();
}
document.getElementById('randomBtn').onclick = () => { const list = filtered(); openRecipe(list[Math.floor(Math.random()*list.length)].id); };
document.getElementById('closeDialog').onclick = () => dialog.close();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
loadRecipes();
