import express from 'express';
import {
  getAllReviews,
  getReviewsByProject,
  getAverageStats,
  createReview,
  deleteReview,
} from '../models/Review.js';
import {
  isAdminConfigReady,
  isAuthorizedAdminRequest,
} from '../utils/adminAuth.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (!isAdminConfigReady()) {
    return res
      .status(500)
      .json({
        message:
          'ADMIN_USERNAME, ADMIN_PASSWORD et ADMIN_API_KEY doivent etre configures.',
      });
  }

  if (!isAuthorizedAdminRequest(req)) {
    return res.status(401).json({ message: 'Accès administrateur requis' });
  }

  return next();
};

router.get('/', (req, res) => {
  try {
    const reviews = getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/project/:projectId', (req, res) => {
  try {
    const reviews = getReviewsByProject(Number(req.params.projectId));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/average', (req, res) => {
  try {
    const stats = getAverageStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const newReview = createReview(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const deleted = deleteReview(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
