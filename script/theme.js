// ==========================================
// Cook With Me - Settings
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const darkModeToggle = document.getElementById("darkModeToggle");
    const saveButton = document.getElementById("saveSettingsBtn");

    // Load saved dark mode setting
    if (localStorage.getItem("darkMode") === "enabled") {
        darkModeToggle.checked = true;
        document.body.classList.add("dark-mode");
    }

    // Save Settings
    saveButton.addEventListener("click", function () {

        if (darkModeToggle.checked) {

            localStorage.setItem("darkMode", "enabled");
            document.body.classList.add("dark-mode");

        } else {

            localStorage.setItem("darkMode", "disabled");
            document.body.classList.remove("dark-mode");
        }

        // Show confirmation
        saveButton.innerHTML = "✅ Settings Saved";

        setTimeout(function () {
            saveButton.innerHTML = "💾 Save Settings";
        }, 2000);
    });

});