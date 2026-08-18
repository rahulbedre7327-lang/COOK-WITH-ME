import os
import re
import mysql.connector
from bs4 import BeautifulSoup


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
# RECIPE FOLDER
# ============================================================

RECIPE_FOLDER = "recipes"


# ============================================================
# CONNECT TO MYSQL
# ============================================================

try:
    db = mysql.connector.connect(**DB_CONFIG)
    cursor = db.cursor(dictionary=True)

    print("======================================")
    print("Connected to CookWithMe database")
    print("======================================")

except mysql.connector.Error as e:
    print("MySQL connection failed:")
    print(e)
    exit()


# ============================================================
# NORMALIZE TEXT
# ============================================================

def normalize_text(text):
    if not text:
        return ""

    text = text.lower().strip()

    # Replace special fractions
    text = text.replace("½", "1/2")
    text = text.replace("¼", "1/4")
    text = text.replace("¾", "3/4")
    text = text.replace("⅓", "1/3")
    text = text.replace("⅔", "2/3")

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text


# ============================================================
# CLEAN RECIPE NAME
# ============================================================

def clean_recipe_name(name):

    name = name.strip()

    # Remove common prefixes
    name = re.sub(
        r"^(lady finger|veg|vegetable)\s+",
        "",
        name,
        flags=re.IGNORECASE
    )

    return name.strip()


# ============================================================
# GET SECTION
# ============================================================

def get_section(soup, heading_text):

    heading = None

    for h2 in soup.find_all("h2"):

        text = h2.get_text(" ", strip=True)

        if heading_text.lower() in text.lower():
            heading = h2
            break

    if not heading:
        return []

    next_element = heading.find_next_sibling()

    if not next_element:
        return []

    if next_element.name in ["ul", "ol"]:

        return [
            li.get_text(" ", strip=True)
            for li in next_element.find_all("li")
        ]

    return []


# ============================================================
# GET TEXT SECTION
# ============================================================

def get_text_section(soup, heading_text):

    heading = None

    for h2 in soup.find_all("h2"):

        text = h2.get_text(" ", strip=True)

        if heading_text.lower() in text.lower():
            heading = h2
            break

    if not heading:
        return ""

    next_element = heading.find_next_sibling()

    if not next_element:
        return ""

    if next_element.name in ["p", "div"]:

        return next_element.get_text(
            " ",
            strip=True
        )

    if next_element.name in ["ul", "ol"]:

        items = []

        for li in next_element.find_all("li"):
            items.append(
                li.get_text(" ", strip=True)
            )

        return "\n".join(items)

    return next_element.get_text(
        " ",
        strip=True
    )


# ============================================================
# GET INFO BOX VALUE
# ============================================================

def get_info_value(soup, label):

    for box in soup.select(".info-box"):

        h3 = box.find("h3")

        if not h3:
            continue

        title = h3.get_text(
            " ",
            strip=True
        ).lower()

        if title == label.lower():

            p = box.find("p")

            if p:
                return p.get_text(
                    " ",
                    strip=True
                )

    return ""


# ============================================================
# GET COOKING TIME AND SERVINGS
# ============================================================

def get_time_and_servings(soup):

    cooking_time = None
    servings = None

    hero = soup.select_one(".hero")

    if hero:

        text = hero.get_text(
            " ",
            strip=True
        )

        # Example:
        # 20 Minutes
        # 45 Minutes

        time_match = re.search(
            r"(\d+)\s*Minutes?",
            text,
            re.IGNORECASE
        )

        if time_match:
            cooking_time = int(
                time_match.group(1)
            )

        # Example:
        # 5 Servings
        # 8 Pieces

        serving_match = re.search(
            r"(\d+)\s*(Servings?|Pieces?)",
            text,
            re.IGNORECASE
        )

        if serving_match:
            servings = int(
                serving_match.group(1)
            )

    return cooking_time, servings


# ============================================================
# CLEAN INGREDIENT NAME
# ============================================================

def clean_ingredient_name(line):

    original = line.strip()

    if not original:
        return ""

    # Remove parenthetical information
    name = re.sub(
        r"\([^)]*\)",
        "",
        original
    )

    # Remove quantities at the beginning
    quantity_pattern = r"""
        ^
        (?:
            \d+\s+\d+/\d+
            |
            \d+/\d+
            |
            \d+(?:\.\d+)?
            |
            \d+\s*x\s*\d+
        )
        \s*
        (?:
            cups?|cup
            |tbsp|tbsps|tablespoons?
            |tsp|tsps|teaspoons?
            |kg|kgs
            |g|gm|gms|grams?
            |ml|l
            |nos?|pieces?
            |large|small|medium
        )?
        \s*
        (?:of\s+)?
    """

    name = re.sub(
        quantity_pattern,
        "",
        name,
        flags=re.IGNORECASE | re.VERBOSE
    )

    # Remove common preparation descriptions
    name = re.sub(
        r"\s+(sliced|chopped|diced|grated|crushed|"
        r"finely chopped|roughly chopped|as required|"
        r"to taste|a few|for frying|for cooking)$",
        "",
        name,
        flags=re.IGNORECASE
    )

    # Remove common descriptors
    name = re.sub(
        r"^(fresh|large|small|medium)\s+",
        "",
        name,
        flags=re.IGNORECASE
    )

    name = name.strip(" -:")

    return name


# ============================================================
# FIND EXISTING INGREDIENT
# ============================================================

def find_ingredient(name):

    normalized = normalize_text(name)

    if not normalized:
        return None

    cursor.execute(
        """
        SELECT ingredient_id, ingredient_name
        FROM ingredients
        """
    )

    ingredients = cursor.fetchall()

    # Exact match
    for ingredient in ingredients:

        db_name = normalize_text(
            ingredient["ingredient_name"]
        )

        if db_name == normalized:
            return ingredient["ingredient_id"]

    # Partial match
    for ingredient in ingredients:

        db_name = normalize_text(
            ingredient["ingredient_name"]
        )

        if (
            normalized in db_name
            or db_name in normalized
        ):
            return ingredient["ingredient_id"]

    return None


