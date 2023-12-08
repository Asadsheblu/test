const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()
const app = express();
const port = 4000;

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.7auxx.mongodb.net:27017,cluster0-shard-00-01.7auxx.mongodb.net:27017,cluster0-shard-00-02.7auxx.mongodb.net:27017/?ssl=true&replicaSet=atlas-quc4tl-shard-0&authSource=admin&retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const File = mongoose.model('File', {
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = new File({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  await file.save();

  res.send('File uploaded successfully!');
});

// New route to get the count of uploaded files
app.get('/fileCount', async (req, res) => {
  try {
    const count = await File.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
