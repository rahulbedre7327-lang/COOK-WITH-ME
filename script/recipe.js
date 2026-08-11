// ==========================================
// Download Recipe as Text-Based PDF
// ==========================================

async function downloadRecipePDF() {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);

    let y = 20;

    // Get recipe title
    const title = document.querySelector(".hero h1").innerText;

    // Get only recipe content
    const recipeContent = document.getElementById("read-content");

    if (!recipeContent) {
        alert("Recipe content not found!");
        return;
    }


    // ==========================================
    // Helper: Check page space
    // ==========================================

    function checkPageSpace(requiredHeight) {

        if (y + requiredHeight > 280) {
            pdf.addPage();
            y = 20;
        }
    }


    // ==========================================
    // Helper: Add heading
    // ==========================================

  function addHeading(text) {

    checkPageSpace(15);

    // Remove emojis and unwanted symbols from heading
    text = text.replace(
        /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu,
        ""
    ).trim();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);

    pdf.text(text, margin, y);

    y += 9;
}


    // ==========================================
    // Helper: Add normal paragraph
    // ==========================================

    function addParagraph(text) {

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        const lines = pdf.splitTextToSize(text, contentWidth);

        checkPageSpace(lines.length * 5 + 5);

        pdf.text(lines, margin, y);

        y += (lines.length * 5) + 5;
    }


    // ==========================================
    // Helper: Add numbered list
    // ==========================================

    function addNumberedList(items) {

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        items.forEach((item, index) => {

            const number = `${index + 1}.`;

            const textLines = pdf.splitTextToSize(
                item,
                contentWidth - 10
            );

            checkPageSpace(textLines.length * 5 + 5);

            pdf.text(number, margin, y);

            pdf.text(
                textLines,
                margin + 8,
                y
            );

            y += (textLines.length * 5) + 3;
        });

        y += 4;
    }


    // ==========================================
    // TITLE
    // ==========================================

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);

    const titleLines = pdf.splitTextToSize(
        title,
        contentWidth
    );

    pdf.text(
        titleLines,
        pageWidth / 2,
        y,
        {
            align: "center"
        }
    );

    y += (titleLines.length * 10) + 12;


    // ==========================================
    // Process recipe sections
    // ==========================================

    const sections = recipeContent.children;

    for (let i = 0; i < sections.length; i++) {

        const element = sections[i];

        // Heading
        if (element.tagName === "H2") {

            addHeading(element.innerText);

        }

        // Paragraph
        else if (element.tagName === "P") {

            addParagraph(element.innerText);

        }

        // Ordered list
        else if (element.tagName === "OL") {

            const items = Array.from(
                element.querySelectorAll("li")
            ).map(li => li.innerText);

            addNumberedList(items);

        }

        // Unordered list
        else if (element.tagName === "UL") {

            const items = Array.from(
                element.querySelectorAll("li")
            ).map(li => li.innerText);

            addNumberedList(items);

        }

        // Table
        else if (element.tagName === "TABLE") {

            const rows = element.querySelectorAll("tr");

            pdf.setFontSize(10);

            rows.forEach(row => {

                const cells = Array.from(
                    row.querySelectorAll("th, td")
                ).map(cell => cell.innerText);

                checkPageSpace(8);

                pdf.text(
                    cells.join("        "),
                    margin,
                    y
                );

                y += 7;
            });

            y += 5;
        }
    }


    // ==========================================
    // Footer
    // ==========================================

   // ==========================================
// Footer / Watermark
// ==========================================

const pageCount = pdf.internal.getNumberOfPages();

for (let page = 1; page <= pageCount; page++) {

    pdf.setPage(page);

    // Footer line
    pdf.setLineWidth(0.3);

    pdf.line(
        margin,
        284,
        pageWidth - margin,
        284
    );

    // Project name + designer
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    pdf.text(
        "Cook With Me | Designed by Rahul",
        pageWidth / 2,
        289,
        {
            align: "center"
        }
    );

    // Page number
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);

    pdf.text(
        `Page ${page} of ${pageCount}`,
        pageWidth / 2,
        294,
        {
            align: "center"
        }
    );
    }

    pdf.save(`${title}.pdf`);
}

