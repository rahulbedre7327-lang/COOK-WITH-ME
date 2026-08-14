const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async function () {

    const query = this.value.trim();

    if (query === "") {
        searchResults.innerHTML = "";
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const recipes = await response.json();

        if (recipes.length === 0) {

            searchResults.innerHTML = `
                <p class="no-results">
                    No recipes found.
                </p>
            `;

            return;
        }

        searchResults.innerHTML = recipes.map(recipe => `

            <div class="search-result">

                <h3>${recipe.recipe_name}</h3>

                <p>
                    Category: ${recipe.category}
                </p>

                <p>
                    Cooking Time: ${recipe.cooking_time} minutes
                </p>

                <p>
                    Difficulty: ${recipe.difficulty}
                </p>

                <p>
                    Servings: ${recipe.servings}
                </p>

                <button
                    onclick="openRecipe(${recipe.recipe_id})"
                    class="view-recipe-btn">
                    View Recipe
                </button>

            </div>

        `).join("");

    } catch (error) {

        console.error("Search error:", error);

        searchResults.innerHTML = `
            <p class="no-results">
                Unable to connect to recipe database.
            </p>
        `;
    }
});


function openRecipe(recipeId) {

    const recipePages = {

        6: "recipes/chapati-curry.html",

        7: "recipes/chicken-biryani.html",

        8: "recipes/brownie.html",

        9: "recipes/burger.html",

        10: "recipes/butter-chicken.html"

    };

    if (recipePages[recipeId]) {

        window.location.href = recipePages[recipeId];

    } else {

        alert("Recipe page is not available yet.");

    }
}