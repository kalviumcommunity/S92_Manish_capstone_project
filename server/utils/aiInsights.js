// Generates engagement insights with the Google Gemini API.

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
// Used when the main model is overloaded
const FALLBACK_MODEL = "gemini-3.1-flash-lite";
// Serverless functions (Netlify) stop after 10 seconds, so answer before that
const REQUEST_TIMEOUT_MS =
  Number(process.env.GEMINI_TIMEOUT_MS) ||
  (process.env.AWS_LAMBDA_FUNCTION_NAME ? 8000 : 30000);
const MAX_ITEMS = 5;

// Error with an HTTP status for the route to send back
class AiServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const INSTRUCTIONS = `You are a data analyst helping a community organization improve participation in its programs.
You receive engagement statistics as JSON:
- averageEngagement is 0-100
- averageSatisfaction is 1-5
- attendanceRate is a percentage
- null means there is no data yet

Use only the numbers in the data, and mention program names and figures.
Each list item must be one sentence under 30 words.
Reply with JSON only, in exactly this shape:
{"summary": "2-3 sentence overview", "highlights": ["..."], "concerns": ["..."], "recommendations": ["..."]}
Give 2-4 items per list. If there is little data, say so and recommend collecting more.`;

// Keep only what the model needs (no IDs)
const buildPromptData = (summary) => ({
  totals: summary.totals,
  categories: summary.categories,
  programs: summary.programs.slice(0, 50).map(({ id, ...program }) => program),
});

const toList = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
        .slice(0, MAX_ITEMS)
    : [];

// Read the JSON reply, allowing for a ```json code fence around it
const parseInsights = (text) => {
  const json = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let data;

  try {
    data = JSON.parse(json);
  } catch {
    throw new AiServiceError("The AI service returned an invalid response", 502);
  }

  if (typeof data.summary !== "string" || !data.summary.trim()) {
    throw new AiServiceError("The AI service returned an invalid response", 502);
  }

  return {
    summary: data.summary.trim(),
    highlights: toList(data.highlights),
    concerns: toList(data.concerns),
    recommendations: toList(data.recommendations),
  };
};

// ======================================================
// GENERATE INSIGHTS
// ======================================================

// Statuses that mean "overloaded or temporarily failing": worth trying another model
const RETRYABLE_STATUSES = [429, 500, 503];

// One generateContent call; returns the fetch Response
const callGemini = (model, apiKey, summary, timeoutMs) =>
  fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(buildPromptData(summary)) }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    }
  );

const generateInsights = async (summary) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const primaryModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || FALLBACK_MODEL;

  if (!apiKey) {
    throw new AiServiceError("AI insights are not configured on the server", 503);
  }

  // All attempts share one time budget (serverless functions have a hard limit)
  const deadline = Date.now() + REQUEST_TIMEOUT_MS;
  const models = [...new Set([primaryModel, fallbackModel].filter(Boolean))];
  let lastStatus = null;

  for (const model of models) {
    const remaining = deadline - Date.now();

    // Not enough time left for another attempt
    if (remaining < 1500) {
      break;
    }

    let response;

    try {
      response = await callGemini(model, apiKey, summary, remaining);
    } catch (error) {
      console.error(`Gemini request failed (${model}):`, error.message);
      throw new AiServiceError("Could not reach the AI service", 502);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`Gemini error (${model}):`, response.status, data.error?.message);
      lastStatus = response.status;

      // Overloaded: try the next model
      if (RETRYABLE_STATUSES.includes(response.status)) {
        continue;
      }

      throw new AiServiceError("The AI service could not generate insights", 502);
    }

    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("");

    if (!text) {
      throw new AiServiceError("The AI service returned an empty response", 502);
    }

    return { ...parseInsights(text), model };
  }

  if (lastStatus !== null) {
    throw new AiServiceError(
      "The AI service is busy right now. Please try again in a minute.",
      503
    );
  }

  throw new AiServiceError("The AI service did not respond in time", 504);
};

module.exports = {
  generateInsights,
  parseInsights,
  AiServiceError,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
};
