// ── CORS ────────────────────────────────────────────────────────────────────

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Requests without Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Exact origins from CLIENT_URL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel deployments of this ExpenseFlow project
      const isExpenseFlowVercel =
        /^https:\/\/expense-flow(?:-[a-z0-9]+)?-abc-c134\.vercel\.app$/.test(
          origin
        );

      if (isExpenseFlowVercel) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: origin ${origin} is not allowed`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);
