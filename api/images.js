module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY is not configured in Vercel." });
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const sizes = ["1024x1024", "1536x1024", "1024x1536"];
  const qualities = ["low", "medium", "high"];
  if (!prompt || prompt.length > 10000) return res.status(400).json({ error: "Enter a prompt under 10,000 characters." });
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst", prompt, size: sizes.includes(req.body.size) ? req.body.size : "1024x1024", quality: qualities.includes(req.body.quality) ? req.body.quality : "medium", n: 1, output_format: "png" })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Image generation failed." });
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded) return res.status(502).json({ error: "The image provider returned no image data." });
    return res.status(200).json({ image: "data:image/png;base64," + encoded });
  } catch (error) { return res.status(502).json({ error: "Could not reach the image service." }); }
};