// Pecipic.ai — Hybrid OCR (Layout Image + Text) — mobile safe version

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const previewSection = document.getElementById("previewSection");
const textPreview = document.getElementById("textPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

const OCR_API_URL = "https://api.ocr.space/parse/image";
const API_KEY = "helloworld"; // free demo key
document.getElementById("year").textContent = new Date().getFullYear();

let uploadedImageBlob = null;

// Read file as blob and base64
imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadedImageBlob = file;
});

convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) return alert("Please choose an image first.");

  progress.textContent = "⏳ Uploading and reading image...";
  convertBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");

  try {
    const res = await fetch(OCR_API_URL, { method: "POST", body: formData });
    const data = await res.json();

    const text = data?.ParsedResults?.[0]?.ParsedText?.trim() || "";
    textPreview.value = text;
    previewSection.style.display = "block";
    progress.textContent = "✅ OCR complete. Ready to download.";
  } catch (err) {
    progress.textContent = "❌ OCR error: " + err.message;
  } finally {
    convertBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", async () => {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun } = window.docx;

  const paragraphs = [];

  // Embed actual image blob (not base64)
  if (uploadedImageBlob) {
    const arrayBuffer = await uploadedImageBlob.arrayBuffer();
    const imageUint8 = new Uint8Array(arrayBuffer);

    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: imageUint8,
            transformation: { width: 600, height: 800 },
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Add separator line
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "——— Extracted Text ———", bold: true })],
      alignment: AlignmentType.CENTER,
    })
  );

  // Add extracted text
  const text = textPreview.value.trim();
  if (text) {
    text.split(/\r?\n/).forEach((line) => {
      paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
    });
  } else {
    paragraphs.push(new Paragraph({ children: [new TextRun("No text detected")] }));
  }

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "\nConverted by Pecipic.ai", italics: true, size: 20 })],
      alignment: AlignmentType.RIGHT,
    })
  );

  const doc = new Document({ sections: [{ children: paragraphs }] });
  progress.textContent = "⏳ Building Word file...";
  const blob = await Packer.toBlob(doc);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Pecipic-Converted.docx";
  a.click();
  URL.revokeObjectURL(a.href);

  progress.textContent = "✅ Download complete — image + text included.";
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Copied!");
  } catch {
    alert("Clipboard not supported on this device.");
  }
});
