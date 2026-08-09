// Apply saved theme on every page
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

// Works only on settings page
const darkMode = document.getElementById("darkMode");

if (darkMode) {

    darkMode.checked = localStorage.getItem("theme") === "dark";

    darkMode.addEventListener("change", function () {

        if (this.checked) {

            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");

        } else {

            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");

        }

    });

}