// ========================================
// PRINT RECIPE
// ========================================

function printRecipe() {

    const recipe = document.getElementById("recipe-content");

    if (!recipe) {
        alert("Recipe content not found.");
        return;
    }

    window.print();
}


// ========================================
// READ RECIPE ALOUD
// ========================================
// ===============================
// Read Recipe Aloud
// ===============================
// ===============================
// Read Recipe Aloud
// Introduction → Result
// ===============================

// ===============================
// Read Recipe Aloud
// Introduction → Result
// ===============================

function readRecipe() {

    const readContent = document.getElementById("read-content");
    const readBtn = document.getElementById("readBtn");

    if (!readContent) {
        alert("Recipe content not found!");
        return;
    }

    // Stop reading if already speaking
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        readBtn.innerHTML = "🔊 Read Recipe Aloud";
        return;
    }

    // Get only Introduction → Result
    const text = readContent.innerText;

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    readBtn.innerHTML = "⏹️ Stop Reading";

    speech.onend = function () {
        readBtn.innerHTML = "🔊 Read Recipe Aloud";
    };

    speech.onerror = function () {
        readBtn.innerHTML = "🔊 Read Recipe Aloud";
    };

    speechSynthesis.speak(speech);
}
// ==========================================
// COOK WITH ME - RECIPE SYSTEM
// ==========================================


// Get recipe information from the HTML
function getRecipeData() {

    const body = document.body;

    return {
        name: body.dataset.recipeName || "Unknown Recipe",

        rating: body.dataset.recipeRating || "⭐⭐⭐⭐⭐",

        time: body.dataset.recipeTime || "30 Minutes",

        image: body.dataset.recipeImage || "",

        url: window.location.href
    };
}


// ==========================================
// SAVE RECIPE TO HISTORY
// ==========================================

function addToHistory(recipe) {

    let history = JSON.parse(
        localStorage.getItem("recipeHistory")
    ) || [];


    // Remove existing copy of the recipe
    history = history.filter(
        item => item.name !== recipe.name
    );


    // Add recipe to beginning
    history.unshift(recipe);


    // Keep only latest 20 recipes
    history = history.slice(0, 20);


    localStorage.setItem(
        "recipeHistory",
        JSON.stringify(history)
    );
}


// ==========================================
// CHECK FAVORITE
// ==========================================

function isFavorite(recipeName) {

    const favorites = JSON.parse(
        localStorage.getItem("favorites")
    ) || [];

    return favorites.some(
        item => item.name === recipeName
    );
}


// ==========================================
// ADD / REMOVE FAVORITE
// ==========================================

function toggleFavorite(recipe) {

    let favorites = JSON.parse(
        localStorage.getItem("favorites")
    ) || [];


    const exists = favorites.some(
        item => item.name === recipe.name
    );


    if (exists) {

        // Remove
        favorites = favorites.filter(
            item => item.name !== recipe.name
        );

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        updateFavoriteButton(false);

    } else {

        // Add
        favorites.push(recipe);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        updateFavoriteButton(true);
    }
}


// ==========================================
// UPDATE FAVORITE BUTTON
// ==========================================

function updateFavoriteButton(favorite) {

    const button = document.querySelector(".favorite-btn");

    if (!button) return;


    if (favorite) {

        button.innerHTML = "❤️ Remove from Favorites";

        button.classList.add("favorited");

    } else {

        button.innerHTML = "🤍 Add to Favorites";

        button.classList.remove("favorited");
    }
}


// ==========================================
// START RECIPE SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const recipe = getRecipeData();


    // Automatically save recipe to history
    addToHistory(recipe);


    // Find favorite button
    const favoriteButton =
        document.querySelector(".favorite-btn");


    if (favoriteButton) {

        // Show correct button status
        updateFavoriteButton(
            isFavorite(recipe.name)
        );


        // Button click
        favoriteButton.addEventListener(
            "click",
            function () {

                toggleFavorite(recipe);

            }
        );
    }

});