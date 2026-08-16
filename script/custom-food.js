// ============================================================
// COOK WITH ME - CUSTOM FOOD
// ============================================================

const ingredientName = document.getElementById("ingredientName");
const ingredientQuantity = document.getElementById("ingredientQuantity");
const addIngredient = document.getElementById("addIngredient");
const ingredientList = document.getElementById("ingredientList");
const createDish = document.getElementById("createDish");

let ingredients = [];


// ============================================================
// INITIAL DISPLAY
// ============================================================

displayIngredients();


// ============================================================
// ADD INGREDIENT BUTTON
// ============================================================

if (addIngredient) {
    addIngredient.addEventListener("click", addNewIngredient);
}


// ============================================================
// ENTER KEY - INGREDIENT NAME
// ============================================================

if (ingredientName) {
    ingredientName.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            event.preventDefault();
            addNewIngredient();
        }

    });
}


// ============================================================
// ENTER KEY - QUANTITY
// ============================================================

if (ingredientQuantity) {
    ingredientQuantity.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            event.preventDefault();
            addNewIngredient();
        }

    });
}


// ============================================================
// ADD NEW INGREDIENT
// ============================================================

function addNewIngredient() {

    if (!ingredientName || !ingredientQuantity) {
        return;
    }

    const name = ingredientName.value.trim();
    const quantity = ingredientQuantity.value.trim();


    // --------------------------------------------------------
    // CHECK NAME
    // --------------------------------------------------------

    if (name === "") {

        alert("Please enter an ingredient.");

        ingredientName.focus();

        return;
    }


    // --------------------------------------------------------
    // CHECK QUANTITY
    // --------------------------------------------------------

    if (quantity === "") {

        alert("Please enter the quantity.");

        ingredientQuantity.focus();

        return;
    }


    // --------------------------------------------------------
    // NORMALIZE NAME
    // --------------------------------------------------------

    const normalizedName = name
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();


    // --------------------------------------------------------
    // CHECK DUPLICATE
    // --------------------------------------------------------

    const alreadyExists = ingredients.some(function (ingredient) {

        return ingredient.name
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim() === normalizedName;

    });


    if (alreadyExists) {

        alert("This ingredient is already added.");

        ingredientName.focus();

        return;
    }


    // --------------------------------------------------------
    // ADD INGREDIENT
    // --------------------------------------------------------

    ingredients.push({

        name: name,

        quantity: quantity

    });


    // --------------------------------------------------------
    // CLEAR INPUTS
    // --------------------------------------------------------

    ingredientName.value = "";
    ingredientQuantity.value = "";


    // --------------------------------------------------------
    // UPDATE LIST
    // --------------------------------------------------------

    displayIngredients();


    ingredientName.focus();
}


// ============================================================
// DISPLAY INGREDIENTS
// ============================================================

