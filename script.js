// Pecipic.ai — Fixed version: JPG/PNG → Word (compatible with mobile Word)

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const progress = document.getElementById("progress");
const downloadLink = document.getElementById("downloadLink");

const OCR_API_URL = "https://api.ocr.space/parse/image";
const API_KEY = "helloworld"; // Free demo key

convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) return alert("Please select an image first!");

  progress.textContent = "⏳ Uploading and reading text...";
  convertBtn.disabled = true;
  downloadLink.style.display = "none";

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
      const text = data.ParsedResults[0].ParsedText.trim();

      if (!text) {
        progress.textContent = "⚠️ No readable text found in image.";
        return;
      }

      progress.textContent = "✅ Text recognized! Creating Word file...";

      // Create a simple DOCX-like Blob that mobile Word can open
      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Pecipic.ai Document</title></head>
        <body style="font-family:Arial, sans-serif; line-height:1.6;">
          <h2 style="text-align:center;">Converted by Pecipic.ai</h2>
          <p>${text.replace(/\n/g, "<br>")}</p>
        </body>
        </html>`;

      // Use .docx extension for better compatibility
      const blob = new Blob(['\ufeff', docContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "Pecipic-Converted.docx";
      downloadLink.style.display = "inline-block";
      downloadLink.textContent = "⬇️ Download Word File";

      progress.textContent = "✅ Done! You can open this file in Word or Google Docs.";
    } else {
      progress.textContent = "⚠️ Could not extract text. Try clearer image.";
    }
  } catch (err) {
    console.error(err);
    progress.textContent = "❌ Error: " + err.message;
  } finally {
    convertBtn.disabled = false;
  }
});
