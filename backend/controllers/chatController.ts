import { Request, Response } from 'express';
import { performPerplexicaSearch, PerplexicaResponse } from '../services/perplexicaService';
import { getChatResponse } from '../services/chatService';

export const handleChatMessage = async (req: Request, res: Response) => {
  const { prompt, webSearch } = req.body;
  const history = req.body.history || [];

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt.' });
  }

  try {
    let responseData: any;

    if (webSearch) {
      const perplexicaResponse: PerplexicaResponse | null = await performPerplexicaSearch(prompt, history);

      if (perplexicaResponse) {
        responseData = {
          message: perplexicaResponse.message || 'No response from Perplexica.',
          sources: perplexicaResponse.sources || [],
        };
      } else {
        responseData = { message: 'Error fetching data from Perplexica.' };
      }
    } else {
      responseData = await getChatResponse(prompt, history);
    }

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Chat Handler Error:', error.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
