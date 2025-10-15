// Pecipic.ai — Enhanced UI + Backend Integration (v2)
const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const previewSection = document.getElementById("previewSection");
const textPreview = document.getElementById("textPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

document.getElementById("year").textContent = new Date().getFullYear();

let convertedBlob = null;
let uploadedImage = null;

// === Loading animation text ===
const loadingTexts = [
  "🔍 Analyzing image…",
  "🧠 Extracting text & layout…",
  "📄 Building editable Word file…",
  "✨ Finalizing document…",
];

// === When user selects file ===
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadedImage = file;
  previewSection.style.display = "none";
  progress.innerHTML = "✅ Image ready to convert.";
});

// === Convert Now button ===
convertBtn.addEventListener("click", async () => {
  if (!uploadedImage) {
    alert("Please select an image first.");
    return;
  }

  convertBtn.disabled = true;
  progress.innerHTML = `<div class="loader"></div><p>Starting conversion...</p>`;

  const formData = new FormData();
  formData.append("image", uploadedImage);

  // Simulate progress bar text updates
  let i = 0;
  const loadingInterval = setInterval(() => {
    if (i < loadingTexts.length) {
      progress.innerHTML = `<div class="loader"></div><p>${loadingTexts[i++]}</p>`;
    }
  }, 2000);

  try {
    const response = await fetch("https://pecipic-backend.onrender.com/convert-ai", {
      method: "POST",
      body: formData,
    });

    clearInterval(loadingInterval);

    if (!response.ok) throw new Error("Server error — failed to process image.");

    const blob = await response.blob();
    convertedBlob = blob;

    progress.innerHTML = "✅ Conversion complete — document ready!";
    previewSection.style.display = "block";
    textPreview.value = "Your editable Word document is ready for download.";
  } catch (error) {
    clearInterval(loadingInterval);
    progress.innerHTML = "❌ Conversion failed: " + error.message;
  } finally {
    convertBtn.disabled = false;
  }
});

// === Download file ===
downloadBtn.addEventListener("click", () => {
  if (!convertedBlob) return alert("Please convert first.");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(convertedBlob);
  a.download = "Pecipic-Converted.docx";
  a.click();
});

// === Copy text ===
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Copied to clipboard!");
  } catch {
    alert("Clipboard not supported on this device.");
  }
});
