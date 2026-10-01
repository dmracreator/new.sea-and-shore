const translations = {
  nl: {
    'Services':'Diensten', 'Insights':'Kennisbank', 'News':'Nieuws', 'Contact':'Contact', 'Request a quote →':'Offerte aanvragen →', 'Request a quote':'Offerte aanvragen', 'Quote':'Offerte', 'Home':'Home',
    'Plan your shipment →':'Plan uw zending →', 'Talk to the team →':'Neem contact op →', 'Explore':'Ontdek', 'Partners':'Partners', 'Privacy statement':'Privacyverklaring', 'Privacy & cookies':'Privacy & cookies',
    'Sea freight update':'Zeevrachtupdate', 'All news →':'Alle nieuws →', 'International container news':'Internationaal containernieuws',
    'Rotterdam · Global reach · 24/7':'Rotterdam · Wereldwijd bereik · 24/7', 'One partner. Every step.':'Eén partner. Elke stap.', 'What we do':'Wat we doen', 'The Sea and Shore way':'De Sea and Shore-aanpak',
    'Sea freight':'Zeevracht', 'Air, road & rail':'Lucht, weg & spoor', 'Special cargo':'Speciale lading', 'Customs clearance':'Douaneafhandeling', 'Documentation':'Documentatie', 'Warehousing':'Opslag',
    'Answers before you need them.':'Antwoorden vóór u ze nodig hebt.', 'Basics':'Basis', 'Volume':'Volume', 'Cost':'Kosten', 'Read →':'Lees →', 'Open the knowledge area →':'Open de kennisbank →',
    'Regular contact':'Regulier contact', 'Urgent service':'Spoedservice', 'Our Rotterdam office':'Ons kantoor in Rotterdam', 'Available 24/7':'24/7 bereikbaar', 'Company video':'Bedrijfsvideo', 'See how we work.':'Zie hoe we werken.',
    'Quote planner':'Offerteplanner', 'Shipment details':'Zendinggegevens', 'Planning estimate':'Planningsinschatting', 'Send quote request →':'Offerteaanvraag versturen →',
    'Instant route planner':'Directe routeplanner', 'Plan your route.':'Plan uw route.', 'From':'Van', 'To':'Naar', 'Container':'Container', 'Work email':'Zakelijk e-mailadres', 'Name':'Naam', 'Email this estimate →':'Stuur deze inschatting →',
    'Your shipment plan':'Uw zendingplan', 'Ocean transit':'Transittijd over zee', 'Port-to-port estimate':'Haven-tot-haven-inschatting', 'Select a port':'Kies een haven', 'Select two different ports for a planning estimate.':'Kies twee verschillende havens voor een planningsinschatting.',
    'FCL':'FCL', 'Latest developments from Sea and Shore.':'Laatste ontwikkelingen van Sea and Shore.', 'Knowledge for clearer decisions.':'Kennis voor heldere beslissingen.'
  },
  de: {
    'Services':'Leistungen', 'Insights':'Wissen', 'News':'News', 'Contact':'Kontakt', 'Request a quote →':'Angebot anfragen →', 'Request a quote':'Angebot anfragen', 'Quote':'Angebot', 'Home':'Startseite',
    'Plan your shipment →':'Sendung planen →', 'Talk to the team →':'Team kontaktieren →', 'Explore':'Entdecken', 'Partners':'Partner', 'Privacy statement':'Datenschutzerklärung', 'Privacy & cookies':'Datenschutz & Cookies',
    'Sea freight update':'Seefracht-Update', 'All news →':'Alle News →', 'International container news':'Internationale Container-News',
    'Rotterdam · Global reach · 24/7':'Rotterdam · Weltweit vernetzt · 24/7', 'One partner. Every step.':'Ein Partner. Jeder Schritt.', 'What we do':'Unsere Leistungen', 'The Sea and Shore way':'Die Sea-and-Shore-Methode',
    'Sea freight':'Seefracht', 'Air, road & rail':'Luft, Straße & Schiene', 'Special cargo':'Spezialladung', 'Customs clearance':'Zollabfertigung', 'Documentation':'Dokumentation', 'Warehousing':'Lagerung',
    'Answers before you need them.':'Antworten, bevor Sie sie brauchen.', 'Basics':'Grundlagen', 'Volume':'Volumen', 'Cost':'Kosten', 'Read →':'Lesen →', 'Open the knowledge area →':'Wissensbereich öffnen →',
    'Regular contact':'Allgemeiner Kontakt', 'Urgent service':'Dringende Hilfe', 'Our Rotterdam office':'Unser Büro in Rotterdam', 'Available 24/7':'24/7 erreichbar', 'Company video':'Unternehmensvideo', 'See how we work.':'So arbeiten wir.',
    'Quote planner':'Angebotsplaner', 'Shipment details':'Sendungsdetails', 'Planning estimate':'Planungsschätzung', 'Send quote request →':'Angebotsanfrage senden →',
    'Instant route planner':'Direkter Routenplaner', 'Plan your route.':'Route planen.', 'From':'Von', 'To':'Nach', 'Container':'Container', 'Work email':'Geschäftliche E-Mail', 'Name':'Name', 'Email this estimate →':'Schätzung senden →',
    'Your shipment plan':'Ihr Sendungsplan', 'Ocean transit':'Seetransitzeit', 'Port-to-port estimate':'Hafen-zu-Hafen-Schätzung', 'Select a port':'Hafen auswählen', 'Select two different ports for a planning estimate.':'Wählen Sie zwei verschiedene Häfen für eine Planungsschätzung.',
    'FCL':'FCL', 'Latest developments from Sea and Shore.':'Aktuelle Entwicklungen bei Sea and Shore.', 'Knowledge for clearer decisions.':'Wissen für klare Entscheidungen.'
  }
};

