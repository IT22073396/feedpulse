import Feedback, { IFeedback } from '../models/Feedback';
import { analyzeFeedback, generateWeeklySummary } from '../services/gemini.service';
import { sendResponse } from '../utils/response';

// POST /api/feedback — Submit new feedback
export async function createFeedback(req, res): Promise<void> {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    // Basic input sanitisation — strip any HTML tags
    const sanitise = (str?: string) =>
      str?.replace(/<[^>]*>/g, '').trim() ?? undefined;

    const feedback = await Feedback.create({
      title: sanitise(title),
      description: sanitise(description),
      category,
      submitterName: sanitise(submitterName),
      submitterEmail: submitterEmail?.toLowerCase().trim(),
    });

    // Trigger AI analysis — feedback is already saved so AI failure is safe (Req 2.3)
    try {
      const analysis = await analyzeFeedback(
        feedback.title,
        feedback.description
      );

      feedback.ai_category = analysis.category;
      feedback.ai_sentiment = analysis.sentiment;
      feedback.ai_priority = analysis.priority_score;
      feedback.ai_summary = analysis.summary;
      feedback.ai_tags = analysis.tags;
      feedback.ai_processed = true;

      await feedback.save();
    } catch (aiError) {
      console.error('Gemini analysis failed (non-fatal):', aiError);
    }

    sendResponse(res, 201, feedback, 'Feedback submitted successfully');
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      sendResponse(res, 400, null, 'Validation failed', err.message);
    } else {
      sendResponse(res, 500, null, 'Internal server error', 'Server error');
    }
  }
}

// GET /api/feedback — List all with filters + pagination + search
export async function getAllFeedback(req, res): Promise<void> {
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

  const filter: Record<string, unknown> = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (sentiment) filter.ai_sentiment = sentiment;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { ai_summary: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  sendResponse(
    res,
    200,
    {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    'Feedback retrieved successfully'
  );
}

// PATCH /api/feedback/:id — Update status (admin only)
export async function updateFeedbackStatus(req, res): Promise<void> {
  const { status } = req.body;
  const valid = ['New', 'In Review', 'Resolved'];

  if (!status || !valid.includes(status)) {
    sendResponse(
      res,
      400,
      null,
      `Status must be one of: ${valid.join(', ')}`,
      'Bad request'
    );
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

// DELETE /api/feedback/:id — Delete (admin only)
export async function deleteFeedback(req, res): Promise<void> {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    sendResponse(res, 404, null, 'Not found', 'Not found');
    return;
  }

  sendResponse(res, 200, null, 'Feedback deleted successfully');
}