import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate the DOCX file
async function generateDocx() {
  try {
    const data = JSON.parse(readFileSync(resolve(__dirname, "./data.json")));

    // Add this debug log
    console.log("Loaded data:", {
      name: data.name,
      contacts: data.contacts,
    });

    // Load your existing template
    const content = readFileSync(
      resolve(__dirname, "./general-template.docx")
    );

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
            console.log(`Getting value for ${tag}:`, value);
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

    // Save the file
    const outputPath = resolve(__dirname, "output.docx");
    writeFileSync(outputPath, buf);
    console.log("File saved successfully at:", outputPath);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Run the function
generateDocx();
