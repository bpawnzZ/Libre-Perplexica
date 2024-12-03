const app = require('./app');
const mongoose = require('mongoose');
const { logger } = require('../config');

const port = process.env.PORT || 3080;
const host = process.env.HOST || 'localhost';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(port, host, () => {
      logger.info(`Server listening on http://${host}:${port}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
