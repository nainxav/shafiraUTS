const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('views'));

app.post('/upload', upload.single('file'), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: 'sapimooobucket', // Ganti dengan nama bucket Anda
    Key: req.file.originalname, // Nama file di S3
    Body: fileContent
  };

  s3.upload(params, function(err, data) {
    fs.unlinkSync(req.file.path); // Hapus file lokal setelah diunggah
    if (err) {
      return res.status(500).send("Error saat mengunggah file");
    }
    res.send(`File berhasil diunggah. Lokasi: ${data.Location}`);
  });
});

// Endpoint untuk mendapatkan daftar file dari S3
app.get("/list-files", (req, res) => {
  const params = { Bucket: "sapimooobucket" };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      return res.status(500).send("Gagal mengambil daftar file dari S3");
    }

    const files = data.Contents ? data.Contents.map((file) => file.Key) : [];
    res.json(files);
  });
});


app.listen(80, '0.0.0.0', () => {
  console.log('Server berjalan di http://localhost:3000');
});~
