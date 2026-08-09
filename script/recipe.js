// ========================================
// DOWNLOAD RECIPE AS PDF
// ========================================

async function downloadRecipePDF() {

    const recipe = document.getElementById("recipe-content");

    if (!recipe) {
        alert("Recipe content not found.");
        return;
    }

    const button = document.querySelector(
        'button[onclick="downloadRecipePDF()"]'
    );

    // Change button text while generating
    if (button) {
        button.innerHTML = "⏳ Creating PDF...";
        button.disabled = true;
    }

    try {

        // Create canvas from recipe
        const canvas = await html2canvas(recipe, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        });

        const imageData = canvas.toDataURL("image/png");

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;

        const imageWidth = pageWidth - (margin * 2);

        const imageHeight =
            (canvas.height * imageWidth) / canvas.width;

        let heightLeft = imageHeight;

        let position = margin;

        // First page
        pdf.addImage(
            imageData,
            "PNG",
            margin,
            position,
            imageWidth,
            imageHeight
        );

        heightLeft -= pageHeight - (margin * 2);

        // Additional pages
        while (heightLeft > 0) {

            position = heightLeft - imageHeight + margin;

            pdf.addPage();

            pdf.addImage(
                imageData,
                "PNG",
                margin,
                position,
                imageWidth,
                imageHeight
            );

            heightLeft -= pageHeight - (margin * 2);
        }

        // Get recipe name
        const titleElement = recipe.querySelector("h1");

        let fileName = "Cook-With-Me-Recipe";

        if (titleElement) {

            fileName = titleElement.innerText
                .replace(/[^\w\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
        }

        // Download PDF
        pdf.save(fileName + ".pdf");

    } catch (error) {

        console.error("PDF Error:", error);

        alert(
            "Unable to create PDF. Please make sure you are connected to the internet and try again."
        );

    } finally {

        if (button) {
            button.innerHTML = "📥 Download Recipe PDF";
            button.disabled = false;
        }
    }
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