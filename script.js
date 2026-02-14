// Mobile navigation toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const config = window.API_CONFIG || {};

// Contact form
const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('.form-status');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      contactStatus.textContent = 'Merci de remplir tous les champs requis.';
      return;
    }

    if (!isValidEmail(email)) {
      contactStatus.textContent = 'Veuillez entrer un email valide.';
      return;
    }

    const formConfig = config.form || {};
    if (!formConfig.endpoint) {
      contactStatus.textContent = 'Merci ! Votre message a bien été envoyé.';
      contactForm.reset();
      return;
    }

    try {
      contactStatus.textContent = 'Envoi en cours...';
      const response = await fetch(formConfig.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });

      if (!response.ok) throw new Error('form_error');

      contactStatus.textContent = 'Merci ! Votre message a bien été envoyé.';
      contactForm.reset();
    } catch {
      contactStatus.textContent = 'Envoi impossible pour le moment. Réessayez plus tard.';
    }
  });
}

// Newsletter
const newsletterForm = document.querySelector('#newsletter-form');
const newsletterStatus = document.querySelector('.newsletter-status');

if (newsletterForm && newsletterStatus) {
  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = String(new FormData(newsletterForm).get('email') || '').trim();
    if (!isValidEmail(email)) {
      newsletterStatus.textContent = 'Veuillez entrer un email valide.';
      return;
    }

    const newsletterConfig = config.newsletter || {};
    if (!newsletterConfig.actionUrl) {
      newsletterStatus.textContent = 'Inscription réussie.';
      newsletterForm.reset();
      return;
    }

    try {
      newsletterStatus.textContent = 'Inscription en cours...';

      const fieldName = newsletterConfig.fieldName || 'EMAIL';
      const payload = new URLSearchParams();
      payload.set(fieldName, email);

      await fetch(newsletterConfig.actionUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
      });

      newsletterStatus.textContent = 'Merci, votre demande est prise en compte.';
      newsletterForm.reset();
    } catch {
      newsletterStatus.textContent = 'Inscription impossible pour le moment.';
    }
  });
}

// RSS news
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadNews() {
  const feed = document.querySelector('#news-feed');
  if (!feed) return;

  const newsConfig = config.news || {};
  if (!newsConfig.feedUrl) {
    feed.innerHTML = '<li>Flux RSS non configuré.</li>';
    return;
  }

  try {
    const proxyBase = newsConfig.rssToJsonUrl || 'https://api.rss2json.com/v1/api.json?rss_url=';
    const url = `${proxyBase}${encodeURIComponent(newsConfig.feedUrl)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('rss_error');

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items.slice(0, 5) : [];

    if (!items.length) {
      feed.innerHTML = '<li>Aucune actualité disponible.</li>';
      return;
    }

    feed.innerHTML = items
      .map((item) => {
        const title = escapeHtml(item.title || 'Actualité');
        const link = escapeHtml(item.link || '#');
        const date = formatDate(item.pubDate);
        const label = date ? `${title} - ${date}` : title;
        return `<li><a href="${link}" target="_blank" rel="noopener">${label}</a></li>`;
      })
      .join('');
  } catch {
    feed.innerHTML = '<li>Impossible de charger les actualités.</li>';
  }
}

loadNews();

// Map
function loadExternalCss(href) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[data-src="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.src = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error('css_error'));
    document.head.appendChild(link);
  });
}

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === '1') {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('script_error')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.src = src;
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => reject(new Error('script_error'));
    document.head.appendChild(script);
  });
}

async function initMap() {
  const mapElement = document.querySelector('#map');
  if (!mapElement) return;

  const mapConfig = config.map || {};
  const center = Array.isArray(mapConfig.center) && mapConfig.center.length === 2
    ? [Number(mapConfig.center[1]), Number(mapConfig.center[0])]
    : [48.8566, 2.3522];
  const zoom = Number(mapConfig.zoom || 12);

  try {
    await loadExternalCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    await loadExternalScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');

    if (!window.L) throw new Error('leaflet_missing');

    mapElement.innerHTML = '';
    const map = window.L.map(mapElement).setView(center, zoom);

    const isMapbox = mapConfig.provider === 'mapbox' && mapConfig.apiKey;
    if (isMapbox) {
      const style = mapConfig.style || 'mapbox/streets-v12';
      window.L.tileLayer(
        `https://api.mapbox.com/styles/v1/${style}/tiles/{z}/{x}/{y}?access_token=${mapConfig.apiKey}`,
        {
          tileSize: 512,
          zoomOffset: -1,
          attribution: '&copy; OpenStreetMap contributors &copy; Mapbox'
        }
      ).addTo(map);
    } else {
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }

    const markerLabel = mapConfig.markerLabel || 'Starlab Impact';
    window.L.marker(center).addTo(map).bindPopup(markerLabel);
  } catch {
    mapElement.innerHTML = '<p>Carte indisponible pour le moment.</p>';
  }
}

