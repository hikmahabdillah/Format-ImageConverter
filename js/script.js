document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("dropzone-box");
  const inputFile = document.getElementById("upload-file");
  let numOfFiles = document.getElementById("status-file");
  let fileList = document.getElementById("list-file");

  inputFile.addEventListener("change", () => {
    fileList.innerHTML = "";
    numOfFiles.textContent = `${inputFile.files.length} Files selected`;

    for (file of inputFile.files) {
      let reader = new FileReader();
      let fileName = file.name;
      let fileSize = (file.size / 1024).toFixed(0);
      let listItem = document.createElement("li");

      listItem.innerHTML = `
      <span class="detail-file">
        <img src="./img/File.png" alt="File Icon" />
        <p class="file-name">${fileName}</p>
      </span>
      <p class="file-size">${fileSize} KB</p>`;

      if (fileSize >= 1024) {
        fileSize = (file.size / 1024).toFixed(1);
        listItem.innerHTML = `
        <span class="detail-file">
          <img src="./img/File.png" alt="File Icon" />
          <p class="file-name">${fileName}</p>
        </span>
        <p class="file-size">${fileSize} MB</p>`;
      }

      fileList.appendChild(listItem);
    }
  });
});
