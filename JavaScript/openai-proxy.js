
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// POST /api/openai
app.post('/api/openai', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment.' });
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error contacting OpenAI', details: err.message });
  }
});

// POST /openai-proxy (alias for /api/openai for frontend compatibility)
app.post('/openai-proxy', async (req, res) => {
  console.log('POST /openai-proxy hit');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment.' });
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error contacting OpenAI', details: err.message });
  }
});

// POST /huggingface-proxy (FREE API alternative!)
app.post('/huggingface-proxy', async (req, res) => {
  console.log('POST /huggingface-proxy hit');
  const apiKey = process.env.HF_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ error: 'Hugging Face token not set in environment. Get one free at https://huggingface.co/settings/tokens' });
  }
  try {
    // Transform request to Hugging Face format
    const hfRequest = {
      messages: req.body.messages,
      model: "deepseek-ai/DeepSeek-V3-0324", // High-quality free model
      stream: false
    };
    
    const response = await fetch('https://router.huggingface.co/novita/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(hfRequest)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error contacting Hugging Face', details: err.message });
  }
});

// POST /together-proxy ($1 free credit API alternative)
app.post('/together-proxy', async (req, res) => {
  console.log('POST /together-proxy hit');
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Together AI API key not set in environment. Get $1 free at https://api.together.xyz/settings/api-keys' });
  }
  try {
    // Transform request to Together AI format
    const togetherRequest = {
      messages: req.body.messages,
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      stream: false
    };
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(togetherRequest)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error contacting Together AI', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- /openai-proxy (requires OPENAI_API_KEY)');
  console.log('- /huggingface-proxy (requires HF_TOKEN - FREE!)');
  console.log('- /together-proxy (requires TOGETHER_API_KEY - $1 free credit)');
});
