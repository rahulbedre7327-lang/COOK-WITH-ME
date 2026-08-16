from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import re

app = Flask(__name__)
CORS(app)


# ============================================================
# MYSQL CONFIGURATION
# ============================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Rahul@1234",
    "database": "CookWithMe"
}


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection

    except mysql.connector.Error as error:
        print("MySQL connection error:", error)
        return None


# ============================================================
# NORMALIZE INGREDIENT NAME
# ============================================================

def normalize_ingredient(name):
    """
    Converts ingredient names into a standard format.

    Example:
        " TOMATO "       -> "tomato"
        "Tomato"         -> "tomato"
        "TOMATO"         -> "tomato"
    """

    if not name:
        return ""

    name = str(name).strip().lower()

    # Remove extra spaces
    name = re.sub(r"\s+", " ", name)

    return name


# ============================================================
# CONVERT USER INGREDIENT DATA
# ============================================================

def extract_ingredients(data):
    """
    Accepts several possible frontend formats.

    Format 1:
    {
        "ingredients": [
            "Rice",
            "Egg",
            "Onion"
        ]
    }

    Format 2:
    {
        "ingredients": [
            {
                "name": "Rice",
                "quantity": "2 cups"
            },
            {
                "name": "Egg",
                "quantity": "2"
            }
        ]
    }
    """

    raw_ingredients = data.get("ingredients", [])

    if not isinstance(raw_ingredients, list):
        return []

    ingredients = []

    for item in raw_ingredients:

        # ------------------------------------------
        # String ingredient
        # ------------------------------------------

        if isinstance(item, str):

            name = normalize_ingredient(item)

            if name:
                ingredients.append({
                    "name": name,
                    "quantity": "as needed"
                })

        # ------------------------------------------
        # Object ingredient
        # ------------------------------------------

        elif isinstance(item, dict):

            name = item.get("name", "")

            name = normalize_ingredient(name)

            if not name:
                continue

            quantity = item.get("quantity", "as needed")

            if quantity is None or str(quantity).strip() == "":
                quantity = "as needed"

            ingredients.append({
                "name": name,
                "quantity": str(quantity).strip()
            })

    # ========================================================
    # REMOVE DUPLICATES
    # ========================================================

    unique = {}

    for ingredient in ingredients:

        name = ingredient["name"]

        if name not in unique:
            unique[name] = ingredient

    return list(unique.values())


# ============================================================
# FIND INGREDIENT ID
# ============================================================

def find_ingredient_id(cursor, ingredient_name):

    query = """
        SELECT id, name
        FROM ingredients
        WHERE LOWER(TRIM(name)) = %s
        LIMIT 1
    """

    cursor.execute(query, (ingredient_name.lower(),))

    result = cursor.fetchone()

    if result:
        return result[0]

    return None


# ============================================================
# SEARCH EXISTING RECIPES
# ============================================================

def search_existing_recipes(cursor, user_ingredients):

    """
    Finds recipes that contain the user's ingredients.

    Instead of requiring 100% exact matching, this function
    calculates how many user ingredients occur in each recipe.
    """

    if not user_ingredients:
        return []

    ingredient_names = [
        ingredient["name"]
        for ingredient in user_ingredients
    ]

    # --------------------------------------------------------
    # Create SQL placeholders
    # --------------------------------------------------------

    placeholders = ",".join(["%s"] * len(ingredient_names))

    query = f"""
        SELECT
            r.id,
            r.name,
            r.description,
            r.recipe_file,

            COUNT(DISTINCT LOWER(TRIM(i.name))) AS matched_count,

            (
                SELECT COUNT(DISTINCT ri2.ingredient_id)
                FROM recipe_ingredients ri2
                WHERE ri2.recipe_id = r.id
            ) AS total_ingredients

        FROM recipes r

        JOIN recipe_ingredients ri
            ON r.id = ri.recipe_id

        JOIN ingredients i
            ON ri.ingredient_id = i.id

        WHERE LOWER(TRIM(i.name)) IN ({placeholders})

        GROUP BY
            r.id,
            r.name,
            r.description,
            r.recipe_file

        ORDER BY
            matched_count DESC,
            total_ingredients ASC
    """

    cursor.execute(query, tuple(ingredient_names))

    rows = cursor.fetchall()

    recipes = []

    for row in rows:

        recipe_id = row[0]
        recipe_name = row[1]
        description = row[2]
        recipe_file = row[3]
        matched_count = row[4]
        total_ingredients = row[5]

        # ----------------------------------------------------
        # Match percentage
        #
        # How much of user's ingredients matched?
        # ----------------------------------------------------

        if len(ingredient_names) > 0:
            match_percentage = (
                matched_count / len(ingredient_names)
            ) * 100
        else:
            match_percentage = 0

        recipes.append({
            "id": recipe_id,
            "name": recipe_name,
            "description": description or "",
            "recipe_file": recipe_file,
            "matched_count": matched_count,
            "total_ingredients": total_ingredients,
            "match_percentage": round(match_percentage, 2)
        })

    return recipes


