// All form-related functions and event listeners
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resumeForm");
  if (!form) return; // Exit if we're not on the form page

  // Form submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const resumeData = {};

    // Process form data into the correct structure
    formData.forEach((value, key) => {
      if (key.includes("achievements[]") || key.includes(".achievements[]")) {
        // Handle array items
        const match = key.match(/(\w+)\[(\d+)\]\.achievements/);
        if (match) {
          const [, section, index] = match;
          if (!resumeData[section]) resumeData[section] = [];
          if (!resumeData[section][index]) resumeData[section][index] = {};
          if (!resumeData[section][index].achievements) {
            resumeData[section][index].achievements = [];
          }
          resumeData[section][index].achievements.push(value);
        } else if (key === "achievements[]") {
          // Handle general achievements
          if (!resumeData.achievements) resumeData.achievements = [];
          resumeData.achievements.push(value);
        }
      } else if (key.match(/\[\d+\]/)) {
        // Handle indexed arrays (education, experience, skills)
        const [base, ...rest] = key.split(".");
        const index = key.match(/\[(\d+)\]/)[1];
        const field = base.replace(/\[\d+\]/, "");

        if (!resumeData[field]) resumeData[field] = [];
        if (!resumeData[field][index]) resumeData[field][index] = {};

        if (rest.length > 0) {
          // Handle nested properties
          let current = resumeData[field][index];
          const lastKey = rest.pop();
          rest.forEach((key) => {
            if (!current[key]) current[key] = {};
            current = current[key];
          });
          current[lastKey] = value;
        } else {
          resumeData[field][index] = value;
        }
      } else if (key.includes(".")) {
        // Handle nested objects
        const keys = key.split(".");
        let current = resumeData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        // Handle regular fields
        resumeData[key] = value;
      }
    });

    // Clean up the data structure
    if (resumeData.experience) {
      resumeData.experience = resumeData.experience.filter(Boolean);
      resumeData.experience.forEach((exp) => {
        if (exp.technologies) {
          exp.technologies = {
            label: "Technologies used:",
            items: exp.technologies.items,
          };
        }
      });
    }

    if (resumeData.projects) {
      resumeData.projects = resumeData.projects.filter(Boolean);
      resumeData.projects.forEach((project) => {
        if (project.technologies) {
          project.technologies = {
            label: "Technologies used:",
            items: project.technologies.items,
          };
        }
      });
    }

    if (resumeData.educations) {
      resumeData.educations = resumeData.educations.filter(Boolean);
    }

    if (resumeData.skills) {
      resumeData.skills = resumeData.skills.filter(Boolean);
    }

    if (resumeData.certifications) {
      resumeData.certifications = resumeData.certifications.filter(Boolean);
    }

    // Save to localStorage after processing
    saveToLocalStorage(resumeData);

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate resume");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "resume.docx";
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadLink);

      alert("Resume generated successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating resume");
    }
  });

  // Auto-save functionality
  let autoSaveTimeout;
  form.addEventListener("input", (e) => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      const form = document.getElementById("resumeForm");
      const formData = new FormData(form);
      const resumeData = {};
      // Process form data
      formData.forEach((value, key) => {
        if (key.includes("achievements[]") || key.includes(".achievements[]")) {
          // Handle array items
          const match = key.match(/(\w+)\[(\d+)\]\.achievements/);
          if (match) {
            const [, section, index] = match;
            if (!resumeData[section]) resumeData[section] = [];
            if (!resumeData[section][index]) resumeData[section][index] = {};
            if (!resumeData[section][index].achievements) {
              resumeData[section][index].achievements = [];
            }
            resumeData[section][index].achievements.push(value);
          } else if (key === "achievements[]") {
            // Handle general achievements
            if (!resumeData.achievements) resumeData.achievements = [];
            resumeData.achievements.push(value);
          }
        } else if (key.match(/\[\d+\]/)) {
          // Handle indexed arrays (education, experience, skills)
          const [base, ...rest] = key.split(".");
          const index = key.match(/\[(\d+)\]/)[1];
          const field = base.replace(/\[\d+\]/, "");

          if (!resumeData[field]) resumeData[field] = [];
          if (!resumeData[field][index]) resumeData[field][index] = {};

          if (rest.length > 0) {
            // Handle nested properties
            let current = resumeData[field][index];
            const lastKey = rest.pop();
            rest.forEach((key) => {
              if (!current[key]) current[key] = {};
              current = current[key];
            });
            current[lastKey] = value;
          } else {
            resumeData[field][index] = value;
          }
        } else if (key.includes(".")) {
          // Handle nested objects
          const keys = key.split(".");
          let current = resumeData;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        } else {
          // Handle regular fields
          resumeData[key] = value;
        }
      });

      // Clean up the data structure
      if (resumeData.experience) {
        resumeData.experience = resumeData.experience.filter(Boolean);
        resumeData.experience.forEach((exp) => {
          if (exp.technologies) {
            exp.technologies = {
              label: "Technologies used:",
              items: exp.technologies.items,
            };
          }
        });
      }

      if (resumeData.projects) {
        resumeData.projects = resumeData.projects.filter(Boolean);
        resumeData.projects.forEach((project) => {
          if (project.technologies) {
            project.technologies = {
              label: "Technologies used:",
              items: project.technologies.items,
            };
          }
        });
      }

      if (resumeData.educations) {
        resumeData.educations = resumeData.educations.filter(Boolean);
      }

      if (resumeData.skills) {
        resumeData.skills = resumeData.skills.filter(Boolean);
      }

      if (resumeData.certifications) {
        resumeData.certifications = resumeData.certifications.filter(Boolean);
      }

      saveToLocalStorage(resumeData);
    }, 1000); // Save after 1 second of inactivity
  });

  // Load saved data
  const savedData = localStorage.getItem("resumeData");
  if (savedData) {
    try {
      const resumeData = JSON.parse(savedData);
      populateFormData(resumeData);
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }
});

