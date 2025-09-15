// Simple Express proxy for Together AI API
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// POST /together-proxy ($1 free credit API alternative)
app.post("/together-proxy", async (req, res) => {
  console.log("POST /together-proxy hit");
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "Together AI API key not set in environment. Get $1 free at https://api.together.xyz/settings/api-keys",
    });
  }
  try {
    // Transform request to Together AI format
    const togetherRequest = {
      messages: req.body.messages,
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      stream: false,
    };

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(togetherRequest),
      }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error contacting Together AI", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server running on port ${PORT}`);
  console.log("Available endpoints:");
  console.log("- /together-proxy (requires TOGETHER_API_KEY - $1 free credit)");
});