const pageCopy = {
  index: {
    nl: { hero: 'Logistiek,<br><em>helder</em> geregeld.', intro: 'Wij coördineren internationaal transport, documentatie en douane zodat uw lading op de juiste plek komt — zonder onnodige complexiteit.', logistics: 'Logistiek die<br>uw bedrijf vooruitbrengt.', proof: 'Persoonlijke service, gedragen door een wereldwijd netwerk.' },
    de: { hero: 'Lieferkette,<br><em>klar</em> geregelt.', intro: 'Wir koordinieren internationale Fracht, Dokumentation und Zoll, damit Ihre Ware ankommt — ohne unnötige Komplexität.', logistics: 'Logistik, die<br>Ihr Unternehmen voranbringt.', proof: 'Persönlicher Service, gestützt durch ein globales Netzwerk.' }
  },
  services: {
    nl: { title: 'Logistiek die<br>vooruitgang mogelijk maakt.', lead: 'Van een enkele container tot een complexe internationale supply chain: één team houdt overzicht, tempo en communicatie helder.' },
    de: { title: 'Logistik, die<br>Fortschritt möglich macht.', lead: 'Vom einzelnen Container bis zur komplexen internationalen Lieferkette: Ein Team sorgt für Übersicht, Tempo und klare Kommunikation.' }
  },
  insights: {
    nl: { title: 'Kennis die<br>uw zending vooruithelpt.', lead: 'Praktische uitleg over zeevracht, documentatie, douane en kosten — geschreven door de mensen die de zendingen behandelen.' },
    de: { title: 'Wissen, das<br>Ihre Sendung weiterbringt.', lead: 'Praktische Informationen zu Seefracht, Dokumentation, Zoll und Kosten — von den Menschen, die Ihre Sendungen betreuen.' }
  },
  news: {
    nl: { title: 'Nieuws uit<br>onze wereld.', lead: 'Ontwikkelingen bij Sea and Shore en de routes, havens en markten die uw logistiek beïnvloeden.' },
    de: { title: 'Neuigkeiten aus<br>unserer Welt.', lead: 'Entwicklungen bei Sea and Shore sowie zu Routen, Häfen und Märkten, die Ihre Logistik beeinflussen.' }
  },
  contact: {
    nl: { title: 'Spreek met een<br>logistiek specialist.', lead: 'Voor een offerte, een urgente verzendvraag of een praktisch gesprek over uw supply chain: neem direct contact op met ons team.' },
    de: { title: 'Sprechen Sie mit einem<br>Logistikspezialisten.', lead: 'Für ein Angebot, eine dringende Versandfrage oder ein praktisches Gespräch über Ihre Lieferkette: Kontaktieren Sie unser Team direkt.' }
  },
  quote: {
    nl: { title: 'Geef uw zending<br>een helder vertrekpunt.', lead: 'Maak een planningsinschatting voor een volle container en stuur uw gegevens naar ons team voor een actuele offerte.' },
    de: { title: 'Geben Sie Ihrer Sendung<br>einen klaren Startpunkt.', lead: 'Erstellen Sie eine Planungsschätzung für eine volle Containerladung und senden Sie die Details für ein aktuelles Angebot an unser Team.' }
  }
};

