document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("globalSearch");
    const searchBtn = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");

    if (!searchInput || !searchResults) return;

    function searchRecipes() {

        const query = searchInput.value.trim();

        if (query.length === 0) {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            return;
        }

        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Search request failed");
                }

                return response.json();
            })
            .then(data => {

                searchResults.innerHTML = "";

                if (!data || data.length === 0) {
                    searchResults.innerHTML =
                        `<div class="no-results">No recipes found</div>`;

                    searchResults.style.display = "block";
                    return;
                }

                data.forEach(recipe => {

                    const item = document.createElement("div");

                    item.className = "search-result-item";

                    item.innerHTML = `
                        <h4>${recipe.name}</h4>
                        <p>${recipe.description || ""}</p>
                    `;

                    item.addEventListener("click", () => {

                        if (recipe.url) {
                            window.location.href = recipe.url;
                        }

                    });

                    searchResults.appendChild(item);
                });

                searchResults.style.display = "block";
            })
            .catch(error => {

                console.error("Search error:", error);

                searchResults.innerHTML =
                    `<div class="no-results">
                        Unable to search recipes.
                    </div>`;

                searchResults.style.display = "block";
            });
    }

    searchBtn?.addEventListener("click", searchRecipes);

    searchInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            searchRecipes();
        }

    });

    searchInput.addEventListener("input", searchRecipes);

});