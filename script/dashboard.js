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

        searchResults.innerHTML = recipes.map(recipe => {

            let recipePage = "";

            if (recipe.recipe_id == 1) {
                recipePage = "recipes/tomato-rice.html";
            }
            else if (recipe.recipe_id == 2) {
                recipePage = "recipes/egg-gravy.html";
            }
            else if (recipe.recipe_id == 3) {
                recipePage = "recipes/fried-rice.html";
            }
            else if (recipe.recipe_id == 4) {
                recipePage = "recipes/paneer-butter-masala.html";
            }
            else if (recipe.recipe_id == 5) {
                recipePage = "recipes/masala-dosa.html";
            }

            return `
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

                    ${
                        recipePage
                        ? `<button onclick="window.location.href='${recipePage}'">
                             View Recipe
                           </button>`
                        : ""
                    }

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error("Search error:", error);

        searchResults.innerHTML = `
            <p class="no-results">
                Unable to connect to recipe database.
            </p>
        `;
    }
});