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

@app.route("/custom-food", methods=["POST"])
def custom_food():

    try:

        data = request.get_json()

        user_ingredients = data.get("ingredients", [])

        if not user_ingredients:
            return jsonify({
                "message": "Please enter at least one ingredient."
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        placeholders = ",".join(["%s"] * len(user_ingredients))

        sql = f"""
            SELECT
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings,
                COUNT(DISTINCT ri.ingredient_id) AS matched_ingredients
            FROM recipes r
            JOIN recipe_ingredients ri
                ON r.recipe_id = ri.recipe_id
            JOIN ingredients i
                ON ri.ingredient_id = i.id
            WHERE LOWER(i.name) IN ({placeholders})
            GROUP BY
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings
            ORDER BY matched_ingredients DESC
        """

        values = [ingredient.lower() for ingredient in user_ingredients]

        cursor.execute(sql, values)

        recipes = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(recipes)

    except Exception as e:

        print("Custom food error:", e)

        return jsonify({
            "error": str(e)
        }), 500