# ØĞMÛŠKŶ AI Studio — Vercel setup

This repository remains a static HTML site with Vercel Node serverless functions under `/api`.

## Pages
- `/` — branded landing page
- `/studio.html` — AI workspace: chat, image generation, photo editing, video-provider entry point, and session-only gallery

## Required Vercel environment variables
Add these in Project → Settings → Environment Variables, then redeploy:

- `OPENAI_API_KEY` — secret OpenAI API key (server-side only)
- `OPENAI_CHAT_MODEL` — optional; defaults to `gpt-6-astra`
- `OPENAI_IMAGE_MODEL` — optional; defaults to `gpt-image-2.5-sunburst`

Image generation and editing use the OpenAI Responses/Images platform endpoints. API usage is billed separately by the provider. Some image models may require organization verification.

## Video provider
Video generation is intentionally provider-neutral. Set:
- `VIDEO_PROVIDER_URL` — provider's create-job endpoint
- `VIDEO_PROVIDER_API_KEY` — provider API key

The current adapter sends JSON `{ prompt, image_url? }` with Bearer authentication and recognizes `video_url`, `output_url`, or `url` in the response. Many providers use asynchronous job polling and different schemas; adapt `api/video.js` to the selected provider before enabling production video jobs.

## Production work still required
- Configure the secrets above in Vercel; never commit API keys.
- Confirm the OpenAI API project has billing and access to the selected models.
- Add authentication, per-user authorization, request quotas, abuse controls, and rate limiting before public launch.
- Add durable object storage and a database for persistent galleries and user accounts.
- Implement payment checkout/webhooks and admin authorization before accepting payments.
- Configure provider-specific video job polling and storage.
- Run a production test suite and resolve the existing Vercel 403 team/project authorization issue.

The browser never receives provider API keys. Do not add secrets to HTML, JavaScript bundles, or Git.
