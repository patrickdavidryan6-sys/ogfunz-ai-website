module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY is not configured in Vercel." });
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks);
    const contentType = req.headers["content-type"] || "";
    const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.slice(1).find(Boolean);
    if (!boundary) return res.status(400).json({ error: "Expected a multipart photo upload." });
    const body = raw.toString("latin1");
    const parts = body.split("--" + boundary);
    let prompt = "";
    let imagePart = null;
    for (const part of parts) {
      const split = part.indexOf("\r\n\r\n");
      if (split < 0) continue;
      const headers = part.slice(0, split);
      const payload = part.slice(split + 4).replace(/\r\n$/, "");
      if (headers.includes('name="prompt"')) prompt = Buffer.from(payload, "latin1").toString("utf8").trim();
      if (headers.includes('name="image"')) {
        const mime = headers.match(/Content-Type:\s*([^\r\n;]+)/i)?.[1] || "image/png";
        imagePart = { mime, bytes: Buffer.from(payload, "latin1"), filename: headers.match(/filename="([^"]+)"/)?.[1] || "upload.png" };
      }
    }
    if (!prompt || !imagePart) return res.status(400).json({ error: "A photo and editing prompt are required." });
    if (imagePart.bytes.length > 20 * 1024 * 1024) return res.status(413).json({ error: "Photo must be smaller than 20 MB." });
    const form = new FormData();
    form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst");
    form.append("prompt", prompt);
    form.append("image", new Blob([imagePart.bytes], { type: imagePart.mime }), imagePart.filename);
    form.append("output_format", "png");
    const response = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Photo editing failed." });
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded) return res.status(502).json({ error: "The image provider returned no edited image." });
    return res.status(200).json({ image: "data:image/png;base64," + encoded });
  } catch (error) { return res.status(502).json({ error: "Could not process the photo edit request." }); }
};