# ============================================================
# GET RECIPE INGREDIENTS
# ============================================================

def get_recipe_ingredients(cursor, recipe_id):

    query = """
        SELECT
            i.name,
            ri.quantity
        FROM recipe_ingredients ri
        JOIN ingredients i
            ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = %s
        ORDER BY i.name
    """

    cursor.execute(query, (recipe_id,))

    rows = cursor.fetchall()

    ingredients = []

    for row in rows:

        ingredients.append({
            "name": row[0],
            "quantity": row[1] if row[1] else "as needed"
        })

    return ingredients


# ============================================================
# CREATE CUSTOM RECIPE
# ============================================================

def generate_custom_recipe(user_ingredients):

    """
    Rule-based custom recipe generator.

    This creates a practical recipe from ingredients supplied
    by the user.

    Later this function can be replaced with an AI generator.
    """

    names = [
        ingredient["name"]
        for ingredient in user_ingredients
    ]

    name_set = set(names)

    # ========================================================
    # DETECT MAIN INGREDIENTS
    # ========================================================

    has_rice = "rice" in name_set
    has_bread = "bread" in name_set
    has_egg = "egg" in name_set or "eggs" in name_set
    has_potato = "potato" in name_set or "potatoes" in name_set
    has_onion = "onion" in name_set
    has_tomato = "tomato" in name_set
    has_cheese = "cheese" in name_set
    has_pasta = "pasta" in name_set
    has_noodles = "noodles" in name_set

    # ========================================================
    # SELECT RECIPE TYPE
    # ========================================================

    recipe_name = "Custom Mixed Ingredient Dish"

    steps = []

    cooking_time = 15
    difficulty = "Easy"

    # ========================================================
    # BREAD + EGG
    # ========================================================

    if has_bread and has_egg:

        if has_cheese:
            recipe_name = "Cheesy Egg Bread"

        elif has_tomato:
            recipe_name = "Tomato Egg Bread"

        else:
            recipe_name = "Quick Egg Bread"

        steps = [
            "Prepare and chop the vegetables.",
            "Beat the eggs in a bowl.",
            "Heat a pan and add a small amount of oil.",
            "Sauté the onion and other vegetables until slightly soft.",
            "Add the beaten eggs and cook until almost done.",
            "Place the bread slices in the pan.",
            "Add the cooked egg mixture over the bread.",
        ]

        if has_cheese:
            steps.append(
                "Add cheese and cook until it melts."
            )

        steps.append(
            "Cook until the bread becomes lightly crisp."
        )

        cooking_time = 15

    # ========================================================
    # RICE + EGG
    # ========================================================

    elif has_rice and has_egg:

        if has_tomato:
            recipe_name = "Tomato Egg Rice"
        else:
            recipe_name = "Quick Egg Rice"

        steps = [
            "Prepare the rice and keep it ready.",
            "Chop the onion and vegetables.",
            "Heat oil in a pan.",
            "Sauté the onion until lightly golden.",
            "Add the vegetables and cook for a few minutes.",
            "Add the eggs and scramble them.",
            "Add the cooked rice.",
            "Mix everything together.",
            "Cook for a few minutes and serve hot."
        ]

        cooking_time = 20

    # ========================================================
    # POTATO + BREAD
    # ========================================================

    elif has_potato and has_bread:

        if has_cheese:
            recipe_name = "Cheesy Potato Bread"
        else:
            recipe_name = "Spicy Potato Bread"

        steps = [
            "Boil or cook the potatoes until soft.",
            "Mash the potatoes.",
            "Chop the onion and tomato if available.",
            "Heat a pan with a little oil.",
            "Sauté the vegetables.",
            "Add the mashed potato and mix well.",
            "Season according to taste.",
            "Spread the potato mixture over the bread.",
        ]

        if has_cheese:
            steps.append(
                "Add cheese on top and cook until melted."
            )

        steps.append(
            "Toast the bread until crisp and serve."
        )

        cooking_time = 20

    # ========================================================
    # PASTA
    # ========================================================

    elif has_pasta:

        recipe_name = "Custom Vegetable Pasta"

        steps = [
            "Boil the pasta until cooked.",
            "Drain the pasta and keep it aside.",
            "Chop the available vegetables.",
            "Heat oil in a pan.",
            "Sauté the onion and vegetables.",
            "Add the cooked pasta.",
            "Mix everything together.",
            "Add salt and seasonings according to taste.",
            "Cook for a few more minutes and serve hot."
        ]

        cooking_time = 20

    # ========================================================
    # NOODLES
    # ========================================================

    elif has_noodles:

        recipe_name = "Custom Vegetable Noodles"

        steps = [
            "Boil the noodles according to the packet instructions.",
            "Drain the noodles.",
            "Chop the available vegetables.",
            "Heat oil in a pan.",
            "Sauté the vegetables.",
            "Add the cooked noodles.",
            "Mix everything together.",
            "Add available sauces or seasonings.",
            "Cook for a few minutes and serve hot."
        ]

        cooking_time = 15

    # ========================================================
    # POTATO
    # ========================================================

    elif has_potato:

        recipe_name = "Quick Potato Fry"

        steps = [
            "Wash and cut the potatoes into small pieces.",
            "Heat oil in a pan.",
            "Add the potatoes.",
            "Cook while stirring occasionally.",
            "Add onion and tomato if available.",
            "Add salt and available seasonings.",
            "Cook until the potatoes become soft and lightly crisp.",
            "Serve hot."
        ]

        cooking_time = 20

    # ========================================================
    # EGG
    # ========================================================

    elif has_egg:

        recipe_name = "Custom Vegetable Egg Fry"

        steps = [
            "Beat the eggs in a bowl.",
            "Chop the available vegetables.",
            "Heat oil in a pan.",
            "Sauté the vegetables.",
            "Add the beaten eggs.",
            "Stir and cook until the eggs are completely cooked.",
            "Add salt and seasonings according to taste.",
            "Serve hot."
        ]

        cooking_time = 10

    # ========================================================
    # TOMATO + ONION
    # ========================================================

    elif has_tomato and has_onion:

        recipe_name = "Tomato Onion Masala"

        steps = [
            "Chop the tomato and onion.",
            "Heat oil in a pan.",
            "Sauté the onion until soft.",
            "Add the tomato.",
            "Cook until the tomato becomes soft.",
            "Add salt and available seasonings.",
            "Cook until the mixture becomes slightly thick.",
            "Serve with bread, rice or other available food."
        ]

        cooking_time = 15

    # ========================================================
    # GENERAL FALLBACK
    # ========================================================

    else:

        recipe_name = "Your Custom Mixed Dish"

        steps = [
            "Wash and prepare all the ingredients.",
            "Cut larger ingredients into small pieces.",
            "Heat a pan and add a small amount of oil.",
            "Add the ingredients that require the longest cooking time first.",
            "Add the remaining ingredients.",
            "Cook while stirring occasionally.",
            "Add salt and available seasonings according to taste.",
            "Continue cooking until the ingredients are properly cooked.",
            "Serve hot."
        ]

        cooking_time = 20

    # ========================================================
    # CREATE QUANTITIES
    # ========================================================

    generated_ingredients = []

    for ingredient in user_ingredients:

        generated_ingredients.append({
            "name": ingredient["name"].title(),
            "quantity": ingredient["quantity"]
        })

    # ========================================================
    # ADD BASIC COOKING INGREDIENTS ONLY IF NOT PROVIDED
    # ========================================================

    if "oil" not in name_set and "cooking oil" not in name_set:

        generated_ingredients.append({
            "name": "Cooking Oil",
            "quantity": "1–2 tbsp"
        })

    # ========================================================
    # RETURN GENERATED RECIPE
    # ========================================================

    return {
        "type": "custom",
        "name": recipe_name,
        "description": (
            "A practical dish created using the ingredients "
            "you provided."
        ),
        "ingredients": generated_ingredients,
        "steps": steps,
        "cooking_time": cooking_time,
        "difficulty": difficulty,
        "servings": 2,
        "message": (
            "✨ This recipe was created from your ingredients."
        )
    }


