const ingredientName = document.getElementById("ingredientName");
const ingredientQuantity = document.getElementById("ingredientQuantity");
const addIngredient = document.getElementById("addIngredient");
const ingredientList = document.getElementById("ingredientList");
const createDish = document.getElementById("createDish");

let ingredients = [];


/* =========================================
   ADD INGREDIENT
========================================= */

addIngredient.addEventListener("click", function () {

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


    const ingredient = {
        name: name,
        quantity: quantity
    };

    ingredients.push(ingredient);

    displayIngredients();

    ingredientName.value = "";
    ingredientQuantity.value = "";

    ingredientName.focus();
});


/* =========================================
   DISPLAY INGREDIENTS
========================================= */

function displayIngredients() {

    ingredientList.innerHTML = "";

    if (ingredients.length === 0) {

        ingredientList.innerHTML = `
            <div class="empty-message">
                No ingredients added yet.
            </div>
        `;

        return;
    }


    ingredients.forEach(function (ingredient, index) {

        const chip = document.createElement("div");

        chip.className = "ingredient-chip";

        chip.innerHTML = `
            <span>${ingredient.name}</span>

            <strong>${ingredient.quantity}</strong>

            <button
                type="button"
                class="remove-ingredient"
                onclick="removeIngredient(${index})">
                ×
            </button>
        `;

        ingredientList.appendChild(chip);
    });
}


/* =========================================
   REMOVE INGREDIENT
========================================= */

function removeIngredient(index) {

    ingredients.splice(index, 1);

    displayIngredients();
}


/* =========================================
   ENTER KEY SUPPORT
========================================= */

ingredientName.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        ingredientQuantity.focus();
    }
});


ingredientQuantity.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        addIngredient.click();
    }
});


/* =========================================
   CREATE DISH
========================================= */

createDish.addEventListener("click", function () {

    if (ingredients.length === 0) {

        alert(
            "Please add at least one ingredient before creating your dish."
        );

        return;
    }


    const spiceLevel =
        document.getElementById("spiceLevel").value;

    const servings =
        document.getElementById("servings").value;

    const cookingTime =
        document.getElementById("cookingTime").value;


    const customizedData = {

        ingredients: ingredients,

        spiceLevel: spiceLevel,

        servings: servings,

        cookingTime: cookingTime
    };


    localStorage.setItem(
        "customizedFood",
        JSON.stringify(customizedData)
    );


    window.location.href = "custom-result.html";
});