// ==========================================
// COOK WITH ME - RECIPE HISTORY
// ==========================================


// Get history
function getHistory() {

    return JSON.parse(
        localStorage.getItem("recipeHistory")
    ) || [];

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function loadHistory() {

    const container =
        document.querySelector(".history-container");


    if (!container) return;


    const history = getHistory();


    container.innerHTML = "";


    // No history
    if (history.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                🕘 No recipe history yet.
            </div>
        `;

        return;
    }


    // Display history
    history.forEach(function (recipe) {

        const card =
            document.createElement("div");


        card.className = "history-card";


        card.innerHTML = `

            <div class="history-info">

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
                    class="delete-history-btn"
                    data-name="${recipe.name}"
                >
                    Remove
                </button>

            </div>

        `;


        container.appendChild(card);

    });


    // Remove buttons
    const buttons =
        document.querySelectorAll(
            ".delete-history-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const recipeName =
                    this.dataset.name;


                removeFromHistory(recipeName);

            }
        );

    });

}


// ==========================================
// REMOVE FROM HISTORY
// ==========================================

function removeFromHistory(recipeName) {

    let history = getHistory();


    history = history.filter(
        recipe => recipe.name !== recipeName
    );


    localStorage.setItem(
        "recipeHistory",
        JSON.stringify(history)
    );


    loadHistory();

}


// ==========================================
// CLEAR ALL HISTORY
// ==========================================

function clearHistory() {

    localStorage.removeItem("recipeHistory");

    loadHistory();

}


// ==========================================
// LOAD PAGE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadHistory
);