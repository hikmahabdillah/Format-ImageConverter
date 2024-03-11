document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("dropzone-box");
  const inputFile = document.getElementById("upload-file");
  let numOfFiles = document.getElementById("status-file");
  let fileList = document.getElementById("list-file");

  inputFile.addEventListener("change", () => {
    fileList.innerHTML = "";
    numOfFiles.textContent = `${inputFile.files.length} Files selected`;
  });

  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");
});
