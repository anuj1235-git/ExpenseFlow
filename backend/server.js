'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// Connect to MongoDB
// ─────────────────────────────────────────────────────────────────────────────

connectDB();

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────────────────────────────────────

app.use(helmet());

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as Postman, curl, mobile apps, etc.
      if (!origin) {
        return callback(null, true);
      }

      // Allow explicitly configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      /*
       * Allow all Vercel deployment URLs belonging to this project.
       *
       * Examples:
       * https://expense-flow-abc-c134.vercel.app
       * https://expense-flow-ff79bcyqn-abc-c134.vercel.app
       * https://expense-flow-q13gon13j-abc-c134.vercel.app
       */
      const isExpenseFlowVercelOrigin =
        /^https:\/\/expense-flow(?:-[a-z0-9-]+)?-abc-c134\.vercel\.app$/i.test(
          origin
        );

      if (isExpenseFlowVercelOrigin) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));

app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Request Logging
// ─────────────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting for Authentication
// ─────────────────────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  '/api/auth',
  authLimiter,
  authRoutes
);

app.use(
  '/api/transactions',
  transactionRoutes
);

app.use(
  '/api/budgets',
  budgetRoutes
);

app.use(
  '/api/goals',
  goalRoutes
);

app.use(
  '/api/analytics',
  analyticsRoutes
);

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'ExpenseFlow API is running',
    timestamp: new Date(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use(notFound);

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ExpenseFlow API running');
  console.log(`   Port             : ${PORT}`);
  console.log(
    `   Environment      : ${process.env.NODE_ENV || 'development'}`
  );
  console.log(
    `   Allowed origins  : ${allowedOrigins.join(', ')}`
  );
  console.log('');
});
