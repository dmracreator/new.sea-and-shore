# Sea and Shore lead agent

This small Node.js service handles quote and contact leads.

- Sends an immediate acknowledgement after a quote or contact form.
- Schedules one booking follow-up, seven days after a quote request.
- Produces an internal AI research brief from public information when an OpenAI API key is configured.
- Does not send AI-written content automatically.

## Setup

1. Copy `.env.example` to your deployment platform's environment settings.
2. Verify `MAIL_FROM` in Resend and configure `RESEND_API_KEY`.
3. Configure the site to call the deployed service URL through `window.LEAD_AGENT_URL`.
4. Schedule a daily POST to `/api/run-follow-ups` with `Authorization: Bearer <CRON_SECRET>`.

Run locally with `node --env-file=.env server.mjs`.

The lead store is a JSON file for a small initial deployment. Move it to a managed database before running more than one service instance.
