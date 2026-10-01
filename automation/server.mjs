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
function emailShell({ eyebrow, title, content }) {
  const assetRoot = 'https://dmracreator.github.io/new.sea-and-shore/assets';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#e7f1f8;color:#1d3e71"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e7f1f8"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff"><tr><td style="padding:20px 36px;background:#ffffff"><img src="${assetRoot}/logo-header.png" width="210" alt="Sea and Shore Services" style="display:block;width:210px;max-width:100%;height:auto;border:0"></td></tr><tr><td style="background:#1d3e71"><img src="${assetRoot}/brandbook-photos/trade-lane.png" width="640" alt="International freight coordinated from Rotterdam" style="display:block;width:100%;max-width:640px;height:190px;object-fit:cover;border:0"></td></tr><tr><td style="padding:28px 36px;background:#1d3e71;color:#ffffff"><p style="margin:0;color:#37a9e1;font:700 11px/1.2 Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase">SEA AND SHORE SERVICES B.V.</p><h1 style="margin:14px 0 0;color:#ffffff;font:700 31px/1.08 Arial,sans-serif;letter-spacing:-.8px">${title}</h1></td></tr><tr><td style="padding:30px 36px;color:#425a78;font:16px/1.65 Arial,sans-serif">${content}</td></tr><tr><td style="padding:18px 36px;background:#f4f8fb;border-top:1px solid #d3e1eb;color:#5d7188;font:12px/1.55 Arial,sans-serif"><strong style="color:#1d3e71">${eyebrow}</strong><br>International freight coordination, customs support and warehousing from Rotterdam.<br><a href="https://www.sea-and-shore.com" style="color:#1d3e71">sea-and-shore.com</a> · <a href="tel:+31104090130" style="color:#1d3e71">+31 (0)10 409 01 30</a></td></tr></table></td></tr></table></body></html>`;
}
function detailsTable(details) {
  const labels = { origin: 'From', destination: 'To', container: 'Equipment', planningEstimate: 'Planning estimate', 'Cargo ready date': 'Cargo ready date', 'Shipment type': 'Shipment type', 'Container quantity': 'Containers', 'Customs support': 'Customs support', 'Door delivery': 'Door delivery', Warehousing: 'Warehousing', 'Cargo notes': 'Cargo notes' };
  const rows = Object.entries(details || {}).filter(([, value]) => value).map(([key, value]) => `<tr><td style="padding:9px 14px 9px 0;border-bottom:1px solid #dce7ef;color:#60738b;font-size:12px;vertical-align:top">${text(labels[key] || key)}</td><td style="padding:9px 0;border-bottom:1px solid #dce7ef;color:#1d3e71;font-weight:700;font-size:13px;vertical-align:top">${text(value)}</td></tr>`).join('');
  return rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;border-top:3px solid #37a9e1">${rows}</table>` : '';
}
function confirmation(lead) {
  const quote = lead.source === 'quote';
  const subject = quote ? 'We received your quote request' : 'We received your message';
  const content = quote
    ? `<p style="margin:0 0 18px">Dear ${text(lead.name)},</p><p style="margin:0 0 18px">Thank you for your quote request. Our logistics team will review the route, equipment and services you selected before confirming a live market rate and available space.</p><div style="padding:18px 20px;background:#f4f8fb;border-left:4px solid #37a9e1"><p style="margin:0;color:#1d3e71;font:700 12px/1.3 Arial,sans-serif;letter-spacing:1px;text-transform:uppercase">Your submitted shipment details</p>${detailsTable(lead.details)}</div><p style="margin:22px 0 0">Next, a Sea and Shore specialist will check the routing and carrier options, then follow up with a tailored proposal or any questions needed to complete it. If your shipment is urgent, call us directly at <a href="tel:+31104090130" style="color:#1d3e71;font-weight:700">+31 (0)10 409 01 30</a>.</p>`
    : `<p style="margin:0 0 18px">Dear ${text(lead.name)},</p><p style="margin:0 0 18px">Thank you for getting in touch. Your message is with the Sea and Shore team and will be directed to the right logistics specialist.</p><div style="padding:18px 20px;background:#f4f8fb;border-left:4px solid #37a9e1"><p style="margin:0;color:#1d3e71;font:700 12px/1.3 Arial,sans-serif;letter-spacing:1px;text-transform:uppercase">What happens next</p><p style="margin:10px 0 0">We will review your question and contact you shortly. Sea and Shore coordinates international freight, customs, documentation and warehousing from Rotterdam, with trusted partners in more than 120 countries.</p></div><p style="margin:22px 0 0">For an urgent import or export question, you can reach our operations team on <a href="tel:+31104090130" style="color:#1d3e71;font-weight:700">+31 (0)10 409 01 30</a>.</p>`;
  return { subject, html: emailShell({ eyebrow: 'Rotterdam · Global reach · 24/7', title: quote ? 'Your request is in motion.' : 'We received your message.', content }) };
}
function teamNotification(lead) {
  const details = Object.entries(lead.details).map(([key, value]) => `<tr><td style="padding:4px 14px 4px 0;color:#526275">${text(key)}</td><td style="padding:4px 0"><strong>${text(value)}</strong></td></tr>`).join('');
  return { subject: `New ${lead.source} request — ${text(lead.name)}`, html: `<h2>New ${text(lead.source)} request</h2><table><tr><td style="padding:4px 14px 4px 0;color:#526275">Name</td><td><strong>${text(lead.name)}</strong></td></tr><tr><td style="padding:4px 14px 4px 0;color:#526275">Email</td><td><a href="mailto:${text(lead.email)}">${text(lead.email)}</a></td></tr><tr><td style="padding:4px 14px 4px 0;color:#526275">Company</td><td>${text(lead.company || 'Not supplied')}</td></tr><tr><td style="padding:4px 14px 4px 0;color:#526275">Phone</td><td>${text(lead.phone || 'Not supplied')}</td></tr>${details}</table>` };
}
function followUp(lead) {
  const content = `<p style="margin:0 0 18px">Dear ${text(lead.name)},</p><p style="margin:0 0 18px">A week ago you asked Sea and Shore to look at a shipment. If the timing is right, our team can turn the plan into a confirmed booking.</p><div style="padding:18px 20px;background:#f4f8fb;border-left:4px solid #37a9e1"><p style="margin:0;color:#1d3e71;font:700 12px/1.3 Arial,sans-serif;letter-spacing:1px;text-transform:uppercase">Ready for the next step?</p><p style="margin:10px 0 0">Reply to this email with any changed cargo-ready date, equipment or delivery requirement. We will check current space, routing and the documentation needed to move forward.</p></div><p style="margin:22px 0 0"><a href="https://www.sea-and-shore.com/contact" style="display:inline-block;padding:12px 18px;background:#1d3e71;color:#ffffff;text-decoration:none;font-weight:700">Talk to our team →</a></p><p style="margin:20px 0 0;color:#60738b;font-size:13px">If this is no longer relevant, simply reply and we will not send further follow-ups.</p>`;
  return { subject: 'Ready to book your shipment?', html: emailShell({ eyebrow: 'Sea and Shore Services', title: 'Ready for the next step?', content }) };
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
