require('dotenv').config({ path: './.env' });
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.API_URL || !process.env.ACCESS_TOKEN) {
  console.error('Error: API_URL or ACCESS_TOKEN missing in .env');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Stock Microservice!');
});

const fetchStockData = async (ticker, minutes) => {
  try {
    const response = await axios.get(`${process.env.API_URL}/stocks/${ticker}`, {
      headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
      params: { minutes },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error.response?.data || error.message);
    throw new Error('Failed to retrieve stock data');
  }
};

app.get('/stocks/:ticker', async (req, res) => {
  try {
    const data = await fetchStockData(req.params.ticker, req.query.minutes);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/stockcorrelation', async (req, res) => {
  const { ticker1, ticker2, minutes } = req.query;

  try {
    const [data1, data2] = await Promise.all([
      fetchStockData(ticker1, minutes),
      fetchStockData(ticker2, minutes),
    ]);

    const correlation = Math.random();
    res.json({ correlation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
