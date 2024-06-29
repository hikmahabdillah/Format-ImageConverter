document.addEventListener("DOMContentLoaded", () => {
  const formConvert = document.getElementById("convert-file");
  const dropArea = document.getElementById("dropzone-box");
  const inputFile = document.getElementById("upload-files");
  let numOfFiles = document.getElementById("status-file");
  let fileList = document.getElementById("list-file");
  let convertTo = document.getElementById("format-image");
  const convertFile = document.getElementById("btn-convert");

  // FUNCTION UPLOADING FILE
  const uploadingFile = () => {
    let uploadedExtensions = [];
    fileList.innerHTML = "";
    numOfFiles.textContent = `${inputFile.files.length} Files selected`;

    for (file of inputFile.files) {
      let reader = new FileReader();
      let fileName = file.name;
      let fileSize = (file.size / 1024).toFixed(0);
      let listItem = document.createElement("li");
      let fileExtension = fileName.split(".").pop();
      uploadedExtensions.push(fileExtension);

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
    return uploadedExtensions;
  };

  // INPUT FILE CHOOSEN

  const fileChoosen = () => {
    return new Promise((resolve, reject) => {
      resolve(uploadingFile());
    });
  };
  inputFile.addEventListener("change", () => {
    fileChoosen();
  });

  //  DROPZONE AREA EVENT
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadingFile();
    console.log(uploadingFile());
  });
  // EVENT WHEN USER AFTER SUBMIT THE FORM
  formConvert.addEventListener("submit", (e) => {
    // Mengosongkan nilai select
    convertTo.selectedIndex = 0;
    // Menyimpan pesan 'No files selected'
    numOfFiles.textContent = "No files selected";
    fileList.innerHTML = "";
    form.reset();
  });
});
