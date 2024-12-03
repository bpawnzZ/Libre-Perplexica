import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { webSearchState } from '../store/index.js'; // Add file extension
import axios from 'axios';
import { Switch } from '@headlessui/react'; // Use named import for Switch

interface Message {
  sender: string;
  text: string;
  sources?: Array<{ metadata: { title: string; url: string } }>;
}

interface ChatResponse {
  message: string;
  sources?: Array<{ metadata: { title: string; url: string } }>;
}

const ChatForm: React.FC = () => {
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useRecoilState(webSearchState);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: 'User', text: input }]);

    try {
      const response = await axios.post<ChatResponse>(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
        prompt: input,
        webSearch: webSearch,
        history: messages,
      });

      if (response.data) {
        const { message, sources } = response.data;
        setMessages([...messages, { sender: 'User', text: input }, { sender: 'Assistant', text: message, sources }]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages([...messages, { sender: 'User', text: input }, { sender: 'Assistant', text: 'Error processing your request.' }]);
    } finally {
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-form">
      {/* Web Search Toggle */}
      <div className="toggle-container bg-[#1A1D21] border-b border-[#2F3336] p-2">
        <label htmlFor="webSearchToggle" className="flex items-center">
          <span className="mr-2 text-white">Web Search</span>
          <Switch
            checked={webSearch}
            onChange={setWebSearch}
            className={`${
              webSearch ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">Enable Web Search</span>
            <span
              className={`${
                webSearch ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
            />
          </Switch>
        </label>
      </div>

      {/* Input Field */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Type your message..."
      />

      {/* Submit Button */}
      <button type="submit" className="submit-button">
        Send
      </button>
    </form>
  );
};

export default ChatForm;