# ============================================================
# CUSTOM FOOD API
# ============================================================

@app.route("/custom-food", methods=["POST"])
def custom_food():

    connection = None
    cursor = None

    try:

        # ====================================================
        # GET JSON DATA
        # ====================================================

        data = request.get_json(silent=True)

        if not data:

            return jsonify({
                "success": False,
                "message": "No ingredient data was received."
            }), 400

        # ====================================================
        # EXTRACT INGREDIENTS
        # ====================================================

        user_ingredients = extract_ingredients(data)

        if not user_ingredients:

            return jsonify({
                "success": False,
                "message": "Please select at least one ingredient."
            }), 400

        print("\n========================================")
        print("CUSTOM FOOD REQUEST")
        print("========================================")

        print("User ingredients:")

        for ingredient in user_ingredients:
            print(
                f"- {ingredient['name']} "
                f"({ingredient['quantity']})"
            )

        # ====================================================
        # CONNECT MYSQL
        # ====================================================

        connection = get_db_connection()

        if connection is None:

            return jsonify({
                "success": False,
                "message": "Unable to connect to MySQL."
            }), 500

        cursor = connection.cursor()

        # ====================================================
        # SEARCH EXISTING RECIPES
        # ====================================================

        recipes = search_existing_recipes(
            cursor,
            user_ingredients
        )

        print("\nExisting recipe matches:")

        for recipe in recipes:

            print(
                recipe["name"],
                "=>",
                recipe["match_percentage"],
                "%"
            )

        # ====================================================
        # FIND BEST MATCH
        # ====================================================

        best_recipe = None

        if recipes:

            best_recipe = recipes[0]

        # ====================================================
        # MATCH THRESHOLD
        # ====================================================

        #
        # Example:
        #
        # User:
        # Rice + Egg + Onion
        #
        # Existing:
        # Egg Rice
        #
        # Match:
        # 2 / 3 = 66.6%
        #
        # We can consider that a useful match.
        #

        MATCH_THRESHOLD = 60

        if (
            best_recipe
            and best_recipe["match_percentage"] >= MATCH_THRESHOLD
        ):

            # =================================================
            # EXISTING RECIPE FOUND
            # =================================================

            recipe_ingredients = get_recipe_ingredients(
                cursor,
                best_recipe["id"]
            )

            print(
                "\nExisting recipe selected:",
                best_recipe["name"]
            )

            return jsonify({

                "success": True,

                "type": "existing",

                "message": (
                    "A matching recipe was found "
                    "in Cook With Me."
                ),

                "recipe": {
                    "id": best_recipe["id"],
                    "name": best_recipe["name"],
                    "description": best_recipe["description"],
                    "recipe_file": best_recipe["recipe_file"],
                    "ingredients": recipe_ingredients,
                    "matched_count": best_recipe["matched_count"],
                    "total_ingredients": best_recipe[
                        "total_ingredients"
                    ],
                    "match_percentage": best_recipe[
                        "match_percentage"
                    ]
                }

            }), 200

        # ====================================================
        # NO GOOD EXISTING RECIPE
        # ====================================================

        print(
            "\nNo strong existing recipe found."
        )

        print(
            "Generating custom recipe..."
        )

        custom_recipe = generate_custom_recipe(
            user_ingredients
        )

        # ====================================================
        # RETURN CUSTOM RECIPE
        # ====================================================

        return jsonify({

            "success": True,

            "type": "custom",

            "message": (
                "No matching recipe was found. "
                "A new recipe was created from your ingredients."
            ),

            "recipe": custom_recipe

        }), 200

    # ========================================================
    # MYSQL ERROR
    # ========================================================

    except mysql.connector.Error as error:

        print("MySQL error:", error)

        return jsonify({

            "success": False,

            "message": "Database error occurred.",

            "error": str(error)

        }), 500

    # ========================================================
    # GENERAL ERROR
    # ========================================================

    except Exception as error:

        print("Server error:", error)

        return jsonify({

            "success": False,

            "message": "Something went wrong.",

            "error": str(error)

        }), 500

    # ========================================================
    # CLOSE DATABASE
    # ========================================================

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# ============================================================
# TEST ROUTE
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Cook With Me Flask server is running."
    })


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )