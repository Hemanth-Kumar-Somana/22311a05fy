const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9001;

// Test server base URL (running on port 5000)
const TEST_SERVER_URL = "http://localhost:5000/evaluation-service";

// API endpoints for different number categories
const API_URLS = {
    prime: `${TEST_SERVER_URL}/primes`,
    fibonacci: `${TEST_SERVER_URL}/fibo`,
    even: `${TEST_SERVER_URL}/even`,
    random: `${TEST_SERVER_URL}/rand`,
};

let windowPrevState = [];
const WINDOW_SIZE = 10;

// Function to fetch numbers from the mock test server
async function fetchNumbers(type) {
    try {
        const response = await axios.get(API_URLS[type]);
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
}

// Function to calculate moving average
function calculateAverage(numbers) {
    return numbers.length ? (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2) : 0;
}

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to the Average Calculator Microservice! Use /numbers/:type to fetch and calculate averages.");
});

// API endpoint for calculating average
app.get("/numbers/:type", async (req, res) => {
    const { type } = req.params;

    if (!API_URLS[type]) {
        return res.status(400).json({ error: "Invalid number type" });
    }

    const fetchedNumbers = await fetchNumbers(type);
    
    // Remove duplicates
    const newNumbers = fetchedNumbers.filter((num) => !windowPrevState.includes(num));
    
    // Maintain window size
    windowPrevState = [...windowPrevState, ...newNumbers].slice(-WINDOW_SIZE);

    // Calculate average
    const avg = calculateAverage(windowPrevState);

    res.json({
        windowPrevState,
        windowCurrState: newNumbers,
        numbers: fetchedNumbers,
        avg,
    });
});

app.listen(PORT, () => {
    console.log(`Microservice running on http://localhost:${PORT}`);
});
