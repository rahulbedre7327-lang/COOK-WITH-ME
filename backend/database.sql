
-- =========================================================
-- 1. ADD DAL SAMBAR RECIPE
-- =========================================================

INSERT INTO recipes
(
    recipe_name,
    category,
    cooking_time,
    difficulty,
    servings,
    instructions,
    recipe_file
)
VALUES
(
    'Dal Sambar',
    'South Indian',
    35,
    'Easy',
    4,
    'Wash and cook toor dal. Cook the vegetables. Add tamarind, sambar powder and turmeric. Add cooked dal and simmer. Prepare tempering and add it to the sambar. Serve hot.',
    'dal-sambar.html'
);


-- =========================================================
-- 2. ADD INGREDIENTS
-- =========================================================

INSERT INTO ingredients (name)
SELECT 'Toor Dal'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'toor dal'
);

INSERT INTO ingredients (name)
SELECT 'Onion'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'onion'
);

INSERT INTO ingredients (name)
SELECT 'Tomato'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'tomato'
);

INSERT INTO ingredients (name)
SELECT 'Carrot'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'carrot'
);

INSERT INTO ingredients (name)
SELECT 'Drumstick'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'drumstick'
);

INSERT INTO ingredients (name)
SELECT 'Tamarind'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'tamarind'
);

INSERT INTO ingredients (name)
SELECT 'Sambar Powder'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'sambar powder'
);

INSERT INTO ingredients (name)
SELECT 'Turmeric Powder'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'turmeric powder'
);

INSERT INTO ingredients (name)
SELECT 'Salt'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'salt'
);

INSERT INTO ingredients (name)
SELECT 'Oil'
WHERE NOT EXISTS (
    SELECT 1 FROM ingredients
    WHERE LOWER(name) = 'oil'
);


-- =========================================================
-- 3. CONNECT INGREDIENTS TO DAL SAMBAR
-- =========================================================

SET @recipe_id = (
    SELECT recipe_id
    FROM recipes
    WHERE recipe_name = 'Dal Sambar'
    ORDER BY recipe_id DESC
    LIMIT 1
);


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1 cup'
FROM ingredients
WHERE LOWER(name) = 'toor dal';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1 medium'
FROM ingredients
WHERE LOWER(name) = 'onion';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '2 medium'
FROM ingredients
WHERE LOWER(name) = 'tomato';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1 medium'
FROM ingredients
WHERE LOWER(name) = 'carrot';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1'
FROM ingredients
WHERE LOWER(name) = 'drumstick';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1 tbsp'
FROM ingredients
WHERE LOWER(name) = 'tamarind';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '2 tbsp'
FROM ingredients
WHERE LOWER(name) = 'sambar powder';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1/2 tsp'
FROM ingredients
WHERE LOWER(name) = 'turmeric powder';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '1 tsp'
FROM ingredients
WHERE LOWER(name) = 'salt';


INSERT INTO recipe_ingredients
(recipe_id, ingredient_id, quantity)
SELECT @recipe_id, id, '2 tbsp'
FROM ingredients
WHERE LOWER(name) = 'oil';


-- =========================================================
-- 4. CHECK DAL SAMBAR
-- =========================================================

SELECT
    r.recipe_name,
    i.name AS ingredient,
    ri.quantity
FROM recipe_ingredients ri
JOIN recipes r
    ON ri.recipe_id = r.recipe_id
JOIN ingredients i
    ON ri.ingredient_id = i.id
WHERE r.recipe_name = 'Dal Sambar';