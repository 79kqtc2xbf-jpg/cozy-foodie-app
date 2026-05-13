const CF22_STOCK_PHOTOS = {
  v15_001: "https://source.unsplash.com/1200x900/?syrniki,cheese-pancakes",
  v15_002: "https://images.pexels.com/photos/15076696/pexels-photo-15076696.jpeg?auto=compress&cs=tinysrgb&w=1200",
  v15_003: "https://source.unsplash.com/1200x900/?meatballs,mashed-potatoes",
  v15_005: "https://images.pexels.com/photos/34326230/pexels-photo-34326230.jpeg?auto=compress&cs=tinysrgb&w=1200",
  v15_006: "https://source.unsplash.com/1200x900/?creamy-chicken-pasta",
  v15_007: "https://images.pexels.com/photos/5848057/pexels-photo-5848057.jpeg?auto=compress&cs=tinysrgb&w=1200",
  v15_008: "https://source.unsplash.com/1200x900/?dumplings,sour-cream",
  v15_010: "https://images.pexels.com/photos/7368044/pexels-photo-7368044.jpeg?auto=compress&cs=tinysrgb&w=1200",
  v15_011: "https://images.pexels.com/photos/32021301/pexels-photo-32021301.jpeg?auto=compress&cs=tinysrgb&w=1200"
};

const CF22_PHOTO_META = {
  v15_001: {source: "Unsplash Source", status: "stock_search_url", note: "syrniki / cheese pancakes"},
  v15_002: {source: "Pexels", status: "approved_stock", note: "omelette breakfast bacon"},
  v15_003: {source: "Unsplash Source", status: "stock_search_url", note: "meatballs mashed potatoes"},
  v15_005: {source: "Pexels", status: "approved_stock", note: "chicken noodle soup"},
  v15_006: {source: "Unsplash Source", status: "stock_search_url", note: "creamy chicken pasta"},
  v15_007: {source: "Pexels", status: "approved_stock", note: "chicken cheese wrap"},
  v15_008: {source: "Unsplash Source", status: "stock_search_url", note: "dumplings sour cream"},
  v15_010: {source: "Pexels", status: "approved_stock", note: "potatoes mushrooms"},
  v15_011: {source: "Pexels", status: "approved_stock", note: "cottage cheese berries dessert"}
};

function cf22ApplyStockPhoto(recipe) {
  if (!recipe || !recipe.id) return recipe;
  const photo = CF22_STOCK_PHOTOS[recipe.id];
  if (!photo) return recipe;
  return {
    ...recipe,
    image: photo,
    photoSource: CF22_PHOTO_META[recipe.id]?.source || "stock",
    photoStatus: CF22_PHOTO_META[recipe.id]?.status || "approved_stock"
  };
}

(function applyPhotoTestStock(){
  if (window.CF22_PHOTO_TEST_STOCK_APPLIED) return;
  window.CF22_PHOTO_TEST_STOCK_APPLIED = true;
  window.CF22_VERSION = "webstable22-photo-test-stock";

  if (typeof normalizeRecipe === "function") {
    const oldNormalize = window.normalizeRecipe || normalizeRecipe;
    window.normalizeRecipe = function(r, i) {
      return cf22ApplyStockPhoto(oldNormalize(r, i));
    };
  }

  if (Array.isArray(recipes) && recipes.length) {
    recipes = recipes.map(cf22ApplyStockPhoto);
    allRecipes = [...recipes, ...(typeof getUserRecipes === "function" ? getUserRecipes() : [])];
    if (typeof renderAll === "function") renderAll();
    if (typeof updateFloatingRandom === "function") updateFloatingRandom();
  }

  if (document && document.body) document.body.dataset.cozyVersion = window.CF22_VERSION;
  console.info("Cozy Foodie v22 loaded: stock photo test", Object.keys(CF22_STOCK_PHOTOS).length);
})();
