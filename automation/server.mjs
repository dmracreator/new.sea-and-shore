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
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*' });
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
  return { subject, html: `<p>Dear ${text(lead.name)},</p><p>Thank you for contacting Sea and Shore Services.</p><p>${detail}</p><p>For urgent support, call +31 (0)10 409 01 30.</p><p>Kind regards,<br>Sea and Shore Services</p>` };
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
