// Pecipic.ai — Smart JPG/PNG → Word Converter (Free OCR API version)

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const downloadLink = document.getElementById("downloadLink");

// Using free OCR.Space API — no backend required
const OCR_API_URL = "https://api.ocr.space/parse/image";
const API_KEY = "helloworld"; // Free demo key (works for small usage)

convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) return alert("Please select an image first!");

  progress.textContent = "⏳ Uploading image and reading text...";
  convertBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", API_KEY);
  formData.append("language", "eng");

  try {
    const res = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.ParsedResults && data.ParsedResults.length > 0) {
      const text = data.ParsedResults[0].ParsedText;
      progress.textContent = "✅ Text recognized! Generating Word file...";

      // Convert plain text into a downloadable Word file
      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Pecipic.ai Document</title></head>
        <body>${text.replace(/\n/g, "<br>")}</body>
        </html>`;

      const blob = new Blob(['\ufeff', docContent], {
        type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);

      downloadLink.href = url;
      downloadLink.download = "Pecipic-Converted.doc";
      downloadLink.style.display = "inline-block";
      downloadLink.textContent = "⬇️ Download Word File";

      progress.textContent = "✅ Done! You can download your file below.";
    } else {
      progress.textContent = "⚠️ Could not read text from image.";
    }
  } catch (err) {
    console.error(err);
    progress.textContent = "❌ Error: " + err.message;
  } finally {
    convertBtn.disabled = false;
  }
});
