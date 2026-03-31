import express from 'express';
import {
  isAdminConfigReady,
  validateAdminCredentials,
  generateAdminToken,
} from '../utils/adminAuth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  if (!isAdminConfigReady()) {
    return res.status(500).json({
      message:
        'ADMIN_USERNAME, ADMIN_PASSWORD et ADMIN_API_KEY doivent etre configures.',
    });
  }

  const { username, password, apiKey } = req.body || {};

  if (!username || !password || !apiKey) {
    return res.status(400).json({
      message: 'username, password et apiKey sont requis.',
    });
  }

  const ok = validateAdminCredentials(username, password, apiKey);
  if (!ok) {
    return res.status(401).json({ message: 'Identifiants admin invalides.' });
  }

  const token = generateAdminToken();
  return res.json({ token });
});

export default router;

