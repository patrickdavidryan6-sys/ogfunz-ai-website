# ØĞMÛŠKŶ Integrations

The homepage includes an **Integrations & Developer Tools** directory with official product/documentation links. This document is the implementation checklist for enabling live server-side connections.

## Important status

The directory is published in the website source. No provider is marked as connected until credentials, account authorization, backend handlers, and a successful health check exist. The current homepage is static; it cannot safely store provider secrets or execute private API calls in the browser.

## Provider setup matrix

| Provider | Intended website feature | Secret/configuration (server-side only) | Official starting point |
|---|---|---|---|
| Hugging Face | Model inference for agent and creative workflows | `HF_TOKEN`, model/provider selection | https://huggingface.co/docs/inference-providers |
| Tavily | Search/research retrieval for the AI agent | `TAVILY_API_KEY` | https://docs.tavily.com/ |
| Cloudflare | Workers, R2/KV/D1 and edge services | Scoped `CLOUDFLARE_API_TOKEN`, account/zone IDs as required | https://developers.cloudflare.com/ |
| MagicPath | Design/prototype handoff | Confirm supported workspace authorization/API for the account; do not assume an undocumented endpoint | https://www.magicpath.ai/documentation |
| GitHub | Repository authorization and project operations | GitHub App ID, private key, installation ID or OAuth app credentials | https://docs.github.com/en/apps |
| Platform Bridge | Provider not yet uniquely identified | Do not configure until the exact vendor/product, API base URL and authentication scheme are confirmed | Pending |
| Runpod Official | GPU pod/serverless endpoint orchestration | `RUNPOD_API_KEY` | https://docs.runpod.io/ |
| MiniUp | Account API, published site and app-data operations | Scoped `MINIUP_API_KEY` / OAuth credentials and resource-specific endpoint | https://www.miniup.io/docs/reference/account-api |
| Postman | Collection/environment automation and API testing | `POSTMAN_API_KEY` | https://learning.postman.com/api-docs/api-reference |
| OpenAI Plugin Creator | GPT/tool authoring workflow | Account-level access; confirm the intended Plugin Creator product and supported API before automating | https://chatgpt.com/gpts/editor |
| OpenAI Ads Conversions | Server-side conversion event reporting | `OPENAI_ADS_API_KEY`, `OPENAI_CONVERSIONS_API_KEY`, `OPENAI_ADS_PIXEL_ID` | https://developers.openai.com/ads/conversions-api |

## Required backend design

1. Keep every provider key in the hosting provider's encrypted environment/secret manager. Never expose secrets through frontend JavaScript, public config endpoints, source control, logs, or browser storage.
2. Add one server-side adapter per provider under a dedicated integration module. Each adapter should validate input, enforce user authorization, apply timeouts/rate limits, and return a normalized response.
3. Add an authenticated `GET /api/integrations/status` endpoint that reports only configured/connected booleans and safe provider metadata — never secret values.
4. Add an admin-only connection test for each provider. A key being present is not proof that the provider account, permissions, billing, or endpoint works.
5. Record minimal audit metadata and provider request IDs. Do not log prompts, access tokens, raw customer identifiers, or full conversion payloads.
6. Add explicit user consent and privacy controls before transmitting personal data to external providers.

## OpenAI Ads Conversions implementation notes

- Send conversion events from the server, not directly from browser code.
- Provision a Pixel ID and a Conversions API key in the relevant OpenAI Ads account.
- Send requests to the official Conversions API endpoint documented by OpenAI, using the Pixel ID and server-side key.
- Use a stable event ID and reuse it for browser/server copies of the same conversion so duplicate events can be deduplicated.
- Send only supported event types and the minimum permitted data. Hash normalized personal identifiers before sending; honor consent and opt-out choices.
- Test with validation mode before production event delivery.
- Keep the Ads management key separate from the Conversions API event key.

Official references:
- https://developers.openai.com/ads/conversions-api
- https://developers.openai.com/ads/conversion-tracking
- https://developers.openai.com/ads/api-reference/conversion-setup

## What is still needed to activate live connections

- Confirm the exact **Platform Bridge** product/vendor.
- Confirm whether “Plugin Creator” means the OpenAI GPT editor or another Plugin Creator service.
- Configure the provider credentials above in the production host's secret manager.
- Identify the intended features for each provider (for example, Hugging Face inference models, Tavily search, Cloudflare deployment, Runpod GPU jobs, MiniUp site/data APIs, and Postman collection automation).
- Deploy the backend adapters and verify each provider's connection test.

Do not paste API keys into chat or commit them to this repository. Add them directly to the hosting provider's secret settings.
