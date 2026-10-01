import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = join(root, 'data', 'leads.json');
const port = Number(process.env.PORT || 8787);
const now = () => new Date().toISOString();
const dueAt = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

async function readLeads() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); } catch { return []; }
}
async function saveLeads(leads) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(leads, null, 2));
}
function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': process.env.ALLOWED_ORIGIN || 'https://dmracreator.github.io', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, authorization' });
  res.end(JSON.stringify(value));
}
function text(value = '') { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]); }
async function body(req) {
  let raw = ''; for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || '{}');
}
async function deliver({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: 'mail provider not configured' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, html })
  });
  if (!response.ok) throw new Error(`mail provider returned ${response.status}`);
  return { sent: true };
}
function confirmation(lead) {
  const subject = lead.source === 'quote' ? 'We received your quote request' : 'We received your message';
  const detail = lead.source === 'quote' ? 'Our logistics team will review the route, equipment and service requirements you shared.' : 'Our team will review your message and get back to you as soon as possible.';
  const quoteDetails = lead.source === 'quote' ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #d9e4f0;background:#fbfcfe"><tr><td style="padding:18px 20px"><p style="margin:0 0 8px;color:#2ba2dc;font:500 11px/1.2 monospace;letter-spacing:1px;text-transform:uppercase">Your shipment plan</p><p style="margin:0;color:#1a3969;font:700 16px/1.45 Arial,sans-serif">${text(lead.details?.origin || 'Origin')} → ${text(lead.details?.destination || 'Destination')}</p><p style="margin:7px 0 0;color:#526275;font:14px/1.5 Arial,sans-serif">${text(lead.details?.container || 'Container')} · ${text(lead.details?.planningEstimate || 'Our team will confirm timing and rate.')}</p></td></tr></table>` : '';
  return { subject, html: `<!doctype html><html><body style="margin:0;padding:0;background:#e8f4fc"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8f4fc"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff"><tr><td style="padding:26px 32px;background:#1a3969;color:#ffffff"><p style="margin:0;color:#8ed6fb;font:500 11px/1.2 monospace;letter-spacing:1.4px;text-transform:uppercase">Sea and Shore Services</p><h1 style="margin:12px 0 0;color:#ffffff;font:700 30px/1.08 Arial,sans-serif;letter-spacing:-.8px">${lead.source === 'quote' ? 'Your request is in motion.' : 'We received your message.'}</h1></td></tr><tr><td style="padding:32px;color:#1a3969;font:16px/1.65 Arial,sans-serif"><p style="margin:0 0 18px">Dear ${text(lead.name)},</p><p style="margin:0 0 18px">Thank you for contacting Sea and Shore Services. ${detail}</p>${quoteDetails}<p style="margin:0 0 24px">You will receive a tailored reply from our team shortly. For an urgent shipment, you can reach us directly on <a href="tel:+31104090130" style="color:#1a3969;font-weight:700">+31 (0)10 409 01 30</a>.</p><p style="margin:0;font-weight:700">Sea and Shore Services</p><p style="margin:5px 0 0;color:#526275;font-size:13px">Rotterdam · Global reach · 24/7</p></td></tr><tr><td style="padding:18px 32px;background:#fbfcfe;border-top:1px solid #d9e4f0;color:#526275;font:12px/1.5 Arial,sans-serif">International freight coordination, customs support and warehousing — one clear point of contact.</td></tr></table></td></tr></table></body></html>` };
}
function teamNotification(lead) {
  const details = Object.entries(lead.details).map(([key, value]) => `<tr><td style="padding:4px 14px 4px 0;color:#526275">${text(key)}</td><td style="padding:4px 0"><strong>${text(value)}</strong></td></tr>`).join('');
  return { subject: `New ${lead.source} request — ${text(lead.name)}`, html: `<h2>New ${text(lead.source)} request</h2><table><tr><td style="padding:4px 14px 4px 0;color:#526275">Name</td><td><strong>${text(lead.name)}</strong></td></tr><tr><td style="padding:4px 14px 4px 0;color:#526275">Email</td><td><a href="mailto:${text(lead.email)}">${text(lead.email)}</a></td></tr><tr><td style="padding:4px 14px 4px 0;color:#526275">Company</td><td>${text(lead.company || 'Not supplied')}</td></tr><tr><td style="padding:4px 14px 4px 0;color:#526275">Phone</td><td>${text(lead.phone || 'Not supplied')}</td></tr>${details}</table>` };
}
function followUp(lead) {
  return { subject: 'Ready to book your shipment?', html: `<p>Dear ${text(lead.name)},</p><p>A week ago you contacted Sea and Shore about a shipment. If you are ready for the next step, our team can help you turn your plan into a booking.</p><p>We coordinate freight, documentation and customs support through one operational contact.</p><p><a href="https://www.sea-and-shore.com/contact">Talk to our team</a> or reply to this email with your latest shipment details.</p><p>If this is no longer relevant, reply and we will not send further follow-ups.</p><p>Kind regards,<br>Sea and Shore Services</p>` };
}
async function research(lead) {
  if (!process.env.OPENAI_API_KEY) return { status: 'not_run', note: 'Set OPENAI_API_KEY to create an AI research brief.' };
  const companyDomain = lead.email.split('@')[1] || '';
  const input = `Research this business lead for a freight-forwarding sales team. Use only public information. Company: ${lead.company || 'unknown'}. Website domain: ${companyDomain}. Return a concise internal brief: likely sector, public locations, likely logistics needs, and three useful first-call questions. Do not infer sensitive personal details or invent facts.`;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-6-astra', store: false, tools: [{ type: 'web_search' }], input })
  });
  if (!response.ok) throw new Error(`AI research returned ${response.status}`);
  const result = await response.json();
  return { status: 'ready', brief: result.output_text || 'No research brief returned.' };
}
async function addLead(payload, source) {
  const email = String(payload.email || '').trim().toLowerCase();
  const name = String(payload.name || '').trim();
  if (!email || !name || !email.includes('@')) throw new Error('A name and valid email are required.');
  const lead = { id: crypto.randomUUID(), source, name, email, company: String(payload.company || '').trim(), phone: String(payload.phone || '').trim(), details: payload.details || {}, createdAt: now(), followUpAt: source === 'quote' ? dueAt() : null, followUpSentAt: null, research: { status: 'queued' }, emailLog: [] };
  const mail = confirmation(lead); const delivery = await deliver({ to: lead.email, ...mail });
  lead.emailLog.push({ kind: 'confirmation', at: now(), ...delivery });
  const notification = await deliver({ to: process.env.QUOTE_INBOX || 'pr@sea-and-shore.com', ...teamNotification(lead) });
  lead.emailLog.push({ kind: 'team_notification', at: now(), ...notification });
  lead.research = await research(lead);
  const leads = await readLeads(); leads.push(lead); await saveLeads(leads);
  return lead;
}
async function followUps() {
  const leads = await readLeads(); const due = leads.filter(lead => lead.followUpAt && !lead.followUpSentAt && lead.followUpAt <= now());
  for (const lead of due) { const delivery = await deliver({ to: lead.email, ...followUp(lead) }); lead.emailLog.push({ kind: 'booking_follow_up', at: now(), ...delivery }); if (delivery.sent) lead.followUpSentAt = now(); }
  await saveLeads(leads); return due.length;
}
createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  try {
    if (req.method === 'POST' && req.url === '/api/quote') { const lead = await addLead(await body(req), 'quote'); return json(res, 201, { id: lead.id, received: true, confirmationSent: lead.emailLog[0]?.sent === true }); }
    if (req.method === 'POST' && req.url === '/api/contact') { const lead = await addLead(await body(req), 'contact'); return json(res, 201, { id: lead.id, received: true, confirmationSent: lead.emailLog[0]?.sent === true }); }
    if (req.method === 'POST' && req.url === '/api/run-follow-ups') { if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return json(res, 401, { error: 'unauthorized' }); return json(res, 200, { processed: await followUps() }); }
    if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true });
    return json(res, 404, { error: 'not found' });
  } catch (error) { return json(res, 400, { error: error.message }); }
}).listen(port, () => console.log(`Lead agent listening on :${port}`));
