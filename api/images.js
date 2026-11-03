module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.FAL_KEY;
  if (!key) return res.status(503).json({ error: "FAL_KEY is not configured in Vercel." });
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const sizes = ["1024x1024", "1536x1024", "1024x1536"];
  if (!prompt || prompt.length > 10000) return res.status(400).json({ error: "Enter a prompt under 10,000 characters." });
  const image_size = req.body.size === "1536x1024" ? "landscape_4_3" : req.body.size === "1024x1536" ? "portrait_4_3" : "square";
  try {
    const response = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: { "Authorization": `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_size, output_format: "png", num_images: 1, enable_safety_checker: true })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.detail?.[0]?.msg || data.error || "Fal image generation failed." });
    const image = data.images?.[0]?.url;
    if (!image) return res.status(502).json({ error: "Fal returned no image URL." });
    return res.status(200).json({ image, provider: "fal", model: "fal-ai/flux/dev" });
  } catch (error) { return res.status(502).json({ error: "Could not reach Fal image generation." }); }
};
