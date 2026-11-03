module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.FAL_KEY;
  if (!key) return res.status(503).json({ error: "FAL_KEY is not configured in Vercel." });
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const imageUrl = typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : "";
  if (!prompt || prompt.length > 5000) return res.status(400).json({ error: "Enter a video prompt under 5,000 characters." });
  if (imageUrl && !/^https:\/\//i.test(imageUrl)) return res.status(400).json({ error: "Starting image must be a public HTTPS URL." });
  const endpoint = imageUrl ? "fal-ai/wan/v2.7/image-to-video" : "fal-ai/wan/v2.7/text-to-video";
  const input = imageUrl ? { prompt, image_url: imageUrl, duration: 5, resolution: "720p", enable_safety_checker: true } : { prompt, duration: 5, resolution: "720p", enable_safety_checker: true };
  try {
    const response = await fetch(`https://queue.fal.run/${endpoint}`, {
      method: "POST",
      headers: { "Authorization": `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.detail?.[0]?.msg || data.error || "Fal video request failed." });
    if (!data.request_id) return res.status(502).json({ error: "Fal did not return a video job ID." });
    return res.status(202).json({ requestId: data.request_id, endpoint, message: "Video queued on Fal. Checking progress…" });
  } catch (error) { return res.status(502).json({ error: "Could not reach Fal video generation." }); }
};