// All the helper functions (addEducation, addExperience, etc.)
function addWorkExperience() {
  const workEntries = document.getElementById("workEntries");
  const workEntry = document.createElement("div");
  workEntry.className = "work-entry";
  workEntry.innerHTML = `
        <div class="form-group">
            <label>Company</label>
            <input type="text" name="work[].company">
        </div>
        <div class="form-group">
            <label>Position</label>
            <input type="text" name="work[].position">
        </div>
        <div class="form-group">
            <label>Start Date</label>
            <input type="date" name="work[].startDate">
        </div>
        <div class="form-group">
            <label>End Date</label>
            <input type="date" name="work[].endDate">œ
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea name="work[].description"></textarea>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
    `;
  workEntries.appendChild(workEntry);
}

function addEducation(initialData = null) {
  const educationEntries = document.getElementById("educationEntries");
  const index = document.querySelectorAll(".education-entry").length;
  const educationEntry = document.createElement("div");
  educationEntry.className = "education-entry";
  educationEntry.innerHTML = `
    <div class="form-group">
      <label>Degree</label>
      <input type="text" name="educations[${index}].degree" value="${
    initialData?.degree || ""
  }">
    </div>
    <div class="form-group">
      <label>Major</label>
      <input type="text" name="educations[${index}].major" value="${
    initialData?.major || ""
  }">
    </div>
    <div class="form-group">
      <label>School</label>
      <input type="text" name="educations[${index}].school" value="${
    initialData?.school || ""
  }">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="text" name="educations[${index}].date" value="${
    initialData?.date || ""
  }">
    </div>
    <div class="form-group">
      <label>GPA</label>
      <input type="text" name="educations[${index}].gpa" value="${
    initialData?.gpa || ""
  }">
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" name="educations[${index}].location" value="${
    initialData?.location || ""
  }">
    </div>
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
  `;
  educationEntries.appendChild(educationEntry);
}

function addExperience(initialData = null) {
  const experienceEntries = document.getElementById("experienceEntries");
  const index = document.querySelectorAll(".experience-entry").length;
  const experienceEntry = document.createElement("div");
  experienceEntry.className = "experience-entry";
  experienceEntry.innerHTML = `
    <div class="form-group">
      <label>Role</label>
      <input type="text" name="experience[${index}].role" value="${
    initialData?.role || ""
  }">
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" name="experience[${index}].company" value="${
    initialData?.company || ""
  }">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="text" name="experience[${index}].date" value="${
    initialData?.date || ""
  }">
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" name="experience[${index}].location" value="${
    initialData?.location || ""
  }">
    </div>
    <div class="form-group">
      <label>Technologies</label>
      <input type="text" name="experience[${index}].technologies.items" value="${
    initialData?.technologies?.items || ""
  }">
    </div>
    <div id="achievements${index}" class="achievements-list">
      <label>Achievements</label>
    </div>
    <button type="button" onclick="addAchievement(${index})" class="btn-secondary">Add Achievement</button>
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove Entry</button>
  `;
  experienceEntries.appendChild(experienceEntry);

  // Add achievements if they exist
  if (initialData?.achievements) {
    initialData.achievements.forEach((achievement) => {
      const achievementsList = document.getElementById(`achievements${index}`);
      const achievementEntry = document.createElement("div");
      achievementEntry.className = "achievement-entry";
      achievementEntry.innerHTML = `
        <input type="text" name="experience[${index}].achievements[]" value="${achievement}">
        <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
      `;
      achievementsList.appendChild(achievementEntry);
    });
  }
}

