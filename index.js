const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// ACCESS TO ASSETS FOR PUBLIC
app.use(express.static("public"));

const storage = multer.diskStorage({
  // create uploads directory to store uploaded file
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // save with original name
  },
});

const upload = multer({ storage });

// page loaded
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/convert", upload.array("upload-files", 10), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      throw new Error("Tidak ada file yang diunggah.");
    }

    const convertedFiles = [];

    for (let file of files) {
      const { formatImage } = req.body; // desired image format (ex 'jpeg', 'png', 'webp')

      // check supported format
      const supportedFormats = ["jpeg", "tiff", "png", "webp", "avif", "jpg"];
      if (!supportedFormats.includes(formatImage)) {
        throw new Error("Format gambar tidak didukung.");
      }

      const filePath = file.path;
      const outputFilePath = `converted/${
        path.parse(file.originalname).name
      }.${formatImage}`;

      await sharp(filePath).toFormat(formatImage).toFile(outputFilePath);

      convertedFiles.push(outputFilePath);

      // delete original file after converted
      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
      });
    }

    // if(convertedFile more than 1), create  ZIP file
    if (convertedFiles.length > 1) {
      const zipFileName = `converted_${Date.now()}.zip`;
      const zipFilePath = path.join(__dirname, zipFileName);

      // create ZIP file with archiver
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip");

      output.on("close", () => {
        console.log(`File ZIP berhasil dibuat: ${zipFilePath}`);
        // delete converted file after being zipped
        for (let file of convertedFiles) {
          fs.unlink(file, (err) => {
            if (err) console.error(err);
          });
        }
        res.download(zipFilePath, () => {
          // delete ZIP file after downloaded
          fs.unlink(zipFilePath, (err) => {
            if (err) console.error(err);
          });
        });
      });

      archive.pipe(output);
      for (let file of convertedFiles) {
        archive.file(file, { name: path.basename(file) });
      }
      archive.finalize();
    } else {
      // If it's just one file, download it directly
      res.download(convertedFiles[0], () => {
        // Delete the converted file after download
        fs.unlink(convertedFiles[0], (err) => {
          if (err) console.error(err);
        });
      });
    }
  } catch (error) {
    console.error(
      `Terjadi kesalahan saat mengonversi gambar: ${error.message}`
    );
    res
      .status(500)
      .send(`Terjadi kesalahan saat mengonversi gambar: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;
