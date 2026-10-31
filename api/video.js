module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const endpoint = process.env.VIDEO_PROVIDER_URL;
  const key = process.env.VIDEO_PROVIDER_API_KEY;
  if (!endpoint || !key) return res.status(503).json({ error: "Video generation is not enabled yet. Add VIDEO_PROVIDER_URL and VIDEO_PROVIDER_API_KEY in Vercel after choosing a supported video provider." });
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt || prompt.length > 10000) return res.status(400).json({ error: "Enter a video prompt under 10,000 characters." });
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ prompt, image_url: req.body.imageUrl || undefined }) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || data.message || "Video provider request failed." });
    return res.status(200).json({ videoUrl: data.video_url || data.output_url || data.url || null, jobId: data.id || data.job_id || null, message: data.message || "Video job submitted. Configure your provider's status/result polling before production use." });
  } catch (error) { return res.status(502).json({ error: "Could not reach the video provider." }); }
};