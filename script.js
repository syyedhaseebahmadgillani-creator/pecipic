// Pecipic.ai — Image to Word Converter (Connected to Backend)
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

// When user selects a file
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadedImage = file;
  previewSection.style.display = "none";
  progress.textContent = "✅ Image ready to upload.";
});

// When user clicks "Convert Now"
convertBtn.addEventListener("click", async () => {
  if (!uploadedImage) {
    alert("Please select an image first.");
    return;
  }

  convertBtn.disabled = true;
  progress.textContent = "⏳ Uploading image to Pecipic AI...";

  const formData = new FormData();
  formData.append("image", uploadedImage);

  try {
    const response = await fetch("https://pecipic-backend.onrender.com/convert-ai", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server error — failed to process image.");
    }

    const blob = await response.blob();
    convertedBlob = blob;

    progress.textContent = "✅ Conversion complete. Click download below!";
    previewSection.style.display = "block";
    textPreview.value = "Your document is ready — click Download.";
  } catch (error) {
    progress.textContent = "❌ Conversion failed: " + error.message;
  } finally {
    convertBtn.disabled = false;
  }
});

// Download file as Word
downloadBtn.addEventListener("click", () => {
  if (!convertedBlob) return alert("Please convert first.");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(convertedBlob);
  a.download = "Pecipic-Converted.docx";
  a.click();
});

// Copy text button (optional)
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textPreview.value);
    alert("Copied to clipboard!");
  } catch {
    alert("Clipboard not supported on this device.");
  }
});
