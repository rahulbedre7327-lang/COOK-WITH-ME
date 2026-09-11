from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import re

app = Flask(__name__)
CORS(app)


def normalize_ingredient_names(raw_ingredients):
    """Accept ingredient payloads from both plain strings and objects like
    {"name":"Tomato","quantity":"2"}, returning a deduplicated lowercase
    list the query layer already expects.
    """
    if not raw_ingredients:
        return []

    cleaned = []
    for item in raw_ingredients:
        if isinstance(item, dict):
            name = item.get("name") or item.get("ingredient")
            if not name:
                continue
            ingredient = str(name).strip().lower()
        elif isinstance(item, str):
            ingredient = item.strip().lower()
        else:
            ingredient = str(item).strip().lower()

        if ingredient:
            cleaned.append(ingredient)

    return list(dict.fromkeys(cleaned))


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

        data = request.get_json(silent=True) or {}

        user_ingredients = normalize_ingredient_names(
            data.get("ingredients", [])
        )

        if not user_ingredients:

            return jsonify({
                "success": False,
                "message": "No ingredients received.",
                "recipes": [],
                "recipe": None
            })


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

            "recipes": recipes,

            "recipe": recipes[0] if recipes else None,

            "type": "custom"

        })


    except Exception as e:

        print("CUSTOM FOOD ERROR:", e)

        return jsonify({

            "success": False,

            "message": str(e),

            "recipes": []

        }), 500