window.API_CONFIG = {
  form: {
    provider: 'formspree',
    endpoint: 'https://formspree.io/f/xxxxxx'
  },
  newsletter: {
    provider: 'mailchimp',
    actionUrl: 'https://example.us1.list-manage.com/subscribe/post?u=xxxx&id=xxxx',
    fieldName: 'EMAIL'
  },
  map: {
    provider: 'mapbox',
    apiKey: 'R3Pvs2sTgUaKXBMi6vQI',
    style: 'mapbox/streets-v12',
    center: [-17.216, 14.7167],
    zoom: 11,
    markerLabel: 'Starlab Impact - Diamniadio'
  },
  analytics: {
    provider: 'plausible',
    domain: 'starlabimpact.org',
    scriptSrc: 'https://plausible.io/js/script.js'
  },
  news: {
    provider: 'rss',
    feedUrl: 'https://medium.com/feed/@starlabimpact',
    rssToJsonUrl: 'https://api.rss2json.com/v1/api.json?rss_url='
  },
  chatEndpoint: 'http://localhost:3001/api/chat'
};
