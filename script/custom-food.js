const ingredientName = document.getElementById("ingredientName");
const ingredientQuantity = document.getElementById("ingredientQuantity");
const addIngredient = document.getElementById("addIngredient");
const ingredientList = document.getElementById("ingredientList");
const createDish = document.getElementById("createDish");

let ingredients = [];


// ==========================================
// ADD INGREDIENT
// ==========================================

addIngredient.addEventListener("click", addNewIngredient);


// Allow Enter key to add ingredient
ingredientName.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addNewIngredient();
    }
});

ingredientQuantity.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addNewIngredient();
    }
});


function addNewIngredient() {

    const name = ingredientName.value.trim();
    const quantity = ingredientQuantity.value.trim();

    if (name === "") {
        alert("Please enter an ingredient.");
        ingredientName.focus();
        return;
    }

    if (quantity === "") {
        alert("Please enter the quantity.");
        ingredientQuantity.focus();
        return;
    }


    // Normalize ingredient name
    const normalizedName = name.toLowerCase();


    // Check duplicate ingredient
    const alreadyExists = ingredients.some(
        ingredient =>
            ingredient.name.toLowerCase() === normalizedName
    );


    if (alreadyExists) {
        alert("This ingredient is already added.");
        return;
    }


    ingredients.push({
        name: name,
        quantity: quantity
    });


    ingredientName.value = "";
    ingredientQuantity.value = "";

    displayIngredients();

    ingredientName.focus();
}


// ==========================================
// DISPLAY INGREDIENTS
// ==========================================

function displayIngredients() {

    if (ingredients.length === 0) {

        ingredientList.innerHTML = `
            <div class="empty-message">
                No ingredients added yet.
            </div>
        `;

        return;
    }


    ingredientList.innerHTML = ingredients.map(
        (ingredient, index) => {

            return `
                <div class="ingredient-item">

                    <div>
                        <strong>${escapeHTML(ingredient.name)}</strong>
                        <span>${escapeHTML(ingredient.quantity)}</span>
                    </div>

                    <button
                        type="button"
                        onclick="removeIngredient(${index})">
                        ✕
                    </button>

                </div>
            `;
        }
    ).join("");
}


// ==========================================
// REMOVE INGREDIENT
// ==========================================

function removeIngredient(index) {

    ingredients.splice(index, 1);

    displayIngredients();
}


// ==========================================
// CREATE DISH
// ==========================================

createDish.addEventListener("click", findDish);


async function findDish() {

    if (ingredients.length === 0) {

        alert("Please add at least one ingredient.");

        return;
    }


    const spiceLevel =
        document.getElementById("spiceLevel").value;

    const servings =
        document.getElementById("servings").value;

    const cookingTime =
        document.getElementById("cookingTime").value;


    // Disable button while searching
    createDish.disabled = true;
    createDish.textContent = "🍳 Finding your dish...";


    try {

        const response = await fetch(
            "http://127.0.0.1:5000/custom-food",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    ingredients: ingredients.map(
                        ingredient => ({
                            name: ingredient.name.trim().toLowerCase(),
                            quantity: ingredient.quantity
                        })
                    ),

                    spiceLevel: spiceLevel,

                    servings: servings,

                    cookingTime: cookingTime

                })
            }
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const result = await response.json();

        console.log(
            "Custom food result:",
            result
        );


        // ======================================
        // NO RECIPE FOUND
        // ======================================

        if (!Array.isArray(result) || result.length === 0) {

            localStorage.removeItem(
                "customFoodResult"
            );

            alert(
                "Sorry! No matching recipe was found with your ingredients."
            );

            return;
        }


        // ======================================
        // SAVE RESULT
        // ======================================

        localStorage.setItem(
            "customFoodResult",
            JSON.stringify(result)
        );


        // Also save user's ingredients
        localStorage.setItem(
            "customFoodIngredients",
            JSON.stringify(ingredients)
        );


        // ======================================
        // OPEN RESULT PAGE
        // ======================================

        window.location.href =
            "custom-food-result.html";


    } catch (error) {

        console.error(
            "Custom food error:",
            error
        );


        alert(
            "Unable to connect to the recipe server. Please make sure Flask is running."
        );


    } finally {

        createDish.disabled = false;

        createDish.textContent =
            "🍳 Create My Dish";
    }
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}