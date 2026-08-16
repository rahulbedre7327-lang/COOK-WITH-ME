from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return "Cook With Me Flask server is running!"


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():

    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Rahul@1234",
        database="CookWithMe"
    )


# =========================================================
# CUSTOM FOOD
# Find recipes based on user's ingredients
# =========================================================

@app.route("/custom-food", methods=["POST"])
def custom_food():

    conn = None
    cursor = None

    try:

        # -------------------------------------------------
        # Get JSON from JavaScript
        # -------------------------------------------------

        data = request.get_json()

        if not data:
            return jsonify([])


        user_ingredients = data.get(
            "ingredients",
            []
        )


        # -------------------------------------------------
        # Check ingredients
        # -------------------------------------------------

        if not isinstance(
            user_ingredients,
            list
        ) or len(user_ingredients) == 0:

            return jsonify([])


        # -------------------------------------------------
        # Extract ingredient names
        # -------------------------------------------------

        ingredient_names = []

        for item in user_ingredients:

            if isinstance(item, dict):

                name = item.get(
                    "name",
                    ""
                )

                name = str(
                    name
                ).strip().lower()


                if name:
                    ingredient_names.append(name)


        if len(ingredient_names) == 0:

            return jsonify([])


        # Remove duplicate ingredients

        ingredient_names = list(
            dict.fromkeys(
                ingredient_names
            )
        )


        # -------------------------------------------------
        # Connect database
        # -------------------------------------------------

        conn = get_db_connection()

        cursor = conn.cursor(
            dictionary=True
        )


        # -------------------------------------------------
        # Create SQL placeholders
        # Example: %s,%s,%s
        # -------------------------------------------------

        placeholders = ",".join(
            ["%s"] * len(
                ingredient_names
            )
        )


        # -------------------------------------------------
        # SQL
        #
        # IMPORTANT:
        # recipe_file is included because the frontend
        # uses it to open the recipe HTML file.
        # -------------------------------------------------

        sql = f"""
            SELECT

                r.recipe_id,

                r.recipe_name,

                r.category,

                r.cooking_time,

                r.difficulty,

                r.servings,

                r.recipe_file,

                COUNT(
                    DISTINCT ri.ingredient_id
                ) AS matched_ingredients

            FROM recipes r

            INNER JOIN recipe_ingredients ri

                ON r.recipe_id =
                   ri.recipe_id

            INNER JOIN ingredients i

                ON ri.ingredient_id =
                   i.id

            WHERE LOWER(
                TRIM(i.name)
            ) IN ({placeholders})

            GROUP BY

                r.recipe_id,

                r.recipe_name,

                r.category,

                r.cooking_time,

                r.difficulty,

                r.servings,

                r.recipe_file

            ORDER BY

                matched_ingredients DESC,

                r.recipe_name ASC
        """


        # -------------------------------------------------
        # Execute SQL
        # -------------------------------------------------

        cursor.execute(
            sql,
            ingredient_names
        )


        recipes = cursor.fetchall()


        # -------------------------------------------------
        # Calculate match percentage
        # -------------------------------------------------
        #
        # Example:
        #
        # User gives:
        # Tomato
        # Rice
        # Onion
        #
        # Recipe contains:
        # Tomato
        # Rice
        # Onion
        #
        # Match = 3 / 3 = 100%
        #
        # Recipe contains:
        # Tomato
        # Rice
        #
        # Match = 2 / 3 = 66%
        #
        # -------------------------------------------------

        total_user_ingredients = len(
            ingredient_names
        )


        for recipe in recipes:

            matched = int(
                recipe.get(
                    "matched_ingredients",
                    0
                )
            )


            if total_user_ingredients > 0:

                percentage = round(
                    (
                        matched /
                        total_user_ingredients
                    ) * 100
                )

            else:

                percentage = 0


            # Never allow more than 100%

            percentage = min(
                percentage,
                100
            )


            recipe[
                "match_percentage"
            ] = percentage


        # -------------------------------------------------
        # Close database
        # -------------------------------------------------

        cursor.close()
        cursor = None

        conn.close()
        conn = None


        # -------------------------------------------------
        # Return JSON
        # -------------------------------------------------

        return jsonify(recipes)


    except Exception as e:

        print(
            "CUSTOM FOOD ERROR:",
            e
        )


        return jsonify({
            "error": str(e)
        }), 500


    finally:

        # Safety cleanup

        if cursor is not None:

            try:
                cursor.close()

            except:
                pass


        if conn is not None:

            try:
                conn.close()

            except:
                pass


# =========================================================
# SEARCH RECIPES
# =========================================================

@app.route("/search", methods=["GET"])
def search():

    conn = None
    cursor = None

    try:

        query = request.args.get(
            "q",
            ""
        ).strip().lower()


        if not query:

            return jsonify([])


        conn = get_db_connection()

        cursor = conn.cursor(
            dictionary=True
        )


        search_query = f"%{query}%"


        sql = """
            SELECT

                recipe_id,
                recipe_name,
                category,
                cooking_time,
                difficulty,
                servings,
                recipe_file

            FROM recipes

            WHERE LOWER(recipe_name)
                LIKE %s

            OR LOWER(category)
                LIKE %s

            ORDER BY recipe_name ASC
        """


        cursor.execute(
            sql,
            (
                search_query,
                search_query
            )
        )


        recipes = cursor.fetchall()


        return jsonify(recipes)


    except Exception as e:

        print(
            "SEARCH ERROR:",
            e
        )


        return jsonify({
            "error": str(e)
        }), 500


    finally:

        if cursor is not None:

            try:
                cursor.close()

            except:
                pass


        if conn is not None:

            try:
                conn.close()

            except:
                pass


# =========================================================
# GET SINGLE RECIPE
# =========================================================

@app.route(
    "/recipe/<int:recipe_id>",
    methods=["GET"]
)
def get_recipe(recipe_id):

    conn = None
    cursor = None

    try:

        conn = get_db_connection()

        cursor = conn.cursor(
            dictionary=True
        )


        # -------------------------------------------------
        # Get recipe
        # -------------------------------------------------

        recipe_sql = """
            SELECT

                recipe_id,
                recipe_name,
                category,
                cooking_time,
                difficulty,
                servings,
                instructions,
                recipe_file

            FROM recipes

            WHERE recipe_id = %s
        """


        cursor.execute(
            recipe_sql,
            (recipe_id,)
        )


        recipe = cursor.fetchone()


        if not recipe:

            return jsonify({
                "error": "Recipe not found"
            }), 404


        # -------------------------------------------------
        # Get ingredients
        # -------------------------------------------------

        ingredient_sql = """
            SELECT

                i.name,
                ri.quantity

            FROM recipe_ingredients ri

            INNER JOIN ingredients i

                ON ri.ingredient_id =
                   i.id

            WHERE ri.recipe_id = %s

            ORDER BY ri.id ASC
        """


        cursor.execute(
            ingredient_sql,
            (recipe_id,)
        )


        ingredients = cursor.fetchall()


        recipe[
            "ingredients"
        ] = ingredients


        return jsonify(recipe)


    except Exception as e:

        print(
            "RECIPE ERROR:",
            e
        )


        return jsonify({
            "error": str(e)
        }), 500


    finally:

        if cursor is not None:

            try:
                cursor.close()

            except:
                pass


        if conn is not None:

            try:
                conn.close()

            except:
                pass


# =========================================================
# START FLASK
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )