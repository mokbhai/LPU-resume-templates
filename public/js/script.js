// Theme toggle functionality
function initTheme() {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// Initialize theme and add event listener
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});

async function handleFileImport(event) {
  try {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Store the imported data in localStorage
        localStorage.setItem("resumeData", JSON.stringify(importedData));

        // Redirect to edit page with template from imported data or default to general
        const template = importedData.selectedTemplate?.includes("technical")
          ? "technical"
          : "general";
        window.location.href = `/edit?template=${template}`;
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Invalid JSON file format");
      }
    };

    reader.readAsText(file);
  } catch (error) {
    console.error("Error importing file:", error);
    alert("Error importing file");
  }
}
