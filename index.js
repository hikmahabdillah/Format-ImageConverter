const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");

const port = 3000;

const corsConfig = {
  origin: "*",
  credential: true,
  methods: ["GET", "POST"],
};

app.use(cors(corsConfig));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp/"); // use /tmp/ for temporary storage
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/convert", upload.array("upload-files", 60), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      throw new Error("Tidak ada file yang diunggah.");
    }

    const { formatImage } = req.body;
    const supportedFormats = ["jpeg", "tiff", "png", "webp", "avif", "jpg"];

    if (!supportedFormats.includes(formatImage)) {
      throw new Error("Format gambar tidak didukung.");
    }

    const convertedFiles = [];

    for (let file of files) {
      const filePath = file.path;
      const outputFilePath = path.join("/tmp", `${path.parse(file.originalname).name}.${formatImage}`);

      console.log(`Mengonversi file ${filePath} ke ${outputFilePath}`);

      await sharp(filePath).toFormat(formatImage).toFile(outputFilePath);
      convertedFiles.push(outputFilePath);

      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });
    }

    if (convertedFiles.length > 1) {
      const zipFileName = `converted_${Date.now()}.zip`;
      const zipFilePath = path.join("/tmp", zipFileName);

      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip");

      output.on("close", () => {
        console.log(`File ZIP berhasil dibuat: ${zipFilePath}`);
        for (let file of convertedFiles) {
          fs.unlink(file, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
          });
        }
        res.download(zipFilePath, () => {
          fs.unlink(zipFilePath, (err) => {
            if (err) console.error(`Error deleting ZIP file: ${err}`);
          });
        });
      });

      archive.on("error", (err) => {
        throw new Error(`Archiver error: ${err.message}`);
      });

      archive.pipe(output);
      for (let file of convertedFiles) {
        archive.file(file, { name: path.basename(file) });
      }
      archive.finalize();
    } else {
      res.download(convertedFiles[0], () => {
        fs.unlink(convertedFiles[0], (err) => {
          if (err) console.error(`Error deleting file: ${err}`);
        });
      });
    }
  } catch (error) {
    console.error(`Terjadi kesalahan saat mengonversi gambar: ${error.message}`);
    res.status(500).send(`Terjadi kesalahan saat mengonversi gambar: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
