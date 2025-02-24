import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs, { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path, { dirname, resolve } from "path";
import express from "express";
import bodyParser from "body-parser";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate the DOCX file
async function generateDocx(data, res) {
  try {
    // Use the selected template or fall back to general template
    const templateFile = data.selectedTemplate || "general-template.docx";

    // Load your existing template
    const content = readFileSync(resolve(`./public/templates/${templateFile}`));

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Add debug options
      debug: true,
      parser: function (tag) {
        // Split the tag by dots to handle nested properties
        const parts = tag.split(".");
        return {
          get: function (scope) {
            // Handle the current item in an array
            if (tag === ".") {
              return scope;
            }

            // Traverse the object using the parts
            let value = scope;
            for (const part of parts) {
              value = value?.[part];
            }
            // console.log(`Getting value for ${tag}:`, value);
            return value || `[${tag} not found]`;
          },
        };
      },
    });

    // Render template
    doc.setData(data);
    doc.render();

    // Generate output
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Send the file directly in the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", "attachment; filename=resume.docx");
    res.send(buf);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate resume" });
  }
}

const app = express();
app.use(express.static("public"));

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/edit", async (req, res) => {
  const template = req.query.template || "general";
  let resumeData;

  // Check if we have data in the query parameter
  if (req.query.data) {
    try {
      resumeData = JSON.parse(decodeURIComponent(req.query.data));
    } catch (error) {
      console.error("Error parsing imported data:", error);
      // Fall back to default data if there's an error
      resumeData = JSON.parse(
        fs.readFileSync(resolve(__dirname, "./data.json"), "utf8")
      );
    }
  } else {
    // Use default data if no imported data
    resumeData = JSON.parse(
      fs.readFileSync(resolve(__dirname, "./data.json"), "utf8")
    );
  }

  // Set the template file based on the selection
  const templateFile =
    template === "technical"
      ? "technical-template.docx"
      : "general-template.docx";

  // Store the selected template in the session or as a hidden field
  resumeData.selectedTemplate = templateFile;

  res.render("edit", { resume: resumeData });
});

app.post("/generate", (req, res) => {
  const resumeData = req.body;
  generateDocx(resumeData, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