initMap();

// Analytics
function initAnalytics() {
  const analyticsConfig = config.analytics || {};
  if (!analyticsConfig.provider) return;

  if (analyticsConfig.provider === 'plausible' && analyticsConfig.domain) {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = analyticsConfig.domain;
    script.src = analyticsConfig.scriptSrc || 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
    return;
  }

  if (analyticsConfig.provider === 'ga4' && analyticsConfig.measurementId) {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.measurementId}`;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', analyticsConfig.measurementId);
  }
}

initAnalytics();

// Simple gallery carousel for small screens
const gallery = document.querySelector('.gallery');
const galleryItems = gallery ? Array.from(gallery.querySelectorAll('article')) : [];
const prevBtn = document.querySelector('.gallery-prev');
const nextBtn = document.querySelector('.gallery-next');
const dots = Array.from(document.querySelectorAll('.gallery-dots .dot'));
let galleryIndex = 0;

function updateGallery() {
  if (!galleryItems.length) return;

  galleryItems.forEach((item, index) => {
    item.classList.toggle('is-active', index === galleryIndex);
  });

  dots.forEach((dot, index) => {
    const active = index === galleryIndex;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-selected', String(active));
  });
}

if (galleryItems.length) {
  updateGallery();
}

if (prevBtn && nextBtn && galleryItems.length) {
  prevBtn.addEventListener('click', () => {
    galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
    updateGallery();
  });

  nextBtn.addEventListener('click', () => {
    galleryIndex = (galleryIndex + 1) % galleryItems.length;
    updateGallery();
  });
}

if (dots.length && galleryItems.length) {
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      galleryIndex = index;
      updateGallery();
    });
  });
}

// Reveal-on-scroll animations
const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// Chat AI widget
const chatFab = document.querySelector('#chat-fab');
const chatPanel = document.querySelector('#chat-panel');
const chatClose = document.querySelector('#chat-close');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-text');
const chatMessages = document.querySelector('#chat-messages');
const chatStatus = document.querySelector('#chat-status');

const chatEndpoint = config.chatEndpoint || 'http://localhost:3001/api/chat';
const chatHistoryKey = 'starlab_chat_history';
const chatTypingSpeed = 18;

function toggleChat(open) {
  if (!chatFab || !chatPanel) return;

  chatPanel.classList.toggle('open', open);
  chatPanel.setAttribute('aria-hidden', String(!open));
  chatFab.setAttribute('aria-expanded', String(open));

  if (open && chatInput) {
    chatInput.focus();
  }
}

if (chatFab) {
  chatFab.addEventListener('click', () => toggleChat(true));
}

if (chatClose) {
  chatClose.addEventListener('click', () => toggleChat(false));
}

function addChatMessage(text, role) {
  if (!chatMessages) return;

  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function loadChatHistory() {
  try {
    const raw = sessionStorage.getItem(chatHistoryKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChatHistory(history) {
  sessionStorage.setItem(chatHistoryKey, JSON.stringify(history.slice(-12)));
}

async function typeBotMessage(text) {
  if (!chatMessages) return;

  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.textContent = '';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  for (let i = 0; i < text.length; i += 1) {
    div.textContent += text[i];
    await new Promise((resolve) => setTimeout(resolve, chatTypingSpeed));
  }
}

async function sendChatMessage(message) {
  if (!chatStatus) return;

  try {
    chatStatus.textContent = 'Connexion au serveur AI...';

    const history = loadChatHistory();
    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, messages: history })
    });

    if (response.status === 429) throw new Error('rate_limited');
    if (!response.ok) throw new Error('api_error');

    const data = await response.json();
    const reply = data.reply || 'Réponse indisponible.';

    await typeBotMessage(reply);
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: reply });
    saveChatHistory(history);
    chatStatus.textContent = '';
  } catch (error) {
    chatStatus.textContent = error.message === 'rate_limited'
      ? 'Trop de requêtes. Réessayez dans une minute.'
      : 'Le serveur AI est indisponible. Lancez le backend.';
  }
}

const existingHistory = loadChatHistory();
if (existingHistory.length && chatMessages) {
  chatMessages.innerHTML = '';
  existingHistory.forEach((entry) => {
    addChatMessage(entry.content, entry.role === 'assistant' ? 'bot' : 'user');
  });
}

if (chatForm && chatInput) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    chatInput.value = '';
    sendChatMessage(text);
  });
}
