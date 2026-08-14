const ingredientName = document.getElementById("ingredientName");
const ingredientQuantity = document.getElementById("ingredientQuantity");
const addIngredient = document.getElementById("addIngredient");
const ingredientList = document.getElementById("ingredientList");
const createDish = document.getElementById("createDish");

let ingredients = [];


// ===============================
// ADD INGREDIENT
// ===============================

addIngredient.addEventListener("click", function () {

    const name = ingredientName.value.trim();
    const quantity = ingredientQuantity.value.trim();

    if (name === "") {
        alert("Please enter an ingredient.");
        return;
    }

    if (quantity === "") {
        alert("Please enter the quantity.");
        return;
    }

    ingredients.push({
        name: name,
        quantity: quantity
    });

    ingredientName.value = "";
    ingredientQuantity.value = "";

    displayIngredients();
});


// ===============================
// DISPLAY INGREDIENTS
// ===============================

function displayIngredients() {

    if (ingredients.length === 0) {

        ingredientList.innerHTML = `
            <div class="empty-message">
                No ingredients added yet.
            </div>
        `;

        return;
    }

    ingredientList.innerHTML = ingredients.map((ingredient, index) => {

        return `
            <div class="ingredient-item">

                <div>
                    <strong>${ingredient.name}</strong>
                    <span>${ingredient.quantity}</span>
                </div>

                <button
                    type="button"
                    onclick="removeIngredient(${index})">
                    ✕
                </button>

            </div>
        `;

    }).join("");
}


// ===============================
// REMOVE INGREDIENT
// ===============================

function removeIngredient(index) {

    ingredients.splice(index, 1);

    displayIngredients();
}


// ===============================
// CREATE DISH
// ===============================

createDish.addEventListener("click", async function () {

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


    try {

        createDish.disabled = true;
        createDish.textContent = "🍳 Finding your dish...";


        const response = await fetch(
            "http://127.0.0.1:5000/custom-food",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    ingredients: ingredients,

                    spiceLevel: spiceLevel,

                    servings: servings,

                    cookingTime: cookingTime

                })
            }
        );


        if (!response.ok) {

            throw new Error(
                "Server error: " + response.status
            );

        }


        const result = await response.json();

        console.log("Custom food result:", result);


        if (result.length === 0) {

            alert(
                "Sorry! No matching recipe was found with your ingredients."
            );

            return;
        }


        // Save result for the next page

        localStorage.setItem(
            "customFoodResult",
            JSON.stringify(result)
        );


        // Open result page

        window.location.href =
            "custom-food-result.html";


    } catch (error) {

        console.error(
            "Custom food error:",
            error
        );

        alert(
            "Unable to connect to the recipe server."
        );

    } finally {

        createDish.disabled = false;

        createDish.textContent =
            "🍳 Create My Dish";

    }

});