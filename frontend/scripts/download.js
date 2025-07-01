async function downloadFile() {
  const input = document.getElementById('downloadUrl');
  const fileUrl = input.value.trim();

  if (!fileUrl) {
    alert("Please paste a valid download URL.");
    return;
  }

  try {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = ""; // optional - suggest filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Download error:", err);
    alert("Failed to download file.");
  }
}
