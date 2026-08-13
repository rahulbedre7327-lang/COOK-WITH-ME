from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Cook with me flask server is running!"

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
            return jsonify([])

        # Get only ingredient names
        ingredient_names = [
            item["name"].strip().lower()
            for item in user_ingredients
        ]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Create ?,?,? placeholders
        placeholders = ",".join(["%s"] * len(ingredient_names))

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

        cursor.execute(sql, ingredient_names)

        recipes = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(recipes)

    except Exception as e:

        print("Custom food error:", e)

        return jsonify({
            "error": str(e)
        }), 500
if __name__ == "__main__":
    app.run(debug=True)