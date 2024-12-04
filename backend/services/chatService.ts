import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';

export const getChatResponse = async (prompt: string, history: any[], webSearch: boolean): Promise<any> => {
  if (webSearch) {
    try {
      const base_url = "http://100.71.229.63:3001/api";
      const url = `${base_url}/search`;

      const payload = {
        query: prompt,
        focusMode: "webSearch",
        optimizationMode: "speed",
        chatModel: {
          provider: "custom_openai",
          model: "openai/gpt-4o-mini",
          customOpenAIKey: process.env.CUSTOM_OPENAI_KEY || "sk-FiIu6b1Hyq7TDX-C9phogQ",
          customOpenAIBaseURL: process.env.CUSTOM_OPENAI_BASE_URL || "https://litellm.2damoon.xyz"
        },
        embeddingModel: {
          provider: "openai",
          model: "text-embedding-3-small"
        },
        history: []
      };

      const response: AxiosResponse = await axios.post(url, payload, { timeout: 60000 });
      return response.data;
    } catch (error) {
      console.error("Error fetching data from Perplexica:", error);
      return { message: "An error occurred while processing your request." };
    }
  } else {
    // Placeholder implementation for the existing chat response logic
    // This will be replaced with the actual chat response logic later
    return {
      message: `Response to prompt: ${prompt}`,
    };
  }
};
