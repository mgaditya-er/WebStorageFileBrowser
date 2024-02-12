const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const cors = require('cors');


const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static('index.html'));

let rootDirectory = './first'; // Replace with your actual root directory
let fileStructure = retrieveAllFileStructure(rootDirectory);

function retrieveAllFileStructure(directory) {
  const filesAndFolders = fs.readdirSync(directory);
  const structure = [];

  for (const item of filesAndFolders) {
    const fullPath = path.join(directory, item);
    const stats = fs.statSync(fullPath);

    const entry = {
      name: item,
      isDirectory: stats.isDirectory(),
    };

    if (stats.isDirectory()) {
      entry.children = retrieveAllFileStructure(fullPath);
    }

    structure.push(entry);
  }

  return structure;
}

function updateFileStructure() {
  fileStructure = retrieveAllFileStructure(rootDirectory);
}

// Watch for changes in the root directory
const watcher = chokidar.watch(rootDirectory, { recursive: true });

watcher.on('all', (event, path) => {
  console.log(`${event} detected on ${path}`);
  updateFileStructure();
});

app.get('/file', (req, res) => {
  res.json(fileStructure);
});

// POST request to create a new file
app.post('/file', (req, res) => {
  const filePath = req.body.path;
  const fileName = req.body.fileName;

  if (!filePath || !fileName) {
      return res.status(400).send('Path and fileName are required.');
  }

  const fullPath = path.join(rootDirectory, filePath);
  fs.writeFile(fullPath, '', (err) => {
      // if (err) {
      //     // console.error('Error creating file:', err);
      //     console.log(fullPath);
      //     return res.status(500).send('Error creating file.');
      // }
      console.log('File created successfully:', fullPath);
      updateFileStructure();
      res.status(201).send('File created successfully.');
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
