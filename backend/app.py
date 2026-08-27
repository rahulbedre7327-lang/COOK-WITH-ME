from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import re

app = Flask(__name__)
CORS(app)


# ============================================================
# MYSQL CONFIGURATION
# ============================================================

def get_db_connection():

    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Rahul@1234",
        database="CookWithMe"
    )


# ============================================================
# DATABASE CONNECTION# ============================================================
@app.route("/custom-food", methods=["POST"])
def custom_food():

    try:

        data = request.get_json()

        user_ingredients = data.get("ingredients", [])

        if not user_ingredients:

            return jsonify({
                "success": False,
                "message": "No ingredients received.",
                "recipes": []
            })


        # Clean and remove duplicates
        user_ingredients = list(set(
            ingredient.lower().strip()
            for ingredient in user_ingredients
            if ingredient.strip()
        ))


        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        # ==========================================
        # SQL PLACEHOLDERS
        # ==========================================

        placeholders = ",".join(
            ["%s"] * len(user_ingredients)
        )


        # ==========================================
        # RECIPE MATCH QUERY
        # ==========================================

        query = f"""
            SELECT
                r.id,
                r.name,
                r.description,
                r.recipe_file,

                COUNT(DISTINCT ri.ingredient_id)
                    AS total_ingredients,

                COUNT(
                    DISTINCT CASE
                        WHEN LOWER(i.name) IN ({placeholders})
                        THEN ri.ingredient_id
                    END
                ) AS matched_ingredients

            FROM recipes r

            JOIN recipe_ingredients ri
                ON r.id = ri.recipe_id

            JOIN ingredients i
                ON ri.ingredient_id = i.id

            GROUP BY
                r.id,
                r.name,
                r.description,
                r.recipe_file

            HAVING matched_ingredients > 0

            ORDER BY
                matched_ingredients DESC,
                total_ingredients ASC
        """


        # ==========================================
        # EXECUTE QUERY
        # ==========================================

        cursor.execute(
            query,
            user_ingredients
        )


        recipes = cursor.fetchall()


        # ==========================================
        # CALCULATE MATCH %
        # ==========================================

        for recipe in recipes:

            matched = recipe["matched_ingredients"]

            total = recipe["total_ingredients"]


            if total > 0:

                percentage = (
                    matched / total
                ) * 100

                recipe["match_percentage"] = round(
                    percentage
                )

            else:

                recipe["match_percentage"] = 0


        cursor.close()

        connection.close()


        # ==========================================
        # SEND RESULT TO CHATBOT
        # ==========================================

        return jsonify({

            "success": True,

            "ingredients": user_ingredients,

            "recipes": recipes

        })


    except Exception as e:

        print("CUSTOM FOOD ERROR:", e)

        return jsonify({

            "success": False,

            "message": str(e),

            "recipes": []

        }), 500