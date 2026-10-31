# ØĞMÛŠKŶ AI Studio — Vercel setup

Static HTML with Vercel Node serverless functions.

## Features
- AI Agent: /api/agent
- AI website source generation: /api/website
- Image generation and editing: /api/images, /api/edit
- Video generation: /api/video
- Consent-gated talking avatar adapter: /api/clone
- Supabase auth config: /api/config
- Authenticated Stripe subscription checkout: /api/checkout

## Environment variables
OpenAI: OPENAI_API_KEY (required), OPENAI_CHAT_MODEL (optional), OPENAI_IMAGE_MODEL (optional).
Video: VIDEO_PROVIDER_URL, VIDEO_PROVIDER_API_KEY.
Avatar: CLONE_PROVIDER_URL, CLONE_PROVIDER_API_KEY.
Supabase: SUPABASE_URL, SUPABASE_ANON_KEY.
Stripe: STRIPE_SECRET_KEY, STRIPE_CREATOR_PRICE_ID, STRIPE_PRO_PRICE_ID, SITE_URL.

Configure secrets in Vercel only; never commit API keys. Supabase signup/sign-in is included in the studio. Configure email confirmation, password policy and redirect URLs in Supabase. Add database tables, Row Level Security, durable project storage and per-user quotas before public launch.

Create recurring Stripe prices. Checkout verifies the Supabase access token before creating a subscription session. Before granting paid entitlements, implement signed Stripe webhook verification for checkout.session.completed, customer.subscription.updated/deleted and invoice.payment_failed, persist subscription state against the Supabase user, and enforce entitlements server-side in every API route. Client-side plan labels are not authorization.

The video and avatar adapters are provider-neutral. Adapt request/response fields and implement async job polling for your selected provider. Require explicit permission for any likeness or voice use.

AI usage is billed by connected providers. Account auth, checkout session creation and generation endpoints require configured credentials; durable project sync, payment webhooks, subscription enforcement and production rate limiting remain separate deployment tasks.