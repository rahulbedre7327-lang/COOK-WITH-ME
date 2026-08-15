SELECT
    r.recipe_id,
    r.recipe_name,
    r.recipe_file,
    r.category,
    r.cooking_time,
    r.difficulty,
    r.servings,
    COUNT(DISTINCT ri.ingredient_id) AS matched_ingredients