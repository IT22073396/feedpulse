import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { analyzeFeedback, generateWeeklySummary } from '../services/gemini.service';
import { sendResponse } from '../utils/response';

/* =========================================================
   CREATE FEEDBACK
========================================================= */
// POST /api/feedback
export async function createFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    // Basic sanitisation
    const sanitise = (str?: string) =>
      str?.replace(/<[^>]*>/g, '').trim() ?? undefined;

    const feedback = await Feedback.create({
      title: sanitise(title),
      description: sanitise(description),
      category,
      submitterName: sanitise(submitterName),
      submitterEmail: submitterEmail?.toLowerCase().trim(),
    });

    // AI analysis (non-blocking)
    try {
      const analysis = await analyzeFeedback(feedback.title, feedback.description);

      feedback.ai_category = analysis.category;
      feedback.ai_sentiment = analysis.sentiment;
      feedback.ai_priority = analysis.priority_score;
      feedback.ai_summary = analysis.summary;
      feedback.ai_tags = analysis.tags;
      feedback.ai_processed = true;

      await feedback.save();
    } catch (err) {
      console.error('AI analysis failed:', err);
    }

    sendResponse(res, 201, feedback, 'Feedback submitted successfully');
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      sendResponse(res, 400, null, 'Validation failed', err.message);
    } else {
      sendResponse(res, 500, null, 'Internal server error', 'Server error');
    }
  }
}

/* =========================================================
   GET ALL FEEDBACK
========================================================= */
// GET /api/feedback
export async function getAllFeedback(req: Request, res: Response): Promise<void> {
  const {
    category,
    status,
    sentiment,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    limit = '10',
  } = req.query;

  const filter: any = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (sentiment) filter.ai_sentiment = sentiment;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { ai_summary: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  }, 'Feedback retrieved successfully');
}

/* =========================================================
   GET SINGLE FEEDBACK
========================================================= */
// GET /api/feedback/:id
export async function getFeedbackById(req: Request, res: Response): Promise<void> {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    sendResponse(res, 404, null, 'Not found', 'Not found');
    return;
  }

  sendResponse(res, 200, feedback, 'Feedback retrieved successfully');
}

/* =========================================================
   UPDATE STATUS
========================================================= */
// PATCH /api/feedback/:id
export async function updateFeedbackStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body;
  const valid = ['New', 'In Review', 'Resolved'];

  if (!status || !valid.includes(status)) {
    sendResponse(res, 400, null, `Status must be one of: ${valid.join(', ')}`, 'Bad request');
    return;
  }

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!feedback) {
    sendResponse(res, 404, null, 'Not found', 'Not found');
    return;
  }

  sendResponse(res, 200, feedback, 'Status updated successfully');
}

/* =========================================================
   DELETE FEEDBACK
========================================================= */
// DELETE /api/feedback/:id
export async function deleteFeedback(req: Request, res: Response): Promise<void> {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    sendResponse(res, 404, null, 'Not found', 'Not found');
    return;
  }

  sendResponse(res, 200, null, 'Feedback deleted successfully');
}

/* =========================================================
   STATS
========================================================= */
// GET /api/feedback/stats
export async function getStats(req: Request, res: Response): Promise<void> {
  const [total, open, priorityStats, tagStats] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.countDocuments({ status: { $ne: 'Resolved' } }),
    Feedback.aggregate([
      { $match: { ai_priority: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$ai_priority' } } },
    ]),
    Feedback.aggregate([
      { $unwind: '$ai_tags' },
      { $group: { _id: '$ai_tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  sendResponse(res, 200, {
    total,
    open,
    avgPriority: priorityStats[0]?.avg
      ? Math.round(priorityStats[0].avg * 10) / 10
      : null,
    topTag: tagStats[0]?._id ?? null,
  }, 'Stats retrieved');
}

/* =========================================================
   AI SUMMARY
========================================================= */
// GET /api/feedback/summary
export async function getAiSummary(req: Request, res: Response): Promise<void> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recent = await Feedback.find({
      createdAt: { $gte: sevenDaysAgo },
      ai_processed: true,
    })
      .select('ai_summary ai_tags')
      .lean();

    if (recent.length === 0) {
      sendResponse(res, 200, { themes: [] }, 'No processed feedback in last 7 days');
      return;
    }

    const summaries = recent.map(f => f.ai_summary).filter((s): s is string => Boolean(s));
    const tags = recent.flatMap(f => f.ai_tags ?? []);

    const result = await generateWeeklySummary(summaries, tags);

    sendResponse(res, 200, result, 'Weekly summary generated');
  } catch (err: any) {
    console.error('AI summary failed:', err);
    sendResponse(res, 503, null, 'AI service error', err.message ?? 'Failed to contact AI service');
  }
}

/* =========================================================
   RE-ANALYSE
========================================================= */
// POST /api/feedback/:id/reanalyse
export async function reanalyse(req: Request, res: Response): Promise<void> {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      sendResponse(res, 404, null, 'Not found', 'Not found');
      return;
    }

    const analysis = await analyzeFeedback(feedback.title, feedback.description);

    feedback.ai_category = analysis.category;
    feedback.ai_sentiment = analysis.sentiment;
    feedback.ai_priority = analysis.priority_score;
    feedback.ai_summary = analysis.summary;
    feedback.ai_tags = analysis.tags;
    feedback.ai_processed = true;

    await feedback.save();

    sendResponse(res, 200, feedback, 'AI analysis re-triggered');
  } catch (err: any) {
    console.error('Re-analyse failed:', err);
    sendResponse(res, 503, null, 'AI service error', err.message ?? 'Failed to contact AI service');
  }
}