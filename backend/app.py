from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Rahul@1234",
        database="CookWithMe"
    )


# =========================
# HOME
# =========================

@app.route("/")
def home():
    return "Cook With Me Flask Server is running!"


# =========================
# SEARCH RECIPES
# =========================

@app.route("/search")
def search():

    query = request.args.get("q", "").strip()

    if not query:
        return jsonify([])

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT
                recipe_id,
                recipe_name,
                category,
                cooking_time,
                difficulty,
                servings
            FROM recipes
            WHERE recipe_name LIKE %s
            ORDER BY recipe_id
        """

        cursor.execute(sql, ("%" + query + "%",))

        recipes = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(recipes)

    except Exception as e:

        print("Search error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# GET ONE RECIPE
# =========================

@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings,
                i.name AS ingredient_name,
                ri.quantity
            FROM recipes r
            LEFT JOIN recipe_ingredients ri
                ON r.recipe_id = ri.recipe_id
            LEFT JOIN ingredients i
                ON ri.ingredient_id = i.id
            WHERE r.recipe_id = %s
        """

        cursor.execute(sql, (recipe_id,))

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        if not rows:
            return jsonify({
                "error": "Recipe not found"
            }), 404

        recipe = {
            "recipe_id": rows[0]["recipe_id"],
            "recipe_name": rows[0]["recipe_name"],
            "category": rows[0]["category"],
            "cooking_time": rows[0]["cooking_time"],
            "difficulty": rows[0]["difficulty"],
            "servings": rows[0]["servings"],
            "ingredients": []
        }

        for row in rows:

            if row["ingredient_name"]:

                recipe["ingredients"].append({
                    "name": row["ingredient_name"],
                    "quantity": row["quantity"]
                })

        return jsonify(recipe)

    except Exception as e:

        print("Recipe error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# START SERVER
# =========================

if __name__ == "__main__":
    app.run(debug=True)