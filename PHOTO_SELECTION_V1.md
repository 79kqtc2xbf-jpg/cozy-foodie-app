# COZY FOODIE — PHOTO SELECTION V1

## 1. Назначение

Этот файл фиксирует первую подборку фото для Cozy Foodie.

Правило этапа: сначала используются реальные открытые фото. Генерация применяется только там, где не найдено подходящее фото в открытых источниках.

## 2. Статусы

- `approved_stock` — реальное фото найдено и предварительно подходит.
- `maybe` — фото можно использовать временно, но лучше поискать ещё.
- `needs_more_search` — нужно продолжить поиск.
- `needs_generation` — подходящее открытое фото не найдено, можно рассматривать AI-генерацию после отдельного подтверждения Лизы.
- `rejected` — фото не подходит.
- `in_app` — фото уже поставлено в приложение.

## 3. Первая десятка рецептов

| Recipe ID | Рецепт | Что искали | Источник | URL | Статус | Комментарий |
|---|---|---|---|---|---|---|
| v15_001 | Сырники без драмы | syrniki / cottage cheese pancakes | Unsplash | https://unsplash.com/photos/golden-brown-cheese-pancakes-stacked-together-u5mpb0eu_9Y | approved_stock | Фото именно похоже на сырники, тёплое и аппетитное. |
| v15_002 | Омлет с сыром и беконом | omelette breakfast bacon | Pixabay | https://pixabay.com/photos/omelette-breakfast-dish-meal-bacon-6600106/ | approved_stock | Ближе к нужному блюду, чем кафе-варианты. Проверить, не слишком ли завтрак-кафе. |
| v15_003 | Пюре с котлетками | fried meatballs mashed potatoes | Pixabay | https://pixabay.com/photos/fried-meatballs-mashed-potatoes-dish-7655627/ | approved_stock | Близко к домашнему пюре с котлетками. |
| v15_004 | Гречка с курицей в сливках | buckwheat chicken creamy sauce | Pixabay / общий поиск | https://pixabay.com/photos/search/buckwheat/ | needs_generation | Точного фото гречка + курица + сливки не найдено. Лучше генерировать после подтверждения. |
| v15_005 | Куриный суп с лапшой | chicken noodle soup | Pexels | https://www.pexels.com/photo/delicious-chicken-noodle-soup-in-natural-light-34326230/ | approved_stock | Хорошее домашнее фото супа с мягким светом. |
| v15_006 | Сливочная паста с курицей | creamy chicken alfredo pasta | Unsplash | https://unsplash.com/photos/chicken-with-a-creamy-sauce-and-roasted-bread-q6AUy_Q7JDw | approved_stock | Визуально подходит, но немного рестораннее. Можно брать как первый вариант. |
| v15_007 | Лаваш с сыром и курицей | chicken cheese wrap | Pexels | https://www.pexels.com/photo/wrap-with-chicken-and-cheese-5848057/ | approved_stock | Подходит как визуальный аналог лаваша с курицей и сыром. |
| v15_008 | Пельмени в сливочном соусе | dumplings sour cream herbs | Unsplash | https://unsplash.com/photos/a-bowl-of-dumplings-with-sour-cream-and-herbs-NSk5izRrz8Q | approved_stock | Близко по вайбу и блюду, лучше вариантов с азиатскими dumplings. |
| v15_010 | Картошка с грибами | potatoes mushrooms rustic | Pexels | https://www.pexels.com/photo/mushrooms-and-potatoes-on-food-7368044/ | approved_stock | Rustic-фото, подходит для картошки с грибами. |
| v15_011 | Творожный десерт с ягодами | cottage cheese berries dessert | Pexels | https://www.pexels.com/photo/fresh-cottage-cheese-with-strawberries-and-kiwi-32021301/ | approved_stock | Хорошее свежее фото творога с ягодами. |

## 4. Решение по первой десятке

Можно переходить к тестовой замене фото для 9 рецептов:

1. v15_001 — Сырники без драмы
2. v15_002 — Омлет с сыром и беконом
3. v15_003 — Пюре с котлетками
4. v15_005 — Куриный суп с лапшой
5. v15_006 — Сливочная паста с курицей
6. v15_007 — Лаваш с сыром и курицей
7. v15_008 — Пельмени в сливочном соусе
8. v15_010 — Картошка с грибами
9. v15_011 — Творожный десерт с ягодами

Пока не заменять / оставить на отдельное решение:

1. v15_004 — Гречка с курицей в сливках — `needs_generation`.

## 5. Правило перед генерацией

Перед генерацией для v15_004 нужно отдельное подтверждение Лизы в явной форме, например:

> можно генерировать фото для гречки с курицей

Без такого подтверждения генерацию не запускать.

## 6. Следующий шаг

Сделать тестовый патч `v22-photo-test-stock`, где заменить фото только для 9 утверждённых рецептов, не трогая логику, тексты, рецепты и генерацию.
