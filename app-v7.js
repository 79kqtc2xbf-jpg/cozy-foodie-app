const BASE_RECIPES_URL = 'recipes.json?v=7';
const app = document.getElementById('app');
const bottomNav = document.getElementById('bottomNav');
let recipes = [];
let tab = 'home';
let active = 'все';
let query = '';
let fridge = '';
let mood = localStorage.getItem('cf_mood') || '';

const store = {
  fav: JSON.parse(localStorage.getItem('cf_fav') || '[]'),
  custom: JSON.parse(localStorage.getItem('cf_custom') || '[]'),
  shop: JSON.parse(localStorage.getItem('cf_shop') || '[]'),
  prefs: JSON.parse(localStorage.getItem('cf_prefs') || 'null')
};

const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е');
const imgFor = title => `https://source.unsplash.com/900x900/?${encodeURIComponent(title + ', food')}`;
const save = () => {
  localStorage.setItem('cf_fav', JSON.stringify(store.fav));
  localStorage.setItem('cf_custom', JSON.stringify(store.custom));
  localStorage.setItem('cf_shop', JSON.stringify(store.shop));
  localStorage.setItem('cf_prefs', JSON.stringify(store.prefs));
  localStorage.setItem('cf_mood', mood);
};

async function init() {
  try { recipes = await fetch(BASE_RECIPES_URL).then(r => r.json()); } catch (e) { recipes = []; }
  recipes = [...recipes, ...store.custom];
  render();
  if (!store.prefs) onboarding();
}

function cats() { return ['все', 'избранное', 'завтрак', 'быстро', 'мясо', 'ужин', 'паста', 'рыба', 'полезное', 'курица']; }
const catIcon = c => ({'все':'✨','избранное':'❤️','завтрак':'🍳','быстро':'⚡','мясо':'🥩','ужин':'🌙','паста':'🍝','рыба':'🐟','полезное':'🥗','курица':'🍗'}[c] || '🍽️');
const moodMap = {
  tired: {label:'😵 устала', words:['быстро','завтрак','курица'], reason:'минимум возни, максимум шансов не лечь на пол кухни'},
  sad: {label:'🥺 грустно', words:['ужин','паста','мясо'], reason:'уютная еда, которая обнимает лучше, чем новости'},
  energy: {label:'⚡ хочу энергию', words:['курица','полезное','быстро'], reason:'белок и нормальная еда, а не жизнь на кофе'},
  cozy: {label:'🍷 хочу комфорт', words:['ужин','паста'], reason:'вкусно, тепло, без кулинарного героизма'}
};

function recipeText(r) { return norm([r.title, ...(r.category||[]), ...(r.ingredients||[]), ...(r.steps||[])].join(' ')); }
function matches(r) {
  const hay = recipeText(r);
  const q = norm(query).trim();
  const catOk = active === 'все' || (active === 'избранное' ? store.fav.includes(r.id) : (r.category || []).map(norm).includes(norm(active)));
  return catOk && (!q || q.split(/[ ,]+/).filter(Boolean).every(w => hay.includes(w)));
}
function filtered() { let list = recipes.filter(matches); if (tab === 'fav') list = list.filter(r => store.fav.includes(r.id)); return list; }
function fridgeMatches() {
  const words = norm(fridge).split(/[,\.\n]+/).map(x => x.trim()).filter(Boolean);
  if (!words.length) return [];
  return recipes.map(r => {
    const hay = recipeText(r);
    const score = words.filter(w => hay.includes(w)).length;
    return {...r, _score: score};
  }).filter(r => r._score > 0).sort((a,b) => b._score - a._score);
}
function stats(r) {
  const t = recipeText(r);
  const out = [];
  if (t.includes('куриц') || t.includes('яйц') || t.includes('фарш') || t.includes('лосос')) out.push('💪 белок');
  if (t.includes('быстро') || parseInt(r.time) <= 20) out.push('⚡ быстро');
  if (t.includes('овощ') || t.includes('салат') || t.includes('полез')) out.push('🥦 полезно');
  if (t.includes('паста') || t.includes('сыр') || t.includes('бекон')) out.push('🫶 comfort');
  return out.slice(0,4);
}
function moodSuggestion() {
  if (!mood) return null;
  const m = moodMap[mood];
  const ranked = recipes.map(r => {
    const hay = recipeText(r);
    const score = m.words.filter(w => hay.includes(w)).length;
    return {...r, _score: score};
  }).sort((a,b) => b._score - a._score);
  return ranked[0] || recipes[0];
}

