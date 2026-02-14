// Placeholder API config — replace with real keys when available
const API_CONFIG = {
  form: {
    provider: 'formspree',
    endpoint: 'https://formspree.io/f/xxxxxx'
  },
  newsletter: {
    provider: 'mailchimp',
    actionUrl: 'https://example.us1.list-manage.com/subscribe/post?u=xxxx&id=xxxx'
  },
  map: {
    provider: 'mapbox',
    apiKey: 'pk.XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    style: 'mapbox/streets-v12',
    center: [2.3522, 48.8566],
    zoom: 12
  },
  analytics: {
    provider: 'plausible',
    domain: 'starlabimpact.org'
  },
  news: {
    provider: 'rss',
    feedUrl: 'https://medium.com/feed/@starlabimpact'
  },
  crm: {
    provider: 'hubspot',
    portalId: '0000000',
    formId: '00000000-0000-0000-0000-000000000000'
  }
};
