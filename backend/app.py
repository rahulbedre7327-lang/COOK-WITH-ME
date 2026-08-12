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


@app.route("/")
def home():
    return "Cook With Me Flask Server is running!"


@app.route("/search")
def search():

    query = request.args.get("q", "").strip()

    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT recipe_id,
               recipe_name,
               category,
               cooking_time,
               difficulty,
               servings
        FROM recipes
        WHERE recipe_name LIKE %s
    """

    cursor.execute(sql, ("%" + query + "%",))

    recipes = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(recipes)


if __name__ == "__main__":
    app.run(debug=True)