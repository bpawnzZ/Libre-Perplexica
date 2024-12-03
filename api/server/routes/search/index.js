const express = require('express');
const router = express.Router();
const perplexica = require('./perplexica');

// Define search routes
router.use('/perplexica', perplexica);

module.exports = router;
