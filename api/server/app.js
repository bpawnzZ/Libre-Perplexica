const express = require('express');
const cors = require('cors');
const compression = require('compression');
const passport = require('passport');
const { initializeClient } = require('../app/clients');
const { logger } = require('../config');
const jwtLogin = require('../strategies/jwtStrategy');

const app = express();

// Initialize clients first
initializeClient();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());

// Initialize Passport and JWT Strategy
app.use(passport.initialize());
jwtLogin().then(strategy => {
  passport.use(strategy);
  logger.info('JWT strategy initialized');
}).catch(err => {
  logger.error('Error initializing JWT strategy:', err);
});

// Import routes
const routes = require('./routes');

// Apply routes
Object.entries(routes).forEach(([path, router]) => {
  // Only mount routes that exist and are valid Express routers
  if (router && typeof router === 'function' && router.stack) {
    app.use(`/${path}`, router);
    logger.info(`Mounted route: /${path}`);
  } else {
    logger.warn(`Skipping invalid router for path /${path}`);
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'LibreChat API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Not Found: ${req.method} ${req.path}`,
      status: 404
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error details:', {
    status,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  res.status(status).json({
    error: {
      message,
      status
    }
  });
});

module.exports = app;
