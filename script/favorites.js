// ================================
// FAVORITES SYSTEM
// ================================

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}


// ================================
// ADD RECIPE TO FAVORITES
// ================================

function addToFavorites(recipe) {

    let favorites = getFavorites();

    // Check if recipe already exists
    const alreadyExists = favorites.some(
        favorite => favorite.name === recipe.name
    );

    if (!alreadyExists) {
        favorites.push(recipe);
        saveFavorites(favorites);

        alert(recipe.name + " added to favorites ❤️");
    } else {
        alert(recipe.name + " is already in favorites ❤️");
    }
}


// ================================
// REMOVE RECIPE
// ================================

function removeFromFavorites(recipeName) {

    let favorites = getFavorites();

    favorites = favorites.filter(
        favorite => favorite.name !== recipeName
    );

    saveFavorites(favorites);

    loadFavorites();
}


// ================================
// DISPLAY FAVORITES
// ================================

function loadFavorites() {

    const container = document.querySelector(".favorites-container");

    if (!container) return;

    const favorites = getFavorites();

    container.innerHTML = "";

    if (favorites.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                ❤️ No favorite recipes yet.
            </div>
        `;

        return;
    }

    favorites.forEach(recipe => {

        const card = document.createElement("div");

        card.className = "favorite-card";

        card.innerHTML = `
            <div class="favorite-info">
                <h2>${recipe.name}</h2>
                <p>
                    ${recipe.rating || "⭐⭐⭐⭐⭐"}
                    |
                    ⏱ ${recipe.time || "30 Minutes"}
                </p>
            </div>

            <button class="remove-btn">
                Remove
            </button>
        `;

        const removeButton = card.querySelector(".remove-btn");

        removeButton.addEventListener("click", function () {

            if (confirm(`Remove ${recipe.name} from favorites?`)) {
                removeFromFavorites(recipe.name);
            }

        });

        container.appendChild(card);
    });
}


// ================================
// LOAD WHEN PAGE OPENS
// ================================

document.addEventListener("DOMContentLoaded", function () {
    loadFavorites();
});
// ==========================================
// COOK WITH ME - FAVORITES
// ==========================================


function getFavorites() {

    return JSON.parse(
        localStorage.getItem("favorites")
    ) || [];

}


// ==========================================
// DISPLAY FAVORITES
// ==========================================

function loadFavorites() {

    const container =
        document.querySelector(".favorites-container");


    if (!container) return;


    const favorites = getFavorites();


    container.innerHTML = "";


    // No favorites
    if (favorites.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                ❤️ No favorite recipes yet.
            </div>
        `;

        return;
    }


    // Display recipes
    favorites.forEach(function (recipe) {

        const card =
            document.createElement("div");


        card.className = "favorite-card";


        card.innerHTML = `

            <div class="favorite-info">

                <h2>${recipe.name}</h2>

                <p>
                    ${recipe.rating}
                    |
                    ⏱ ${recipe.time}
                </p>

            </div>


            <div>

                <a
                    href="${recipe.url}"
                    class="view-btn"
                >
                    View Recipe
                </a>


                <button
                    class="remove-btn"
                    data-name="${recipe.name}"
                >
                    Remove
                </button>

            </div>

        `;


        container.appendChild(card);

    });


    // Add remove functionality
    const removeButtons =
        document.querySelectorAll(".remove-btn");


    removeButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const recipeName =
                    this.dataset.name;


                removeFavorite(recipeName);

            }
        );

    });

}


// ==========================================
// REMOVE FAVORITE
// ==========================================

function removeFavorite(recipeName) {

    let favorites = getFavorites();


    favorites = favorites.filter(
        recipe => recipe.name !== recipeName
    );


    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );


    // Reload favorites
    loadFavorites();

}


// ==========================================
// LOAD PAGE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadFavorites
);