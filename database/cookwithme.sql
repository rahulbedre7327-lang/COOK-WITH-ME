USE CookWithMe;

SELECT 
    r.recipe_id,
    r.recipe_name,
    i.name AS ingredient,
    ri.quantity
FROM recipes r
JOIN recipe_ingredients ri
    ON r.recipe_id = ri.recipe_id
JOIN ingredients i
    ON ri.ingredient_id = i.id
ORDER BY r.recipe_id;