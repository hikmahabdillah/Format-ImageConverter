const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// ACCESS TO ASSETS FOR PUBLIC
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Menyimpan dengan nama asli
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/convert", upload.single("upload-files"), async (req, res) => {
  const { formatImage } = req.body; // Format gambar yang diinginkan (misalnya 'jpeg', 'png', 'webp')
  const filePath = req.file.path;
  const outputFilePath = `converted/${
    path.parse(req.file.originalname).name
  }.${formatImage}`;

  try {
    // Periksa apakah format yang diminta didukung
    const supportedFormats = ["jpeg", "tiff", "png", "webp", "avif", "jpg"];
    if (!supportedFormats.includes(formatImage)) {
      throw new Error("Format gambar tidak didukung.");
    }

    await sharp(filePath).toFormat(formatImage).toFile(outputFilePath);

    // Hapus file asli setelah konversi
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
    });

    res.download(outputFilePath, (err) => {
      if (err) {
        console.error(err);
      }
      // Hapus file hasil konversi setelah diunduh
      fs.unlink(outputFilePath, (err) => {
        if (err) console.error(err);
      });

      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`Terjadi kesalahan saat mengonversi gambar: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
