const fallbackNews = [
  { title: 'Peak season continues as Asian port congestion rises', url: 'https://www.seatrade-maritime.com/containers/container-peak-season-still-ongoing-port-congestion-hits-new-high' },
  { title: 'Asia–US container rates remain pressured by congestion and demand', url: 'https://www.icis.com/explore/resources/news/2026/09/11/11233064/asia-us-container-rates-mixed-remain-pressured-by-congested-asian-ports-persistent-demand/' },
  { title: 'Asia–Europe services begin a partial return through the Red Sea', url: 'https://www.freightos.com/freight-resources/freightos-global-freight-outlook-september-2026/' }
];
const cacheKey = 'sea-and-shore-container-news-v1';
const cacheAge = 24 * 60 * 60 * 1000;
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="enhancements.css">');
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="insights-extras.css">');
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="motion.css">');
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="news.css">');
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="ticker.css">');
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="news-article.css">');
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="mobile-safety.css">');
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
  bar.innerHTML = '<div class="wrap news-inner"><span class="news-label">Sea freight update</span><div class="news-track" tabindex="0" aria-label="Latest sea freight news"><div class="news-stream"></div></div><a class="news-more" href="news.html">All news →</a></div>';
  document.body.prepend(bar);
  const stream = bar.querySelector('.news-stream');
  [...items, ...items].forEach(item => {
    const link = document.createElement('a');
    link.href = item.url;
    link.target = item.url.startsWith('http') ? '_blank' : '';
    link.rel = item.url.startsWith('http') ? 'noreferrer' : '';
    link.textContent = item.title;
    stream.append(link, Object.assign(document.createElement('span'), { textContent: '•', ariaHidden: 'true' }));
  });
}
async function loadNews() {
  const cached = cachedNews();
  if (cached) return cached;
  try {
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=container%20shipping%20OR%20ocean%20freight%20OR%20sea%20freight&mode=artlist&maxrecords=10&format=json';
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    const items = (data.articles || []).filter(item => item.title && item.url).slice(0, 6).map(item => ({ title: item.title, url: item.url }));
    if (items.length) { saveNews(items); return items; }
  } catch { /* visible fallback keeps the layout useful if public news API is unavailable */ }
  return fallbackNews;
}
document.querySelectorAll('.site-footer').forEach(element => { element.innerHTML = footer; });
document.querySelectorAll('.nav').forEach(nav => {
  if (nav.querySelector('[href="news.html"]')) return;
  const link = document.createElement('a');
  link.href = 'news.html';
  link.textContent = 'News';
  nav.querySelector('a[href="contact.html"]')?.before(link);
});
document.querySelectorAll('.footer-grid').forEach(grid => {
  const insights = grid.querySelector('a[href="insights.html"]');
  if (!insights || grid.querySelector('a[href="news.html"]')) return;
  const link = document.createElement('a');
  link.href = 'news.html';
  link.textContent = 'News';
  insights.after(link);
});
loadNews().then(makeNewsBar);
// Click-to-play video: the YouTube player is only requested once the visitor asks for it.
document.querySelectorAll('[data-video]').forEach(frame => {
  const facade = frame.querySelector('.video-facade');
  if (!facade) return;
  facade.addEventListener('click', event => {
    event.preventDefault();
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${frame.dataset.video}?autoplay=1&rel=0&modestbranding=1`;
    player.title = 'Sea and Shore Services company video';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen = true;
    frame.replaceChildren(player);
    player.focus();
  });
});

const hero = document.querySelector('.hero');
if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const image = hero.querySelector('.hero-image');
  let waiting = false;
  const parallax = () => {
    waiting = false;
    const distance = Math.max(-hero.getBoundingClientRect().top, 0);
    image?.style.setProperty('--hero-image-shift', `${Math.min(distance * .12, 48)}px`);
  };
  addEventListener('scroll', () => { if (!waiting) { waiting = true; requestAnimationFrame(parallax); } }, { passive: true });
}

const revealTargets = document.querySelectorAll('main > section, .mosaic > *, .cards .card, .insights .insight, .feature, .service-block, .support, .trigger, .step, .article, .feature-story, .group-head, .group-strip, .inline-cta');

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach(element => element.classList.add('is-visible'));
} else {
  revealTargets.forEach(element => element.classList.add('reveal'));

  // Reveal anything that is in view. Driven by scroll rather than only by
  // IntersectionObserver: observer entries are delivered asynchronously, so a fast
  // scroll or a jump to an anchor can pass an element before its entry is reported.
  const reveal = () => {
    const pending = document.querySelectorAll('.reveal:not(.is-visible)');
    pending.forEach(element => {
      const box = element.getBoundingClientRect();
      if (box.top < innerHeight - 40 && box.bottom > 0) element.classList.add('is-visible');
    });
    return pending.length;
  };

  let queued = false;
  const queueReveal = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (reveal() === 0) {
        removeEventListener('scroll', queueReveal);
        removeEventListener('resize', queueReveal);
      }
    });
  };

  addEventListener('scroll', queueReveal, { passive: true });
  addEventListener('resize', queueReveal, { passive: true });
  addEventListener('load', queueReveal);
  queueReveal();
}
requestAnimationFrame(() => document.body.classList.add('is-ready'));
