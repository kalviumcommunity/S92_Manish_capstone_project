// Runs before each test file, before the app is required.
process.env.JWT_SECRET = "test-jwt-secret";
process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
delete process.env.CLIENT_URL;
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;
delete process.env.GEMINI_FALLBACK_MODEL;
