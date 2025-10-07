// URL configuration for different environments
export const URLS = {
  // Production URLs
  PRODUCTION: {
    APP_URL: 'https://applydash.pacoal.dev',
    PORTFOLIO_URL: 'https://www.pacoal.dev',
    DEVELOPER_URL: 'https://www.pacoal.dev',
  },
  
  // Development URLs
  DEVELOPMENT: {
    APP_URL: 'http://localhost:3000',
    PORTFOLIO_URL: 'https://www.pacoal.dev',
    DEVELOPER_URL: 'https://www.pacoal.dev',
  }
};

// Get current environment URLs
export function getCurrentUrls() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? URLS.PRODUCTION : URLS.DEVELOPMENT;
}

// Get the base URL for the current environment
export function getBaseUrl() {
  const urls = getCurrentUrls();
  return urls.APP_URL;
}

// Get developer portfolio URL
export function getDeveloperUrl() {
  const urls = getCurrentUrls();
  return urls.DEVELOPER_URL;
}