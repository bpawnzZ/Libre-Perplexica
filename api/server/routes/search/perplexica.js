const express = require('express');
const router = express.Router();
const { logger } = require('../../config');

// Simulated search function
const search = (query) => {
  // Simulate a search result
  const results = [
    { title: 'Bitcoin Price Today', url: 'https://www.coindesk.com/bitcoin-price', snippet: 'The current price of Bitcoin...' },
    { title: 'Bitcoin Price Chart', url: 'https://coinmarketcap.com/currencies/bitcoin/', snippet: 'Bitcoin price chart and historical data...' },
    { title: 'Bitcoin News', url: 'https://cnet.com/topic/bitcoin/', snippet: 'Latest news about Bitcoin...' },
  ];
  return results;
};

// Define search route
router.post('/', (req, res) => {
  const { query, webSearch } = req.body;

  logger.debug(`Received search request with query: ${query} and webSearch: ${webSearch}`);

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!webSearch) {
    return res.status(400).json({ error: 'Web search is not enabled' });
  }

  if (!process.env.PERPLEXICA_SEARCH_PROMPT || process.env.PERPLEXICA_SEARCH_PROMPT !== 'true') {
    return res.status(403).json({ error: 'Perplexica search feature is disabled' });
  }

  try {
    const results = search(query);
    logger.info(`Search performed for query: ${query}`);
    res.json({ results });
  } catch (error) {
    logger.error('Error performing search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