function nav() {
  const items = [['home','🏠','Главная'],['fav','❤️','Избранное'],['fridge','🥕','Дома'],['shop','🛒','Список'],['add','➕','Добавить']];
  bottomNav.innerHTML = items.map(i => `<button class="nav-btn ${tab===i[0]?'active':''}" onclick="tab='${i[0]}';render()"><span>${i[1]}</span>${i[2]}</button>`).join('');
}
function render() {
  nav(); app.className = 'app';
  app.innerHTML = `${hero()}${tab === 'add' ? addForm() : tab === 'shop' ? shopping() : mainContent()}<div id="modal" class="modal"></div>`;
}
function hero() { return `<section class="hero"><div class="eyebrow">уютный рандомайзер еды</div><h1>Cozy Foodie</h1><p>Нажми кнопку — и приложение решит, что готовить. Без экзистенциального кризиса у холодильника.</p><button class="random" onclick="openRecipe(randomRecipe())">🎲 Случайный рецепт</button></section>`; }
function mainContent() { return `${tab !== 'fridge' ? controls() : ''}${tab === 'fridge' ? fridgeBox() : ''}${tab === 'home' ? moodBlock() + categoryCards() + fridgeMini() + grid(filtered()) : ''}${tab === 'fav' ? grid(filtered()) : ''}${tab === 'fridge' ? grid(fridgeMatches()) : ''}`; }
function controls() { return `<div class="top-actions"><input class="search" placeholder="Поиск: паста, курица, яйца..." value="${query}" oninput="query=this.value;render()"></div>`; }
function categoryCards() { return `<div class="category-row">${cats().filter(c => c !== 'избранное').map(c => { const count = c === 'все' ? recipes.length : recipes.filter(r => (r.category || []).map(norm).includes(norm(c))).length; return `<div class="cat-card ${active===c?'active':''}" onclick="active='${c}';render()"><div class="cat-icon">${catIcon(c)}</div><div class="cat-title">${c}</div><div class="cat-count">${count} рецептов</div></div>`; }).join('')}</div>`; }
function moodBlock() {
  const s = moodSuggestion(); const m = mood ? moodMap[mood] : null;
  return `<section class="section"><h2>Что приготовить по настроению?</h2><p class="muted">Выбери состояние — я подкину рецепт. Пока без настоящего AI, но уже с заботой и лёгкой наглостью.</p><div class="mood-grid">${Object.entries(moodMap).map(([k,v]) => `<button class="mood ${mood===k?'on':''}" onclick="mood='${k}';save();render()">${v.label}</button>`).join('')}</div>${s ? `<div class="suggest-card" onclick="openRecipeById('${s.id}')"><img src="${s.image || imgFor(s.title)}" onerror="this.src='https://placehold.co/900x900/19191d/f5f5f7?text=Cozy+Foodie'"><div><div class="small">Сегодня тебе подходит</div><div class="suggest-title">${s.title}</div><div class="muted">Потому что ${m.reason}.</div><div class="badges">${stats(s).map(x => `<span class="badge">${x}</span>`).join('')}</div></div></div>` : ''}</section>`;
}
function fridgeMini() { return `<section class="section"><h2>Что есть дома?</h2><p class="muted">Впиши продукты через запятую — покажу, что можно приготовить.</p><textarea class="fridge-input" placeholder="например: яйца, сыр, бекон, паста" oninput="fridge=this.value">${fridge}</textarea><button class="primary" onclick="tab='fridge';render()">🔎 Найти рецепты</button></section>`; }
function fridgeBox() { return `${controls()}<section class="section"><h2>Что есть дома?</h2><p class="muted">Чем больше продуктов совпало, тем выше рецепт в выдаче.</p><textarea class="fridge-input" placeholder="например: курица, рис, сыр" oninput="fridge=this.value;render()">${fridge}</textarea><p class="results-note">Найдено: ${fridgeMatches().length}</p></section>`; }
function grid(list) { if (!list.length) return `<p class="results-note">Пока пусто. Либо рецептов мало, либо холодильник сегодня загадочный.</p>`; return `<section class="grid">${list.map(card).join('')}</section>`; }
function card(r) { return `<article class="card" onclick="openRecipeById('${r.id}')"><button class="heart ${store.fav.includes(r.id)?'on':''}" onclick="event.stopPropagation();toggleFav('${r.id}')">${store.fav.includes(r.id)?'♥':'♡'}</button><button class="tiny-btn quick-add" title="В список" onclick="event.stopPropagation();addRecipeToShop('${r.id}')">🛒</button><img src="${r.image || imgFor(r.title)}" onerror="this.src='https://placehold.co/900x900/19191d/f5f5f7?text=Cozy+Foodie'" alt=""><div class="card-body"><h3>${r.title}</h3><div class="meta">⏱ ${r.time} · 🔥 ${r.heat}<br>🍽 ${r.portions} · ${r.difficulty}</div><div class="badges">${stats(r).map(x => `<span class="badge">${x}</span>`).join('')}</div><div class="tags">${(r.category || []).slice(0,3).map(t => `<span class="tag">${t}</span>`).join('')}</div></div></article>`; }
function openRecipeById(id) { openRecipe(recipes.find(r => r.id === id)); }
function openRecipe(r) { if (!r) return; const m = document.getElementById('modal'); m.classList.add('open'); m.innerHTML = `<button class="close" onclick="closeModal()">×</button><div class="modal-card"><img class="modal-img" src="${r.image || imgFor(r.title)}" onerror="this.src='https://placehold.co/1200x700/19191d/f5f5f7?text=Cozy+Foodie'"><div class="modal-content"><div class="modal-actions"><button class="ghost" onclick="toggleFav('${r.id}');openRecipeById('${r.id}')">${store.fav.includes(r.id)?'♥ В избранном':'♡ В избранное'}</button><button class="primary" onclick="addRecipeToShop('${r.id}')">🛒 В список покупок</button></div><h2>${r.title}</h2><div class="meta">⏱ ${r.time} · 🔥 ${r.heat} · 🍽 ${r.portions} · ${r.difficulty}</div><div class="badges">${stats(r).map(x => `<span class="badge">${x}</span>`).join('')}</div><div class="tags">${(r.category || []).map(t => `<span class="tag">${t}</span>`).join('')}</div><h3>Ингредиенты</h3><ul>${(r.ingredients || []).map(x => `<li>${x}</li>`).join('')}</ul><h3>Как готовить</h3><ol>${(r.steps || []).map(x => `<li>${x}</li>`).join('')}</ol></div></div>`; }
function closeModal() { document.getElementById('modal').classList.remove('open'); }
function toggleFav(id) { store.fav = store.fav.includes(id) ? store.fav.filter(x => x !== id) : [...store.fav, id]; save(); render(); }
function randomRecipe() { const list = filtered().length ? filtered() : recipes; return list[Math.floor(Math.random() * list.length)]; }
function addRecipeToShop(id) { const r = recipes.find(x => x.id === id); if (!r) return; (r.ingredients || []).forEach(name => store.shop.push({id: Date.now() + Math.random(), name, done: false, recipe: r.title})); save(); alert('Ингредиенты добавлены в список. Магазин морально готовится.'); render(); }
function shopping() { return `<section class="section"><h2>Список покупок</h2><p class="muted">Добавляй ингредиенты из рецептов или вручную. Галочка — куплено, мозг свободен.</p><div class="top-actions"><input id="manualShop" class="manual-input" placeholder="например: сыр — 200 г"><button class="primary" onclick="addManualShop()">Добавить</button></div><div class="shopping-list">${store.shop.length ? store.shop.map(item => `<div class="shop-item ${item.done?'done':''}" onclick="toggleShop('${item.id}')"><span>${item.done?'✅':'⬜'}</span><div><b>${item.name}</b><div class="small">${item.recipe || 'вручную'}</div></div><button class="secondary" onclick="event.stopPropagation();deleteShop('${item.id}')">×</button></div>`).join('') : '<p class="results-note">Пусто. Либо всё куплено, либо ты всё ещё надеешься на магию холодильника.</p>'}</div><br><button class="secondary" onclick="clearDoneShop()">Очистить купленное</button></section>`; }
function addManualShop(){ const el = document.getElementById('manualShop'); const name = el.value.trim(); if(!name)return; store.shop.push({id:String(Date.now()),name,done:false,recipe:'вручную'}); save(); render(); }
function toggleShop(id){ const it=store.shop.find(x=>String(x.id)===String(id)); if(it)it.done=!it.done; save(); render(); }
function deleteShop(id){ store.shop=store.shop.filter(x=>String(x.id)!==String(id)); save(); render(); }
function clearDoneShop(){ store.shop=store.shop.filter(x=>!x.done); save(); render(); }
function addForm(){ return `<section class="section form"><h2>Добавить свой рецепт</h2><p class="muted">Картинку можно вставить ссылкой. Если пусто — попробуем найти фото автоматически по названию.</p><input id="t" placeholder="Название"><input id="cat" placeholder="Категории через запятую: ужин, курица"><input id="time" placeholder="Время: 25 мин"><input id="heat" placeholder="Огонь: 5 из 9"><input id="portions" placeholder="Порции: 2 порц."><input id="diff" placeholder="Сложность: легко"><input id="image" placeholder="Ссылка на картинку, можно пусто"><textarea id="ing" class="textarea" placeholder="Ингредиенты, каждый с новой строки"></textarea><textarea id="steps" class="textarea" placeholder="Шаги, каждый с новой строки. Можно с шутками, мы тут не в санатории."></textarea><button class="primary" onclick="addRecipe()">Сохранить рецепт</button><div class="import-box"><h2>Импорт пачкой</h2><p class="muted">Вставь JSON-массив рецептов. Потом сделаем импорт из Notion/Google Sheets.</p><textarea id="importJson" class="textarea" placeholder='[{"title":"...","ingredients":["..."],"steps":["..."]}]'></textarea><button class="secondary" onclick="importRecipes()">Импортировать</button></div></section>`; }
function addRecipe(){ const g=id=>document.getElementById(id).value.trim(); const title=g('t'); if(!title)return alert('Название обязательно, иначе что мы вообще готовим?'); const r={id:'user-'+Date.now(),title,category:g('cat').split(',').map(x=>x.trim()).filter(Boolean),time:g('time')||'—',heat:g('heat')||'—',portions:g('portions')||'—',difficulty:g('diff')||'—',image:g('image')||imgFor(title),ingredients:g('ing').split('\n').map(x=>x.trim()).filter(Boolean),steps:g('steps').split('\n').map(x=>x.trim()).filter(Boolean)}; store.custom.push(r); save(); recipes.push(r); tab='home'; render(); }
function importRecipes(){ try{ const arr=JSON.parse(document.getElementById('importJson').value); if(!Array.isArray(arr))throw new Error(); const fixed=arr.map((r,i)=>({id:r.id||'imp-'+Date.now()+'-'+i,title:r.title||'Безымянный рецепт',category:r.category||['ужин'],time:r.time||'—',heat:r.heat||'—',portions:r.portions||'—',difficulty:r.difficulty||'—',image:r.image||imgFor(r.title||'food'),ingredients:r.ingredients||[],steps:r.steps||[]})); store.custom.push(...fixed); recipes.push(...fixed); save(); tab='home'; render(); }catch(e){ alert('JSON не съелся. Он должен быть массивом рецептов.'); } }
function onboarding(){ const prefs=['🥩 мясо','🍗 курица','🐟 рыба','🥗 полезное','⚡ быстрое','🍝 паста','🍳 завтрак','🌙 ужин']; const div=document.createElement('div'); div.className='onboarding'; div.innerHTML=`<div class="on-card"><h2>Что ты любишь?</h2><p class="muted">Выбери пару направлений — потом сделаем персональные рекомендации. Пока это база для будущего AI-блока.</p><div class="pref-grid">${prefs.map(p=>`<button class="pref" onclick="this.classList.toggle('on')">${p}</button>`).join('')}</div><button class="primary" onclick="finishOnboarding()">Готово, кормите меня</button></div>`; document.body.appendChild(div); }
function finishOnboarding(){ const chosen=[...document.querySelectorAll('.pref.on')].map(x=>x.textContent); store.prefs=chosen; save(); document.querySelector('.onboarding').remove(); }
init();
