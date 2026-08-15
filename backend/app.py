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

    conn = None
    cursor = None

    try:
        data = request.get_json()

        user_ingredients = data.get("ingredients", [])

        if not user_ingredients:
            return jsonify([])


        # ==========================================
        # GET USER INGREDIENT NAMES
        # ==========================================

        ingredient_names = []

        for item in user_ingredients:

            name = item.get("name", "").strip().lower()

            if name:
                ingredient_names.append(name)


        # Remove duplicates
        ingredient_names = list(set(ingredient_names))


        if not ingredient_names:
            return jsonify([])


        # ==========================================
        # DATABASE CONNECTION
        # ==========================================

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)


        # ==========================================
        # CREATE SQL PLACEHOLDERS
        # ==========================================

        placeholders = ",".join(
            ["%s"] * len(ingredient_names)
        )


        # ==========================================
        # FIND MATCHING RECIPES
        # ==========================================

        sql = f"""
            SELECT
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings,

                COUNT(DISTINCT ri.ingredient_id)
                    AS matched_ingredients,

                (
                    SELECT COUNT(*)
                    FROM recipe_ingredients ri2
                    WHERE ri2.recipe_id = r.recipe_id
                )
                    AS total_ingredients

            FROM recipes r

            JOIN recipe_ingredients ri
                ON r.recipe_id = ri.recipe_id

            JOIN ingredients i
                ON ri.ingredient_id = i.id

            WHERE LOWER(TRIM(i.name))
                IN ({placeholders})

            GROUP BY
                r.recipe_id,
                r.recipe_name,
                r.category,
                r.cooking_time,
                r.difficulty,
                r.servings

            ORDER BY
                matched_ingredients DESC
        """


        cursor.execute(
            sql,
            ingredient_names
        )


        recipes = cursor.fetchall()


        # ==========================================
        # CALCULATE MATCH PERCENTAGE
        # ==========================================

        final_recipes = []


        for recipe in recipes:

            matched = recipe["matched_ingredients"]

            total = recipe["total_ingredients"]


            if total > 0:

                match_percentage = round(
                    (matched / total) * 100
                )

            else:

                match_percentage = 0


            recipe["match_percentage"] = match_percentage


            final_recipes.append(recipe)


        # ==========================================
        # SORT BY BEST MATCH
        # ==========================================

        final_recipes.sort(
            key=lambda recipe: (
                recipe["match_percentage"],
                recipe["matched_ingredients"]
            ),
            reverse=True
        )


        # ==========================================
        # RETURN RESULTS
        # ==========================================

        return jsonify(final_recipes)


    except Exception as e:

        print(
            "Custom food error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()
if __name__ == "__main__":
    app.run(debug=True)