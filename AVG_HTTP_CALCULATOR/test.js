const express = require('express');
const app = express();
app.get('/evaluation-service/primes', (req, res) => {
  res.json({ numbers: [2, 3, 5, 7, 11] });
});

app.get('/evaluation-service/fibo', (req, res) => {
  res.json({ numbers: [55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765] });
});

app.get('/evaluation-service/even', (req, res) => {
  res.json({ numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] });
});

app.get('/evaluation-service/rand', (req, res) => {
  res.json({ numbers: [42, 17, 93, 58, 21, 76, 34, 65, 88, 10] });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test API server running on http://localhost:${PORT}`);
});