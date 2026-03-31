import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createFeedback,
  getAllFeedback,
  getStats,
  getAiSummary,
  getFeedbackById,
  updateFeedbackStatus,
  reanalyse,
  deleteFeedback,
} from '../controllers/feedback.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Rate limiter — 5 submissions per IP per hour (Req 1.7)
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    data: null,
    error: 'Rate limit exceeded',
    message: 'Too many submissions. Try again later.',
  },
});

// Public routes
router.post('/', feedbackLimiter, createFeedback);

// Admin routes — specific paths MUST come before /:id
router.get('/stats', authMiddleware, getStats);
router.get('/summary', authMiddleware, getAiSummary);

router.get('/', authMiddleware, getAllFeedback);
router.get('/:id', authMiddleware, getFeedbackById);
router.patch('/:id', authMiddleware, updateFeedbackStatus);
router.post('/:id/reanalyse', authMiddleware, reanalyse);
router.delete('/:id', authMiddleware, deleteFeedback);

export default router;