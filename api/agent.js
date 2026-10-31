module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY is not configured in Vercel." });
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 12000) return res.status(400).json({ error: "Enter a message under 12,000 characters." });
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-6-astra",
        instructions: "You are ØĞMÛŠKŶ AI, the creative assistant for ØĞMÛŠKŶ Official Brand. Help users brainstorm, write and improve image or video prompts, plan creative projects, and answer questions. Be clear, safe, and honest. Do not claim to have generated media; direct users to the Image Generator, Photo Editor, or Video Studio tools for those actions.",
        input: message
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "The AI provider returned an error." });
    const reply = (data.output || []).flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text).join("\n").trim();
    return res.status(200).json({ reply: reply || "I couldn't produce a text response. Please try again." });
  } catch (error) { return res.status(502).json({ error: "Could not reach the AI service." }); }
};