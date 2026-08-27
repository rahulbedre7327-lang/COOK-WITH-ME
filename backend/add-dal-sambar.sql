SELECT
    r.recipe_name,
    i.name AS ingredient,
    ri.quantity
FROM recipe_ingredients ri
JOIN recipes r
    ON ri.recipe_id = r.recipe_id
JOIN ingredients i
    ON ri.ingredient_id = i.id
WHERE r.recipe_name = 'Dal Sambar'
ORDER BY ri.id;