function addAchievement(experienceIndex) {
  // Convert string index to number if needed
  experienceIndex = parseInt(experienceIndex);
  const achievementsList = document.getElementById(
    `achievements${experienceIndex}`
  );
  const achievementEntry = document.createElement("div");
  achievementEntry.className = "achievement-entry";
  achievementEntry.innerHTML = `
    <input type="text" name="experience[${experienceIndex}].achievements[]">
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
  `;
  achievementsList.appendChild(achievementEntry);
}

function addSkill(initialData = null) {
  const skillEntries = document.getElementById("skillEntries");
  const index = document.querySelectorAll(".skill-entry").length;
  const skillEntry = document.createElement("div");
  skillEntry.className = "skill-entry";
  skillEntry.innerHTML = `
    <div class="form-group">
      <label>Category</label>
      <input type="text" name="skills[${index}].category" value="${
    initialData?.category || ""
  }">
    </div>
    <div class="form-group">
      <label>Items</label>
      <input type="text" name="skills[${index}].items" value="${
    initialData?.items || ""
  }">
    </div>
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
  `;
  skillEntries.appendChild(skillEntry);
}

function addProject(initialData = null) {
  const projectEntries = document.getElementById("projectEntries");
  const index = document.querySelectorAll(".project-entry").length;
  const projectEntry = document.createElement("div");
  projectEntry.className = "project-entry";
  projectEntry.innerHTML = `
    <div class="form-group">
      <label>Title</label>
      <input type="text" name="projects[${index}].title" value="${
    initialData?.title || ""
  }">
    </div>
    <div class="form-group">
      <label>Role</label>
      <input type="text" name="projects[${index}].role" value="${
    initialData?.role || ""
  }">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="text" name="projects[${index}].date" value="${
    initialData?.date || ""
  }">
    </div>
    <div class="form-group">
      <label>Technologies</label>
      <input type="text" name="projects[${index}].technologies.items" value="${
    initialData?.technologies?.items || ""
  }">
    </div>
    <div id="projectAchievements${index}" class="achievements-list">
      <label>Achievements</label>
    </div>
    <button type="button" onclick="addProjectAchievement(${index})" class="btn-secondary">Add Achievement</button>
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove Project</button>
  `;
  projectEntries.appendChild(projectEntry);

  // Add achievements if they exist
  if (initialData?.achievements) {
    initialData.achievements.forEach((achievement) => {
      const achievementsList = document.getElementById(
        `projectAchievements${index}`
      );
      const achievementEntry = document.createElement("div");
      achievementEntry.className = "achievement-entry";
      achievementEntry.innerHTML = `
        <input type="text" name="projects[${index}].achievements[]" value="${achievement}">
        <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
      `;
      achievementsList.appendChild(achievementEntry);
    });
  }
}

function addProjectAchievement(projectIndex) {
  projectIndex = parseInt(projectIndex);
  const achievementsList = document.getElementById(
    `projectAchievements${projectIndex}`
  );
  const achievementEntry = document.createElement("div");
  achievementEntry.className = "achievement-entry";
  achievementEntry.innerHTML = `
    <input type="text" name="projects[${projectIndex}].achievements[]">
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
  `;
  achievementsList.appendChild(achievementEntry);
}

function addCertification(initialData = null) {
  const certificationEntries = document.getElementById("certificationEntries");
  const index = document.querySelectorAll(".certification-entry").length;
  const certEntry = document.createElement("div");
  certEntry.className = "certification-entry";
  certEntry.innerHTML = `
    <div class="form-group">
      <label>Title</label>
      <input type="text" name="certifications[${index}].title" value="${
    initialData?.title || ""
  }">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="text" name="certifications[${index}].date" value="${
    initialData?.date || ""
  }">
    </div>
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
  `;
  certificationEntries.appendChild(certEntry);
}

function addGeneralAchievement(initialValue = "") {
  const achievementEntries = document.getElementById("achievementEntries");
  const achievementEntry = document.createElement("div");
  achievementEntry.className = "achievement-entry";
  achievementEntry.innerHTML = `
    <input type="text" name="achievements[]" value="${initialValue}">
    <button type="button" onclick="this.parentElement.remove()" class="btn-secondary">Remove</button>
  `;
  achievementEntries.appendChild(achievementEntry);
}

