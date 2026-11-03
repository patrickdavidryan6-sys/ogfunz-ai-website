module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.FAL_KEY;
  if (!key) return res.status(503).json({ error: "FAL_KEY is not configured in Vercel." });
  const endpoint = req.query?.endpoint;
  const requestId = req.query?.requestId;
  const allowed = ["fal-ai/wan/v2.7/text-to-video", "fal-ai/wan/v2.7/image-to-video"];
  if (!allowed.includes(endpoint) || typeof requestId !== "string" || !/^[a-zA-Z0-9-]{8,100}$/.test(requestId)) return res.status(400).json({ error: "Invalid Fal job reference." });
  const headers = { "Authorization": `Key ${key}` };
  try {
    const statusResponse = await fetch(`https://queue.fal.run/${endpoint}/requests/${encodeURIComponent(requestId)}/status`, { headers });
    const state = await statusResponse.json();
    if (!statusResponse.ok) return res.status(statusResponse.status).json({ error: state.detail?.[0]?.msg || "Could not read Fal job status." });
    if (state.status !== "COMPLETED") {
      if (state.status === "FAILED") return res.status(502).json({ error: "Fal video generation failed." });
      return res.status(200).json({ status: state.status || "IN_PROGRESS" });
    }
    const resultResponse = await fetch(`https://queue.fal.run/${endpoint}/requests/${encodeURIComponent(requestId)}`, { headers });
    const result = await resultResponse.json();
    if (!resultResponse.ok) return res.status(resultResponse.status).json({ error: "Fal completed the job but the video result could not be retrieved." });
    const videoUrl = result.video?.url || result.video_url || result.output?.video?.url;
    if (!videoUrl) return res.status(502).json({ error: "Fal completed the job but returned no video URL." });
    return res.status(200).json({ status: "COMPLETED", videoUrl });
  } catch (error) { return res.status(502).json({ error: "Could not check Fal video status." }); }
};
