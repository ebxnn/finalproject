import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const handleMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Google API key is not configured");
    }

    const systemContext = `You are a helpful furniture store assistant. You can help customers with:
    - Product recommendations
    - Furniture care tips
    - Size and measurement guidance
    - Style and design advice
    - General furniture questions
    Please be friendly and professional.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${systemContext}\n\nUser: ${message}\n\nAssistant:`
          }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message
    });
  }
}; 