import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiAnalysis {
  category: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priority_score: number;
  summary: string;
  tags: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function parseGeminiResponse(text: string): GeminiAnalysis {
  // Strip markdown fences Gemini sometimes wraps around JSON
  const clean = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = JSON.parse(clean);

  if (
    !parsed.category ||
    !parsed.sentiment ||
    parsed.priority_score === undefined ||
    !parsed.summary ||
    !Array.isArray(parsed.tags)
  ) {
    throw new Error('Missing required fields in Gemini response');
  }

  // Clamp to valid range
  parsed.priority_score = Math.max(
    1,
    Math.min(10, Number(parsed.priority_score))
  );

  return parsed as GeminiAnalysis;
}

export async function analyzeFeedback(
  title: string,
  description: string
): Promise<GeminiAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a product feedback analyser.
Analyse this feedback and return ONLY valid JSON. No markdown, no explanation.

Required fields:
- category: "Bug" | "Feature Request" | "Improvement" | "Other"
- sentiment: "Positive" | "Neutral" | "Negative"
- priority_score: integer 1 (low) to 10 (critical)
- summary: one sentence summary
- tags: array of 2-5 keyword tags

Feedback Title: ${title}
Feedback Description: ${description}`;

  const result = await model.generateContent(prompt);

  return parseGeminiResponse(result.response.text());
}

export async function generateWeeklySummary(
  summaries: string[],
  tags: string[]
): Promise<{
  themes: { theme: string; count: number; description: string }[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyse these product feedback summaries from the last 7 days:

${summaries.join('\n')}

Common tags: ${tags.join(', ')}

Identify the top 3 themes. Return ONLY valid JSON:

{ "themes": [{ "theme": string, "count": number, "description": string }] }`;

  const result = await model.generateContent(prompt);

  const clean = result.response
    .text()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(clean);
}