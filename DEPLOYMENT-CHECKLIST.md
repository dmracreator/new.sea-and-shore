# Parallel launch checklist

## 1. Keep the live Wix website unchanged

Leave `www.sea-and-shore.com` on Wix while the replacement is reviewed. Build and test the new site on `new.sea-and-shore.com`.

## 2. Put the new site in its own GitHub repository

Create a private repository, then publish the website files and `assets/`. Do **not** upload `Application Files (important)/`, any `.env` file, key file, or `automation/data/`.

## 3. Publish the static website

Use GitHub Pages for the static pages. In GitHub Pages, choose the deployment branch and add the custom domain `new.sea-and-shore.com`.

## 4. Add the DNS record at Hostnet

Ask UNO/Hostnet to add only the DNS record GitHub Pages provides for `new.sea-and-shore.com`. This does not move or interrupt the existing Wix website.

## 5. Solve the Myfreight DNS record separately

Ask UNO to confirm that the active DNS zone has a valid A, AAAA, or MX record for `mail.myfreight.sea-and-shore.com`, as requested by the bounce. This is independent of the new website.

## 6. Activate the lead agent only after email verification

Deploy `automation/server.mjs` to a separate server with persistent storage. Configure its environment values from `automation/.env.example`, verify `info@sea-and-shore.com` with the mail provider, and set the final service URL as `window.LEAD_AGENT_URL` on the website.

Start with the immediate confirmations and internal research. Send a quote request to an internal mailbox first. Only then enable the daily seven-day follow-up schedule.

## 7. Move the main website

After content review, form tests and SEO redirect planning, point `www.sea-and-shore.com` from Wix to the new site. Keep Wix online until the change is confirmed.
