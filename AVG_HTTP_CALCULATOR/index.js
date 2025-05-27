const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const jwtDecode = require("jsonwebtoken").decode;

const app = express();
const port = 9877;

// Initial token (replace or refresh as needed)
let AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzI2OTg5LCJpYXQiOjE3NDgzMjY2ODksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjMwODJhMGE0LWU4MjUtNGJkZS1hZDQwLTdkNTNmMjdlZjc3YiIsInN1YiI6IjIyMzExYTA1ZnlAY3NlLnNyZWVuaWRoaS5lZHUuaW4ifSwiZW1haWwiOiIyMjMxMWEwNWZ5QGNzZS5zcmVlbmlkaGkuZWR1LmluIiwibmFtZSI6InNvbWFuYSBoZW1hbnRoIGt1bWFyIiwicm9sbE5vIjoiMjIzMTFhMDVmeSIsImFjY2Vzc0NvZGUiOiJQQ3FBVUsiLCJjbGllbnRJRCI6IjMwODJhMGE0LWU4MjUtNGJkZS1hZDQwLTdkNTNmMjdlZjc3YiIsImNsaWVudFNlY3JldCI6ImhSRm1EQ0F5WHd1eWFIeEMifQ.ZazTyvPrboNNP0LpmiPmDJx6L9PU3buFAfELwJlJBw0";

const movingAverages = {
  prime: [],
  even: [],
  fibo: [],
  rand: [],
};

const WINDOW_SIZE = 10;

// Check if token is expired
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

// Dummy token refresh logic - update with real logic as needed
async function refreshToken() {
  console.log("Refreshing token...");
  // For now, just return same token
  return AUTH_TOKEN;
}

// Generate random number ID between 1 and 100 (or range your API accepts)
function getRandomId() {
  return Math.floor(Math.random() * 100) + 1;
}

async function fetchNumber(apiUrl) {
  if (isTokenExpired(AUTH_TOKEN)) {
    AUTH_TOKEN = await refreshToken();
  }

  // Append a random valid id query parameter to avoid "invalid id" error
  const id = getRandomId();
  const urlWithId = `${apiUrl}?id=${id}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(urlWithId, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      return [];
    }

    const data = await response.json();
    return data.numbers || [];
  } catch (error) {
    console.error("Error fetching numbers:", error.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

app.get("/", (req, res) => {
  res.send("Welcome! Use /numbers/prime, /numbers/even, /numbers/fibo or /numbers/rand");
});

app.get("/numbers/:type", async (req, res) => {
  const type = req.params.type;
  const apiMap = {
    prime: "http://20.244.56.144/evaluation-service/prime",
    even: "http://20.244.56.144/evaluation-service/even",
    fibo: "http://20.244.56.144/evaluation-service/fibo",
    rand: "http://20.244.56.144/evaluation-service/rand",
  };

  const apiUrl = apiMap[type];
  if (!apiUrl) {
    return res.status(400).json({ error: "Invalid number type" });
  }

  const newNumbers = await fetchNumber(apiUrl);
  const window = movingAverages[type];

  for (const num of newNumbers) {
    if (!window.includes(num)) {
      if (window.length >= WINDOW_SIZE) {
        window.shift();
      }
      window.push(num);
    }
  }

  const avg = calculateAverage(window);
  res.json({
    window: [...window],
    average: avg.toFixed(2),
  });
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Page not found" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
