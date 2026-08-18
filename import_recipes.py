from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)

# Allow frontend JavaScript to communicate with Flask
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
# CUSTOM FOOD API
# ============================================================

@app.route("/custom-food", methods=["POST"])
def custom_food():

    try:

        # ----------------------------------------------------
        # GET JSON DATA
        # ----------------------------------------------------

        data = request.get_json()

        if not data or "ingredients" not in data:

            return jsonify({
                "success": False,
                "message": "No ingredients received"
            }), 400


        selected_ingredients = data["ingredients"]


        # ----------------------------------------------------
        # CHECK INGREDIENT LIST
        # ----------------------------------------------------

        if not isinstance(selected_ingredients, list):

            return jsonify({
                "success": False,
                "message": "Ingredients must be a list"
            }), 400


        if len(selected_ingredients) == 0:

            return jsonify({
                "success": False,
                "message": "Please select at least one ingredient"
            }), 400


        # ----------------------------------------------------
        # CLEAN INGREDIENT NAMES
        # ----------------------------------------------------

        selected_ingredients = [
            str(item).strip().lower()
            for item in selected_ingredients
            if str(item).strip()
        ]


        if not selected_ingredients:

            return jsonify({
                "success": False,
                "message": "No valid ingredients received"
            }), 400


        print("\n======================================")
        print("CUSTOM FOOD REQUEST")
        print("======================================")

        print(
            "Ingredients:",
            selected_ingredients
        )


        # ----------------------------------------------------
        # DATABASE CONNECTION
        # ----------------------------------------------------

        conn = mysql.connector.connect(
            **DB_CONFIG
        )

        cursor = conn.cursor(
            dictionary=True
        )


        # ----------------------------------------------------
        # CREATE SQL PLACEHOLDERS
        # ----------------------------------------------------

        placeholders = ", ".join(
            ["%s"] * len(selected_ingredients)
        )


        # ----------------------------------------------------
        # FIND MATCHING RECIPES
        # ----------------------------------------------------

        query = f"""
            SELECT
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings,
                r.instructions,
                r.recipe_file,

                COUNT(
                    DISTINCT ri.ingredient_id
                ) AS matched_count

            FROM recipes r

            JOIN recipe_ingredients ri
                ON r.recipe_id = ri.recipe_id

            JOIN ingredients i
                ON ri.ingredient_id = i.id

            WHERE LOWER(i.name)
                IN ({placeholders})

            GROUP BY
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings,
                r.instructions,
                r.recipe_file

            ORDER BY matched_count DESC
        """


        cursor.execute(
            query,
            selected_ingredients
        )


        recipes = cursor.fetchall()


        print(
            "Recipes found:",
            len(recipes)
        )


        # ----------------------------------------------------
        # GET ALL INGREDIENTS FOR EACH RECIPE
        # ----------------------------------------------------

        results = []


        for recipe in recipes:

            cursor.execute(
                """
                SELECT
                    i.id AS ingredient_id,
                    i.name AS ingredient_name,
                    ri.quantity

                FROM recipe_ingredients ri

                JOIN ingredients i
                    ON ri.ingredient_id = i.id

                WHERE ri.recipe_id = %s

                ORDER BY ri.id
                """,
                (
                    recipe["recipe_id"],
                )
            )


            recipe_ingredients = (
                cursor.fetchall()
            )


            recipe["ingredients"] = (
                recipe_ingredients
            )


            results.append(recipe)


        # ----------------------------------------------------
        # CLOSE DATABASE
        # ----------------------------------------------------

        cursor.close()
        conn.close()


        # ----------------------------------------------------
        # RETURN RESULT
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "count": len(results),

            "recipes": results

        })


    # ========================================================
    # MYSQL ERROR
    # ========================================================

    except mysql.connector.Error as e:

        print(
            "MySQL Error:",
            e
        )

        return jsonify({

            "success": False,

            "message": "Database error",

            "error": str(e)

        }), 500


    # ========================================================
    # GENERAL ERROR
    # ========================================================

    except Exception as e:

        print(
            "Error:",
            e
        )

        return jsonify({

            "success": False,

            "message": "Something went wrong",

            "error": str(e)

        }), 500


# ============================================================
# HOME / TEST ROUTE
# ============================================================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "CookWithMe Flask API is running"
    })


# ============================================================
# RUN FLASK
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )