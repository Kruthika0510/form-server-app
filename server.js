const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Submit form
app.post('/submit', (req, res) => {
  let { name, email, age, gender, country, feedback } = req.body;
  let hobbies = req.body.hobbies;

  // Ensure hobbies is an array
  if (!Array.isArray(hobbies)) {
    hobbies = hobbies ? [hobbies] : [];
  }

  const newEntry = {
    name,
    email,
    age,
    gender,
    country,
    hobbies,
    feedback,
    timestamp: new Date().toLocaleString()
  };

  const filePath = path.join(__dirname, 'data.json');
  let data = [];

  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      console.error('Error reading data.json:', err);
    }
  }

  data.push(newEntry);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.render('success', { entry: newEntry });
});

// View all submissions
app.get('/submissions', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  let data = [];

  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      console.error('Error reading data.json:', err);
    }
  }

  res.render('submissions', { submissions: data });
});

// ✅ Delete all submissions
app.post('/delete-all', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  fs.writeFileSync(filePath, JSON.stringify([], null, 2)); // Clear the file
  res.redirect('/submissions');
});

// 🗑️ Delete individual submission
app.post('/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const filePath = path.join(__dirname, 'data.json');
  let data = [];

  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      console.error('Error reading data.json:', err);
    }
  }

  // If index is valid, remove the entry
  if (!isNaN(index) && index >= 0 && index < data.length) {
    data.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  res.redirect('/submissions');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
