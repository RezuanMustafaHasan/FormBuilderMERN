const express = require('express');
const router = express.Router();
const { GoogleGenAI, Type } = require("@google/genai");
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../ai_debug.log');

const logToFile = (type, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `
================================================================
TIMESTAMP: ${timestamp}
TYPE: ${type}
----------------------------------------------------------------
${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
================================================================
`;
  fs.appendFileSync(LOG_FILE, logEntry);
};

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/suggest-details', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    const ai = getAI();
    const requestPayload = {
      model: 'gemini-3-flash-preview',
      contents: `I want to create a form about: ${topic}. Give me a title and a description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    };

    console.log("----------------------------------------------------------------");
    console.log("GEMINI REQUEST [suggest-details]:");
    console.log(JSON.stringify(requestPayload, null, 2));
    console.log("----------------------------------------------------------------");
    logToFile('REQUEST [suggest-details]', requestPayload);

    const response = await ai.models.generateContent(requestPayload);

    console.log("----------------------------------------------------------------");
    console.log("GEMINI RESPONSE [suggest-details]:");
    console.log(JSON.stringify(response, null, 2));
    console.log("Raw Text:", response.text);
    console.log("----------------------------------------------------------------");
    logToFile('RESPONSE [suggest-details]', { responseObj: response, rawText: response.text });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ title: topic, description: "Automated description generation failed." });
  }
});

router.post('/suggest-questions', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const ai = getAI();
    const requestPayload = {
      model: 'gemini-3-flash-preview',
      contents: `Create 5 relevant form questions for a form titled "${title}" with description "${description}". Include varied types like short text, multiple choice, and email.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["SHORT_TEXT", "LONG_TEXT", "MULTIPLE_CHOICE", "EMAIL", "NUMBER", "CHECKBOXES", "DROPDOWN", "DATE", "TIME"] },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              required: { type: Type.BOOLEAN }
            },
            required: ["label", "type", "required"]
          }
        }
      }
    };

    console.log("----------------------------------------------------------------");
    console.log("GEMINI REQUEST [suggest-questions]:");
    console.log(JSON.stringify(requestPayload, null, 2));
    console.log("----------------------------------------------------------------");
    logToFile('REQUEST [suggest-questions]', requestPayload);

    const response = await ai.models.generateContent(requestPayload);

    console.log("----------------------------------------------------------------");
    console.log("GEMINI RESPONSE [suggest-questions]:");
    console.log(JSON.stringify(response, null, 2));
    console.log("Raw Text:", response.text);
    console.log("----------------------------------------------------------------");
    logToFile('RESPONSE [suggest-questions]', { responseObj: response, rawText: response.text });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json([]);
  }
});

module.exports = router;
