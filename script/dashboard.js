const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async function () {

    const query = this.value.trim();

    // Empty search
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
                <p>Category: ${recipe.category}</p>
                <p>Cooking Time: ${recipe.cooking_time} minutes</p>
                <p>Difficulty: ${recipe.difficulty}</p>
                <p>Servings: ${recipe.servings}</p>
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