const fallbackNews = [
  { title: 'International container shipping news is updating.', url: 'https://www.gdeltproject.org/' },
  { title: 'Follow route changes, capacity and port developments.', url: 'insights.html' },
  { title: 'Need help planning a shipment? Talk to our operations team.', url: 'contact.html' }
];
const cacheKey = 'sea-and-shore-container-news-v1';
const cacheAge = 24 * 60 * 60 * 1000;
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="enhancements.css">');
const footer = `<div class="wrap footer-grid"><div><div class="footer-logo">SEA AND SHORE</div><p class="footer-copy">International freight coordination, customs support and warehousing from Rotterdam — connected worldwide.</p></div><div><div class="mono">Explore</div><a href="services.html">Services</a><a href="insights.html">Insights</a><a href="quote.html">Request a quote</a><a href="contact.html">Contact</a></div><div><div class="mono">Contact</div><p>Westfrankelandsedijk 1<br>3115 HG Schiedam</p><a href="tel:+31104090130">+31 (0)10 409 01 30</a><a href="mailto:info@sea-and-shore.com">info@sea-and-shore.com</a></div><div><div class="mono">Partners</div><a href="https://sea-and-shore-group.com" target="_blank" rel="noreferrer">Sea and Shore Group ↗</a><a href="https://containerbooking.com" target="_blank" rel="noreferrer">Containerbooking.com ↗</a><a href="privacy.html">Privacy statement</a></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} Sea and Shore Services B.V. · KvK 50625101</span><span><a href="privacy.html">Privacy & cookies</a> · AEO certified · Available 24/7</span></div>`;

function cachedNews() {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    return cached?.at > Date.now() - cacheAge ? cached.items : null;
  } catch { return null; }
}
function saveNews(items) {
  try { localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), items })); } catch { /* storage may be unavailable */ }
}
function makeNewsBar(items) {
  const bar = document.createElement('aside');
  bar.className = 'news-bar';
  bar.setAttribute('aria-label', 'International container news');
  bar.innerHTML = '<div class="wrap news-inner"><span class="news-label">Container news</span><a class="news-story" target="_blank" rel="noreferrer"></a><div class="news-controls"><button type="button" aria-label="Previous story">←</button><span class="news-count"></span><button type="button" aria-label="Next story">→</button></div></div>';
  document.body.prepend(bar);
  let current = 0;
  const story = bar.querySelector('.news-story'), count = bar.querySelector('.news-count');
  const show = () => { const item = items[current]; story.textContent = item.title; story.href = item.url; count.textContent = `${current + 1}/${items.length}`; };
  bar.querySelectorAll('button')[0].onclick = () => { current = (current + items.length - 1) % items.length; show(); };
  bar.querySelectorAll('button')[1].onclick = () => { current = (current + 1) % items.length; show(); };
  show();
  if (items.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { current = (current + 1) % items.length; show(); }, 8000);
}
async function loadNews() {
  const cached = cachedNews();
  if (cached) return cached;
  try {
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=container%20shipping%20OR%20maritime%20freight&mode=artlist&maxrecords=6&format=json';
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    const items = (data.articles || []).filter(item => item.title && item.url).slice(0, 6).map(item => ({ title: item.title, url: item.url }));
    if (items.length) { saveNews(items); return items; }
  } catch { /* visible fallback keeps the layout useful if public news API is unavailable */ }
  return fallbackNews;
}
document.querySelectorAll('.site-footer').forEach(element => { element.innerHTML = footer; });
loadNews().then(makeNewsBar);
const revealTargets = document.querySelectorAll('main > section, .mosaic > *, .cards .card, .insights .insight, .feature, .service-block, .support, .trigger, .step, .article, .feature-story');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) revealTargets.forEach(element => element.classList.add('is-visible'));
else {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  revealTargets.forEach(element => { element.classList.add('reveal'); observer.observe(element); });
}
requestAnimationFrame(() => document.body.classList.add('is-ready'));