function populateFormData(data) {
  // Populate basic information
  document.getElementById("name").value = data.name || "";
  document.getElementById("title").value = data.title || "";
  document.getElementById("summary").value = data.summary || "";

  // Populate contacts
  if (data.contacts) {
    document.getElementById("email").value = data.contacts.email || "";
    document.getElementById("phone").value = data.contacts.phone || "";
    document.getElementById("linkedin").value = data.contacts.linkedin || "";
    document.getElementById("github").value = data.contacts.github || "";
    document.getElementById("website").value = data.contacts.website || "";
  }

  // Clear existing entries
  document.getElementById("educationEntries").innerHTML = "";
  document.getElementById("experienceEntries").innerHTML = "";
  document.getElementById("skillEntries").innerHTML = "";
  document.getElementById("projectEntries").innerHTML = "";
  document.getElementById("certificationEntries").innerHTML = "";
  document.getElementById("achievementEntries").innerHTML = "";

  // Populate arrays
  data.educations?.forEach((edu, index) => {
    addEducation(edu);
  });

  data.experience?.forEach((exp, index) => {
    addExperience(exp);
  });

  data.skills?.forEach((skill, index) => {
    addSkill(skill);
  });

  data.projects?.forEach((project, index) => {
    addProject(project);
  });

  data.certifications?.forEach((cert, index) => {
    addCertification(cert);
  });

  data.achievements?.forEach((achievement) => {
    addGeneralAchievement(achievement);
  });
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem("resumeData", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

function clearSavedData() {
  if (
    confirm(
      "Are you sure you want to clear all saved data? This cannot be undone."
    )
  ) {
    localStorage.removeItem("resumeData");
    window.location.reload();
  }
}

function downloadJSON() {
  try {
    // Get current form data
    const form = document.getElementById("resumeForm");
    const formData = new FormData(form);
    const resumeData = {};

    // Process form data using the same logic as submit
    formData.forEach((value, key) => {
      if (key.includes("achievements[]") || key.includes(".achievements[]")) {
        const match = key.match(/(\w+)\[(\d+)\]\.achievements/);
        if (match) {
          const [, section, index] = match;
          if (!resumeData[section]) resumeData[section] = [];
          if (!resumeData[section][index]) resumeData[section][index] = {};
          if (!resumeData[section][index].achievements) {
            resumeData[section][index].achievements = [];
          }
          resumeData[section][index].achievements.push(value);
        } else if (key === "achievements[]") {
          if (!resumeData.achievements) resumeData.achievements = [];
          resumeData.achievements.push(value);
        }
      } else if (key.match(/\[\d+\]/)) {
        const [base, ...rest] = key.split(".");
        const index = key.match(/\[(\d+)\]/)[1];
        const field = base.replace(/\[\d+\]/, "");

        if (!resumeData[field]) resumeData[field] = [];
        if (!resumeData[field][index]) resumeData[field][index] = {};

        if (rest.length > 0) {
          let current = resumeData[field][index];
          const lastKey = rest.pop();
          rest.forEach((key) => {
            if (!current[key]) current[key] = {};
            current = current[key];
          });
          current[lastKey] = value;
        } else {
          resumeData[field][index] = value;
        }
      } else if (key.includes(".")) {
        const keys = key.split(".");
        let current = resumeData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        resumeData[key] = value;
      }
    });

    // Clean up the data structure
    if (resumeData.experience) {
      resumeData.experience = resumeData.experience.filter(Boolean);
      resumeData.experience.forEach((exp) => {
        if (exp.technologies) {
          exp.technologies = {
            label: "Technologies used:",
            items: exp.technologies.items,
          };
        }
      });
    }

    if (resumeData.projects) {
      resumeData.projects = resumeData.projects.filter(Boolean);
      resumeData.projects.forEach((project) => {
        if (project.technologies) {
          project.technologies = {
            label: "Technologies used:",
            items: project.technologies.items,
          };
        }
      });
    }

    if (resumeData.educations) {
      resumeData.educations = resumeData.educations.filter(Boolean);
    }

    if (resumeData.skills) {
      resumeData.skills = resumeData.skills.filter(Boolean);
    }

    if (resumeData.certifications) {
      resumeData.certifications = resumeData.certifications.filter(Boolean);
    }

    // Create and download the JSON file
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    downloadLink.href = url;
    downloadLink.download = `resume-data-${date}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error("Error downloading JSON:", error);
    alert("Error downloading data");
  }
}

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
