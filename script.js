// Pecipic.ai — Full client-side OCR + Preview + real .docx generation using docx.js
// Uses free OCR.Space demo key ("helloworld") for light testing. Replace with your API key later if needed.

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const previewSection = document.getElementById("previewSection");
const textPreview = document.getElementById("textPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

const OCR_API_URL = "https://api.ocr.space/parse/image";
const API_KEY = "helloworld"; // demo key; for higher usage, register at ocr.space and replace

document.getElementById("year").textContent = new Date().getFullYear();

// Convert button: send image to OCR.Space and show preview
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
  formData.append("language", "eng"); // change to "urd" later if supported by your key
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

// DOWNLOAD: generate a REAL .docx using docx.js (so Word mobile can open without error)
downloadBtn.addEventListener("click", async () => {
  const userText = textPreview.value.trim();
  if (!userText) {
    alert("Nothing to download. Please make sure text exists in the preview.");
    return;
  }

  try {
    // ensure docx library is loaded
    if (!window.docx) {
      alert("docx library not loaded. Please refresh the page and try again.");
      return;
    }

    const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;

    // Build paragraphs from user lines (preserve empty lines)
    const paragraphs = [];
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Converted by Pecipic.ai",
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    const lines = userText.split(/\r?\n/);
    for (const line of lines) {
      // if line is empty, add an empty paragraph for spacing
      if (line.trim() === "") {
        paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
      } else {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: line })],
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    progress.textContent = "⏳ Generating .docx file...";
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Pecipic-Converted.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    progress.textContent = "✅ Download started. Open with Word or Google Docs.";
  } catch (err) {
    console.error(err);
    progress.textContent = "❌ Error while creating .docx: " + (err.message || err);
  }
});

// Copy preview text to clipboard
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Text copied to clipboard.");
  } catch (err) {
    alert("Could not copy text. Your browser may block clipboard access.");
  }
});
