// Pecipic.ai — Backend Connected OCR Converter
// Updated to use your Render backend: https://pecipic-backend.onrender.com

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const previewSection = document.getElementById("previewSection");
const textPreview = document.getElementById("textPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
document.getElementById("year").textContent = new Date().getFullYear();

let uploadedImageBlob = null;

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadedImageBlob = file;
});

// Backend API (your Render app)
const BACKEND_URL = "https://pecipic-backend.onrender.com/convert";

convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) return alert("Please choose an image first.");

  progress.textContent = "⏳ Uploading image to Pecipic.ai server...";
  convertBtn.disabled = true;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Conversion failed — server error.");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Automatically trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "Pecipic-Converted.docx";
    a.click();
    URL.revokeObjectURL(url);

    progress.textContent = "✅ Conversion complete. File downloaded successfully!";
  } catch (err) {
    console.error(err);
    progress.textContent = "❌ Error: " + err.message;
  } finally {
    convertBtn.disabled = false;
  }
});

// Copy text button (kept for future text extraction view)
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Copied!");
  } catch {
    alert("Clipboard not supported on this device.");
  }
});
