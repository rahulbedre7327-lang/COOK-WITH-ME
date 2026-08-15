/* =========================================================
   COOK WITH ME - GLOBAL LIVE RECIPE SEARCH
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("globalSearch");
    const searchResults = document.getElementById("searchResults");
    const noResults = document.getElementById("noResults");

    if (!searchInput) {
        console.error("globalSearch input not found");
        return;
    }

    if (!searchResults) {
        console.error("searchResults element not found");
        return;
    }


    /* =====================================================
       ALL RECIPE PAGES
    ===================================================== */

    const recipePages = [
        "dashboard.html",
        "breakfast.html",
        "lunch.html",
        "dinner.html",
        "snacks.html",
        "desserts.html"
    ];


    let allRecipes = [];
    let recipesLoaded = false;


    /* =====================================================
       LOAD ALL HTML PAGES FIRST
    ===================================================== */

    async function loadAllRecipes() {

        const recipeList = [];

        for (const page of recipePages) {

            try {

                const response = await fetch(page);

                if (!response.ok) {
                    console.warn(
                        "Could not load:",
                        page
                    );
                    continue;
                }

                const html = await response.text();

                const parser = new DOMParser();

                const doc =
                    parser.parseFromString(
                        html,
                        "text/html"
                    );


                /* Find recipe cards */

                const cards =
                    doc.querySelectorAll(
                        ".dashboard-card"
                    );


                cards.forEach(card => {

                    const title =
                        card.querySelector("h2");


                    if (!title) {
                        return;
                    }


                    const recipeName =
                        title.textContent.trim();


                    /* Find View Recipe button */

                    let recipeLink = "";


                    const button =
                        card.querySelector(
                            "button[onclick]"
                        );


                    if (button) {

                        const onclick =
                            button.getAttribute(
                                "onclick"
                            );


                        const match =
                            onclick.match(
                                /location\.href\s*=\s*['"]([^'"]+)['"]/
                            );


                        if (match) {
                            recipeLink =
                                match[1];
                        }

                    }


                    /* Image */

                    const image =
                        card.querySelector("img");


                    const imagePath =
                        image
                            ? image.getAttribute("src")
                            : "";


                    recipeList.push({

                        name: recipeName,

                        link: recipeLink,

                        image: imagePath,

                        sourcePage: page

                    });

                });

            }

            catch (error) {

                console.error(
                    "Error loading " + page,
                    error
                );

            }

        }


        /* Remove duplicates */

        allRecipes =
            recipeList.filter(
                (recipe, index, array) => {

                    return index ===
                        array.findIndex(
                            item =>
                                item.name
                                    .toLowerCase() ===
                                recipe.name
                                    .toLowerCase()
                        );

                }
            );


        recipesLoaded = true;


        console.log(
            "Recipes loaded:",
            allRecipes
        );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    async function performSearch() {

        const originalText =
            searchInput.value.trim();


        const query =
            originalText.toLowerCase();


        /* Clear old results */

        searchResults.innerHTML = "";


        /* Empty search */

        if (query === "") {

            searchResults.style.display =
                "none";


            if (noResults) {
                noResults.style.display =
                    "none";
            }


            showDashboardRecipes();

            return;
        }


        /* Wait until recipes are loaded */

        if (!recipesLoaded) {

            searchResults.innerHTML = `
                <p class="server-error">
                    Searching recipes...
                </p>
            `;

            searchResults.style.display =
                "flex";


            return;
        }


        /* Hide dashboard cards */

        hideDashboardRecipes();


        /* =================================================
           FIND MATCHES
        ================================================= */

        const matches =
            allRecipes.filter(recipe => {

                const name =
                    recipe.name
                        .toLowerCase()
                        .trim();


                return name.includes(query);

            });


        /* =================================================
           NO MATCH
        ================================================= */

        if (matches.length === 0) {

            searchResults.style.display =
                "none";


            if (noResults) {

                noResults.textContent =
                    `❌ "${originalText}" is not available in our recipes.`;

                noResults.style.display =
                    "block";

            }


            return;
        }


        /* =================================================
           MATCH FOUND
        ================================================= */

        if (noResults) {
            noResults.style.display =
                "none";
        }


        searchResults.style.display =
            "flex";


        matches.forEach(recipe => {

            createResult(recipe);

        });

    }


    /* =====================================================
       CREATE RESULT CARD
    ===================================================== */

    function createResult(recipe) {

        const card =
            document.createElement("article");


        card.className =
            "search-result";


        card.innerHTML = `

            ${
                recipe.image
                ? `
                    <img
                        src="${recipe.image}"
                        alt="${escapeHTML(recipe.name)}"
                        class="search-result-image"
                    >
                  `
                : ""
            }

            <div class="search-result-content">

                <h3>
                    ${escapeHTML(recipe.name)}
                </h3>

                <p>
                    Recipe available in:
                    ${escapeHTML(recipe.sourcePage)}
                </p>

                <button
                    type="button"
                    class="search-view-button">

                    View Recipe

                </button>

            </div>

        `;


        const button =
            card.querySelector(
                ".search-view-button"
            );


        button.addEventListener(
            "click",
            function () {

                if (recipe.link) {

                    window.location.href =
                        recipe.link;

                }
                else {

                    window.location.href =
                        recipe.sourcePage;

                }

            }
        );


        searchResults.appendChild(card);

    }


    /* =====================================================
       HIDE DASHBOARD RECIPES
    ===================================================== */

    function hideDashboardRecipes() {

        const cards =
            document.querySelectorAll(
                ".dashboard-card"
            );


        cards.forEach(card => {

            card.style.display =
                "none";

        });

    }


    /* =====================================================
       SHOW DASHBOARD RECIPES
    ===================================================== */

    function showDashboardRecipes() {

        const cards =
            document.querySelectorAll(
                ".dashboard-card"
            );


        cards.forEach(card => {

            card.style.display =
                "";

        });

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const element =
            document.createElement("div");


        element.textContent =
            text;


        return element.innerHTML;

    }


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    searchInput.addEventListener(
        "input",
        performSearch
    );


    /* =====================================================
       ENTER KEY
    ===================================================== */

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch();

            }

        }
    );


    /* =====================================================
       LOAD RECIPES
    ===================================================== */

    loadAllRecipes();

});