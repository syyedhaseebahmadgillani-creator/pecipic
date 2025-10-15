// Pecipic.ai — Hybrid Image + Text OCR Converter (layout + editable text)
// Adds original image to the generated .docx along with extracted OCR text.

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const previewSection = document.getElementById("previewSection");
const textPreview = document.getElementById("textPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

const OCR_API_URL = "https://api.ocr.space/parse/image";
const API_KEY = "helloworld"; // demo key (replace with your own later for higher usage)

document.getElementById("year").textContent = new Date().getFullYear();

let uploadedImageData = null;

// When file selected, store its data
imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadedImageData = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Convert button: OCR + preview
convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please select an image first.");
    return;
  }

  progress.textContent = "⏳ Reading and processing image...";
  convertBtn.disabled = true;
  previewSection.style.display = "none";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");

  try {
    const response = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result?.ParsedResults?.length > 0) {
      const text = result.ParsedResults[0].ParsedText.trim();
      if (!text) {
        progress.textContent = "⚠️ OCR done but no text found. Still including image.";
      } else {
        progress.textContent = "✅ Text extracted. Preview below.";
      }

      textPreview.value = text;
      previewSection.style.display = "block";
      previewSection.scrollIntoView({ behavior: "smooth" });
    } else {
      progress.textContent = "⚠️ No text detected — image only mode.";
      previewSection.style.display = "none";
    }
  } catch (err) {
    progress.textContent = "❌ OCR failed: " + err.message;
  } finally {
    convertBtn.disabled = false;
  }
});

// DOWNLOAD button — generates hybrid .docx with image + text
downloadBtn.addEventListener("click", async () => {
  if (!window.docx) {
    alert("docx library not loaded, refresh page and try again.");
    return;
  }

  const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = window.docx;
  const paragraphs = [];

  // Add image layout at top
  if (uploadedImageData) {
    try {
      const base64 = uploadedImageData.split(",")[1];
      const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      paragraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgBytes,
              transformation: { width: 600, height: 800 },
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    } catch (err) {
      console.error("Image embedding failed:", err);
    }
  }

  // Add a separator line
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "———————————————", bold: true })],
      alignment: AlignmentType.CENTER,
    })
  );

  // Add OCR text (if available)
  const userText = textPreview.value.trim();
  if (userText) {
    const lines = userText.split(/\r?\n/);
    for (const line of lines) {
      paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
    }
  } else {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun("No text detected — only image included.")],
      })
    );
  }

  // Footer credit
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "\nConverted by Pecipic.ai",
          italics: true,
          size: 20,
        }),
      ],
      alignment: AlignmentType.RIGHT,
    })
  );

  const doc = new Document({ sections: [{ children: paragraphs }] });

  progress.textContent = "⏳ Generating Word file...";
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Pecipic-Converted.docx";
  a.click();
  URL.revokeObjectURL(url);
  progress.textContent = "✅ Download complete — open in Word to see layout + text.";
});

// Copy text
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Text copied!");
  } catch {
    alert("Clipboard not supported in this browser.");
  }
});
