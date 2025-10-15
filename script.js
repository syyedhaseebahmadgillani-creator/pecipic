// Pecipic.ai — Advanced client-side: OCR + Preview + Download (.docx-like)
// Free OCR.Space demo key used ("helloworld") — suitable for light testing.

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const previewSection = document.getElementById("previewSection");
const textPreview = document.getElementById("textPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

const OCR_API_URL = "https://api.ocr.space/parse/image";
const API_KEY = "helloworld"; // demo key (limited). For heavier use, sign up on ocr.space and replace.

document.getElementById("year").textContent = new Date().getFullYear();

// Convert button click: upload image to OCR.Space
convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please select an image first.");
    return;
  }

  progress.textContent = "⏳ Uploading image and reading text...";
  convertBtn.disabled = true;
  previewSection.style.display = "none";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", API_KEY);
  formData.append("language", "eng"); // change to "urd" or others if supported later
  formData.append("isOverlayRequired", "false");

  try {
    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData
    });
    const result = await response.json();

    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      const parsedText = result.ParsedResults[0].ParsedText || "";
      const text = parsedText.trim();

      if (!text) {
        progress.textContent = "⚠️ OCR finished but no readable text found. Try a clearer photo.";
        return;
      }

      progress.textContent = "✅ Text recognized — preview below. Edit if needed.";
      textPreview.value = text;
      previewSection.style.display = "block";
      // Scroll preview into view on small screens
      previewSection.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      progress.textContent = "⚠️ Could not extract text. Try another image.";
    }
  } catch (err) {
    console.error(err);
    progress.textContent = "❌ Error: " + (err.message || "Network or API error");
  } finally {
    convertBtn.disabled = false;
  }
});

// Create and download a .docx-like file from edited text
downloadBtn.addEventListener("click", () => {
  const userText = textPreview.value.trim();
  if (!userText) {
    alert("Nothing to download. Please make sure text exists in the preview.");
    return;
  }

  // Basic HTML-to-DOCX wrapper — works well with Word desktop, Word mobile, and Google Docs.
  const docHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Pecipic.ai Document</title></head>
      <body>
        <h2 style="text-align:center;">Converted by Pecipic.ai</h2>
        <div>${userText.replace(/\n/g, "<br>")}</div>
      </body>
    </html>`;

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "Pecipic-Converted.docx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Copy text to clipboard
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Text copied to clipboard.");
  } catch (err) {
    alert("Could not copy text. Your browser may block clipboard access.");
  }
});
