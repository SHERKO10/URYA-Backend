import crypto from 'crypto';

export const getAdminConfig = () => {
  const username = process.env.ADMIN_USERNAME || '';
  const password = process.env.ADMIN_PASSWORD || '';
  const apiKey = process.env.ADMIN_API_KEY || '';
  return { username, password, apiKey };
};

export const isAdminConfigReady = () => {
  const { username, password, apiKey } = getAdminConfig();
  return Boolean(username && password && apiKey);
};

export const generateAdminToken = () => {
  const { username, password, apiKey } = getAdminConfig();
  if (!username || !password || !apiKey) return '';
  const raw = `${username}:${password}:${apiKey}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return `adm_${hash}`;
};

export const validateAdminCredentials = (username, password, apiKey) => {
  const conf = getAdminConfig();
  return (
    username === conf.username &&
    password === conf.password &&
    apiKey === conf.apiKey
  );
};

export const isAuthorizedAdminRequest = (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;

  const { apiKey } = getAdminConfig();
  const adminToken = generateAdminToken();
  return token === apiKey || token === adminToken;
};

