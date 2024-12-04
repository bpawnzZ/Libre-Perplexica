import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXICA_API_BASE_URL = process.env.PERPLEXICA_API_BASE_URL;
const PERPLEXICA_API_KEY = process.env.PERPLEXICA_API_KEY;
const PERPLEXICA_CUSTOM_OPENAI_KEY = process.env.PERPLEXICA_CUSTOM_OPENAI_KEY;

if (!PERPLEXICA_API_BASE_URL || !PERPLEXICA_API_KEY || !PERPLEXICA_CUSTOM_OPENAI_KEY) {
  throw new Error('Perplexica API credentials are not set in environment variables.');
}

export interface PerplexicaRequestPayload {
  query: string;
  focusMode: string;
  optimizationMode: string;
  chatModel: {
    provider: string;
    model: string;
    customOpenAIKey: string;
    customOpenAIBaseURL: string;
  };
  embeddingModel: {
    provider: string;
    model: string;
  };
  history: any[];
}

export interface PerplexicaResponse {
  message?: string;
  sources?: Array<{
    metadata: {
      title: string;
      url: string;
    };
  }>;
}

export const performPerplexicaSearch = async (
  prompt: string,
  history: any[] = [],
  timeout: number = 30
): Promise<PerplexicaResponse | null> => {
  const url = `${PERPLEXICA_API_BASE_URL}/search`;

  const payload: PerplexicaRequestPayload = {
    query: prompt.trim(),
    focusMode: 'webSearch',
    optimizationMode: 'speed',
    chatModel: {
      provider: 'custom_openai',
      model: 'qwen/qwen-2.5-72b-instruct',
      customOpenAIKey: PERPLEXICA_CUSTOM_OPENAI_KEY,
      customOpenAIBaseURL: 'https://litellm.2damoon.xyz',
    },
    embeddingModel: {
      provider: 'openai',
      model: 'text-embedding-3-small',
    },
    history: [],
  };

  try {
    const response: AxiosResponse<PerplexicaResponse> = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXICA_API_KEY}`,
        'Connection': 'close',
      },
      timeout: timeout * 1000,
    });

    return response.data;
  } catch (error: any) {
    console.error('Perplexica API Error:', error.message);
    return null;
  }
};
