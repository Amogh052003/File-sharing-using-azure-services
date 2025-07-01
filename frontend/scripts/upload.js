async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');
  const downloadLink = document.getElementById('downloadLink');
  const file = fileInput.files[0];

  if (!file) {
    status.innerText = "Please select a file.";
    return;
  }

  status.innerText = "Uploading...";

  const functionUrl = `https://<YOUR_FUNCTION_APP>.azurewebsites.net/api/generate_sas_upload?filename=${encodeURIComponent(file.name)}`;

  try {
    // Get SAS upload URL from Azure Function
    const response = await fetch(functionUrl);
    const sasUrl = await response.text();

    if (!response.ok) {
      throw new Error(sasUrl);
    }

    // Upload file to Blob Storage using the SAS URL
    const uploadResponse = await fetch(sasUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type
      },
      body: file
    });

    if (uploadResponse.ok) {
      status.innerText = "✅ Upload successful!";
      downloadLink.innerHTML = `
        <p>🔗 Share this URL to download:</p>
        <input type="text" readonly value="${sasUrl}" style="width:100%; margin-top:0.5rem" />
      `;
    } else {
      throw new Error(uploadResponse.statusText);
    }
  } catch (err) {
    status.innerText = `❌ Upload failed: ${err.message}`;
  }
}
