import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { computeDailyAnalytics, getAllLatestAnalytics } from '../services/analyticsService.js';

const router = express.Router();

// Manually trigger analytics computation
router.post('/compute', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const result = await computeDailyAnalytics();
    res.json(result);
  } catch (error) {
    console.error('Analytics computation error:', error);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

// Get all latest analytics
router.get('/latest', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const analytics = await getAllLatestAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;