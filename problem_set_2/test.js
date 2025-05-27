const request = require('supertest');
const app = require('./server');
const axios = require('axios');

jest.setTimeout(15000);

jest.mock('axios');

axios.get.mockImplementation((url, config) => {
  if (url.includes('/stocks/AAPL')) {
    return Promise.resolve({
      data: { averageStockPrice: 150, priceHistory: [140, 155, 160] },
    });
  }
  if (url.includes('/stocks/GOOG')) {
    return Promise.resolve({
      data: { averageStockPrice: 2800, priceHistory: [2700, 2750, 2900] },
    });
  }
  return Promise.reject(new Error('API error'));
});

describe('Stock Microservice Endpoints', () => {
  test('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Welcome to the Stock Microservice!');
  });

  test('GET /stocks/:ticker should return stock data', async () => {
    const res = await request(app).get('/stocks/AAPL?minutes=60');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('averageStockPrice');
    expect(res.body).toHaveProperty('priceHistory');
  });

  test('GET /stockcorrelation should return correlation', async () => {
    const res = await request(app).get('/stockcorrelation?ticker1=AAPL&ticker2=GOOG&minutes=60');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('correlation');
  });
});