const langNames = { en: 'EN', nl: 'NL', de: 'DE' };
const page = location.pathname.split('/').pop()?.replace('.html', '') || 'index';
const requested = new URLSearchParams(location.search).get('lang');
let language = ['en', 'nl', 'de'].includes(requested) ? requested : localStorage.getItem('sea-and-shore-language') || 'en';

function replaceTextNodes(dictionary) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode(node) {
    return node.parentElement && !['SCRIPT', 'STYLE', 'OPTION'].includes(node.parentElement.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }});
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => { const key = node.nodeValue.trim(); if (dictionary[key]) node.nodeValue = node.nodeValue.replace(key, dictionary[key]); });
}

function applyPageCopy(copy) {
  if (!copy) return;
  const hero = document.querySelector('.hero-copy h1, .page-hero h1');
  const intro = document.querySelector('.hero-copy > p, .page-hero p');
  if (hero && copy.title || hero && copy.hero) hero.innerHTML = copy.title || copy.hero;
  if (intro && copy.lead || intro && copy.intro) intro.textContent = copy.lead || copy.intro;
  if (page === 'index') {
    const heading = document.querySelector('.section-head h2'); if (heading && copy.logistics) heading.innerHTML = copy.logistics;
    const proof = document.querySelector('.proof-copy h2'); if (proof && copy.proof) proof.textContent = copy.proof;
  }
}

function addSwitcher() {
  if (document.querySelector('.language-row')) return;
  document.querySelectorAll('.site-header').forEach(header => {
    const wrap = document.createElement('details'); wrap.className = 'language-switch';
    wrap.innerHTML = `<summary aria-label="Website language">${langNames[language]}</summary><div class="language-menu">${Object.entries(langNames).map(([code, name]) => `<a href="?lang=${code}" data-language="${code}"${code === language ? ' aria-current="true"' : ''}>${name}</a>`).join('')}</div>`;
    wrap.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', () => localStorage.setItem('sea-and-shore-language', link.dataset.language)));
    const row = document.createElement('div'); row.className = 'language-row';
    const rowWrap = document.createElement('div'); rowWrap.className = 'wrap'; rowWrap.append(wrap); row.append(rowWrap);
    document.querySelector('main')?.before(row);
  });
}

function translate() {
  document.documentElement.lang = language;
  addSwitcher();
  if (language === 'en') return;
  const dictionary = translations[language];
  replaceTextNodes(dictionary);
  applyPageCopy(pageCopy[page]?.[language]);
  document.title = `${document.title.replace('Sea and Shore Services', 'Sea and Shore Services')} · ${language === 'nl' ? 'Nederlands' : 'Deutsch'}`;
}

translate();