# ============================================================
# CREATE INGREDIENT IF REQUIRED
# ============================================================

def get_or_create_ingredient(name):

    name = clean_ingredient_name(name)

    if not name:
        return None

    ingredient_id = find_ingredient(name)

    if ingredient_id:
        return ingredient_id

    print(
        f"   + New ingredient: {name}"
    )

    cursor.execute(
        """
        INSERT INTO ingredients (ingredient_name)
        VALUES (%s)
        """,
        (name,)
    )

    db.commit()

    return cursor.lastrowid


# ============================================================
# IMPORT ONE RECIPE
# ============================================================

def import_recipe(filepath):

    filename = os.path.basename(filepath)

    print("\n--------------------------------------")
    print("Processing:", filename)
    print("--------------------------------------")

    try:

        with open(
            filepath,
            "r",
            encoding="utf-8"
        ) as file:

            html = file.read()

    except Exception as e:

        print("Could not read file:", e)
        return

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    # --------------------------------------------------------
    # RECIPE NAME
    # --------------------------------------------------------

    hero_title = soup.select_one(
        ".hero h1"
    )

    if hero_title:

        recipe_name = hero_title.get_text(
            " ",
            strip=True
        )

    else:

        title = soup.find("title")

        if title:
            recipe_name = title.get_text(
                " ",
                strip=True
            ).split("|")[0].strip()

        else:
            recipe_name = filename.replace(
                ".html",
                ""
            )

    recipe_name = clean_recipe_name(
        recipe_name
    )

    # --------------------------------------------------------
    # OTHER DATA
    # --------------------------------------------------------

    category = get_info_value(
        soup,
        "Category"
    )

    difficulty = get_info_value(
        soup,
        "Difficulty"
    )

    cooking_time, servings = get_time_and_servings(
        soup
    )

    # --------------------------------------------------------
    # PROCEDURE
    # --------------------------------------------------------

    procedure = get_section(
        soup,
        "Procedure"
    )

    instructions = "\n".join(
        procedure
    )

    # --------------------------------------------------------
    # INGREDIENTS
    # --------------------------------------------------------

    ingredients = get_section(
        soup,
        "Ingredients"
    )

    # --------------------------------------------------------
    # CHECK DUPLICATE
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT recipe_id
        FROM recipes
        WHERE LOWER(recipe_name) = LOWER(%s)
        LIMIT 1
        """,
        (recipe_name,)
    )

    existing = cursor.fetchone()

    if existing:

        recipe_id = existing["recipe_id"]

        print(
            f"Already exists: {recipe_name}"
        )

        print(
            f"Recipe ID: {recipe_id}"
        )

    else:

        # ----------------------------------------------------
        # INSERT RECIPE
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO recipes
            (
                recipe_name,
                category,
                cooking_time,
                difficulty,
                servings,
                instructions,
                recipe_file
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                recipe_name,
                category,
                cooking_time,
                difficulty,
                servings,
                instructions,
                filename
            )
        )

        db.commit()

        recipe_id = cursor.lastrowid

        print(
            f"Added recipe: {recipe_name}"
        )

        print(
            f"Recipe ID: {recipe_id}"
        )

    # --------------------------------------------------------
    # INGREDIENT RELATIONSHIPS
    # --------------------------------------------------------

    for ingredient_line in ingredients:

        ingredient_name = clean_ingredient_name(
            ingredient_line
        )

        if not ingredient_name:
            continue

        ingredient_id = get_or_create_ingredient(
            ingredient_name
        )

        if not ingredient_id:
            continue

        # ----------------------------------------------------
        # CHECK EXISTING RELATIONSHIP
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT *
            FROM recipe_ingredients
            WHERE recipe_id = %s
            AND ingredient_id = %s
            LIMIT 1
            """,
            (
                recipe_id,
                ingredient_id
            )
        )

        relation = cursor.fetchone()

        if not relation:

            cursor.execute(
                """
                INSERT INTO recipe_ingredients
                (
                    recipe_id,
                    ingredient_id
                )
                VALUES
                (
                    %s,
                    %s
                )
                """,
                (
                    recipe_id,
                    ingredient_id
                )
            )

    db.commit()

    print(
        f"Ingredients linked: {len(ingredients)}"
    )


# ============================================================
# IMPORT ALL RECIPES
# ============================================================

def main():

    if not os.path.exists(
        RECIPE_FOLDER
    ):

        print(
            f"ERROR: '{RECIPE_FOLDER}' folder not found."
        )

        print(
            "Create the folder and put your recipe HTML files inside it."
        )

        return

    files = [
        file
        for file in os.listdir(
            RECIPE_FOLDER
        )
        if file.lower().endswith(".html")
    ]

    files.sort()

    print("\n======================================")
    print("COOK WITH ME - RECIPE IMPORTER")
    print("======================================")

    print(
        f"Recipes found: {len(files)}"
    )

    if len(files) == 0:

        print(
            "No HTML recipe files found."
        )

        return

    successful = 0

    for filename in files:

        filepath = os.path.join(
            RECIPE_FOLDER,
            filename
        )

        try:

            import_recipe(
                filepath
            )

            successful += 1

        except Exception as e:

            print(
                f"ERROR importing {filename}"
            )

            print(e)

            db.rollback()

    print("\n======================================")
    print("IMPORT COMPLETE")
    print("======================================")

    print(
        f"Files processed: {successful}/{len(files)}"
    )

    cursor.close()
    db.close()


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    main()