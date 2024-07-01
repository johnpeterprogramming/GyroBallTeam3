const express = require('express');
const app = express();
const path = require("path");
const port = 80;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('WORKS');
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
