(async function(){
  try {
    const res = await fetch("recipes-v15.json?v=webstable15-expanded-recipes");
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return;
    recipes = data.map((r, i) => typeof normalizeRecipe === "function" ? normalizeRecipe(r, i) : r);
    allRecipes = [...recipes, ...(typeof getUserRecipes === "function" ? getUserRecipes() : [])];
    activeScenario = null;
    currentFilter = "all";
    visibleCount = 30;
    document.querySelectorAll(".chip").forEach(b => b.classList.toggle("active", b.dataset.filter === "all"));
    document.querySelectorAll(".quick-wishes button").forEach(b => b.classList.remove("active"));
    const hint = document.getElementById("wishHint");
    if (hint) hint.innerHTML = "<span>Лиса советует:</span> база расширена — теперь выбор еды стал менее драматичным и более вкусным.";
    if (typeof renderAll === "function") renderAll();
    if (typeof updateFloatingRandom === "function") updateFloatingRandom();
  } catch (e) {
    console.warn("v15 recipes loader fallback", e);
  }
})();