function displayIngredients() {

    if (!ingredientList) {
        return;
    }


    // --------------------------------------------------------
    // EMPTY LIST
    // --------------------------------------------------------

    if (ingredients.length === 0) {

        ingredientList.innerHTML = `
            <div class="empty-message">
                No ingredients added yet.
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // INGREDIENT LIST
    // --------------------------------------------------------

    ingredientList.innerHTML = ingredients.map(
        function (ingredient, index) {

            return `
                <div class="ingredient-item">

                    <div class="ingredient-info">

                        <strong>
                            ${escapeHTML(ingredient.name)}
                        </strong>

                        <span>
                            ${escapeHTML(ingredient.quantity)}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="remove-ingredient"
                        onclick="removeIngredient(${index})"
                        aria-label="Remove ingredient">

                        ✕

                    </button>

                </div>
            `;

        }
    ).join("");
}


// ============================================================
// REMOVE INGREDIENT
// ============================================================

function removeIngredient(index) {

    if (
        index < 0 ||
        index >= ingredients.length
    ) {
        return;
    }


    ingredients.splice(index, 1);

    displayIngredients();
}


// ============================================================
// CREATE DISH BUTTON
// ============================================================

if (createDish) {

    createDish.addEventListener(
        "click",
        findDish
    );

}


// ============================================================
// FIND / CREATE DISH
// ============================================================

async function findDish() {

    // --------------------------------------------------------
    // CHECK INGREDIENTS
    // --------------------------------------------------------

    if (ingredients.length === 0) {

        alert(
            "Please add at least one ingredient."
        );

        return;
    }


    // --------------------------------------------------------
    // GET OPTIONAL SETTINGS
    // --------------------------------------------------------

    const spiceElement =
        document.getElementById("spiceLevel");

    const servingsElement =
        document.getElementById("servings");

    const cookingTimeElement =
        document.getElementById("cookingTime");


    const spiceLevel =
        spiceElement
            ? spiceElement.value
            : "medium";


    const servings =
        servingsElement
            ? servingsElement.value
            : "2";


    const cookingTime =
        cookingTimeElement
            ? cookingTimeElement.value
            : "15";


    // --------------------------------------------------------
    // DISABLE BUTTON
    // --------------------------------------------------------

    if (createDish) {

        createDish.disabled = true;

        createDish.textContent =
            "🍳 Creating your dish...";

    }


    try {

        // ====================================================
        // SEND DATA TO FLASK
        // ====================================================

        const response = await fetch(
            "http://127.0.0.1:5000/custom-food",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    ingredients: ingredients.map(
                        function (ingredient) {

                            return {

                                name: ingredient.name
                                    .trim()
                                    .toLowerCase(),

                                quantity:
                                    ingredient.quantity
                                    .trim()

                            };

                        }
                    ),

                    spiceLevel: spiceLevel,

                    servings: servings,

                    cookingTime: cookingTime

                })

            }
        );


        // ====================================================
        // HTTP ERROR
        // ====================================================

        if (!response.ok) {

            let errorMessage =
                `Server returned ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {
                    errorMessage =
                        errorData.message;
                }

            } catch (jsonError) {

                console.warn(
                    "Could not read server error.",
                    jsonError
                );

            }

            throw new Error(errorMessage);
        }


        // ====================================================
        // READ JSON
        // ====================================================

        const result =
            await response.json();


        console.log(
            "Custom food result:",
            result
        );


        // ====================================================
        // CHECK SUCCESS
        // ====================================================

        if (!result || result.success !== true) {

            alert(
                result && result.message
                    ? result.message
                    : "Unable to create the dish."
            );

            return;
        }


        // ====================================================
        // CHECK RECIPE
        // ====================================================

        if (!result.recipe) {

            alert(
                "The server did not return a recipe."
            );

            return;
        }


        // ====================================================
        // SAVE COMPLETE RESULT
        // ====================================================

        localStorage.setItem(
            "customFoodResult",
            JSON.stringify(result)
        );


        // ====================================================
        // SAVE USER INGREDIENTS
        // ====================================================

        localStorage.setItem(
            "customFoodIngredients",
            JSON.stringify(ingredients)
        );


        // ====================================================
        // SAVE RECIPE TYPE
        // ====================================================

        localStorage.setItem(
            "customFoodType",
            result.type || "custom"
        );


        // ====================================================
        // OPEN RESULT PAGE
        // ====================================================

        window.location.href =
            "custom-food-result.html";

    }


    // ========================================================
    // ERROR
    // ========================================================

    catch (error) {

        console.error(
            "Custom food error:",
            error
        );


        alert(
            "Unable to connect to the recipe server.\n\n" +
            "Please make sure Flask is running on port 5000."
        );

    }


    // ========================================================
    // ENABLE BUTTON AGAIN
    // ========================================================

    finally {

        if (createDish) {

            createDish.disabled = false;

            createDish.textContent =
                "🍳 Create My Dish";

        }

    }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// MAKE REMOVE FUNCTION AVAILABLE TO HTML
// ============================================================

window.removeIngredient = removeIngredient;