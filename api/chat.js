
export default async function handler(req, res) {
  const allowedOrigin = "https://jaiprakash8833-web.github.io";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is not configured" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please enter a question" });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: "Question is too long" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "You are Study Hub AI, a helpful educational assistant for students of classes 6 to 10. Explain answers in simple language. Be accurate, friendly and concise. Question: " + message
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Gemini service error",
        details: data.error?.message || "Please try again"
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "").join("")
      || "Sorry, I could not generate an answer.";

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
  
