Certainly! Below is a comprehensive step-by-step guide to modify your **Libre-Perplexica** project to integrate the Perplexica API for web search functionality. This guide assumes familiarity with React, TypeScript, Node.js, and basic backend development. It ensures that when the web search toggle is enabled, prompts are sent to the Perplexica API, and responses are displayed appropriately. When the toggle is off, the chat functions as usual.

---

## **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Step 1: Clone and Set Up the Repository](#step-1-clone-and-set-up-the-repository)
4. [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
5. [Step 3: Backend Modifications](#step-3-backend-modifications)
    - [3.1. Create the Perplexica Service](#31-create-the-perplexica-service)
    - [3.2. Modify the Chat Message Handler](#32-modify-the-chat-message-handler)
6. [Step 4: Frontend Modifications](#step-4-frontend-modifications)
    - [4.1. Update State Management](#41-update-state-management)
    - [4.2. Update Chat Submission Logic](#42-update-chat-submission-logic)
7. [Step 5: Integrate and Test the Functionality](#step-5-integrate-and-test-the-functionality)
8. [Step 6: Error Handling and Logging](#step-6-error-handling-and-logging)
9. [Step 7: Final Touches and Deployment](#step-7-final-touches-and-deployment)
10. [Appendix: Example Code Snippets](#appendix-example-code-snippets)

---

## **Prerequisites**

Before proceeding, ensure you have the following:

- **Development Environment**:
  - **Node.js** (v14.x or later)
  - **npm** or **yarn**
  - **Git**
- **Project Access**:
  - Access to the [Libre-Perplexica Repository](https://github.com/bpawnzZ/Libre-Perplexica)
- **Perplexica API Credentials**:
  - API Key and Endpoint details from Perplexica
- **Familiarity With**:
  - React and TypeScript for frontend
  - Express.js or the backend framework used in Libre-Perplexica
  - Recoil for state management

---

## **Project Structure Overview**

Assuming the Libre-Perplexica repository follows a typical full-stack structure, here's an overview:

```
Libre-Perplexica/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── recoil/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   └── package.json
├── README.md
└── package.json
```

*Note: Adjust paths according to the actual project structure.*

---

## **Step 1: Clone and Set Up the Repository**

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/bpawnzZ/Libre-Perplexica.git
   cd Libre-Perplexica
   ```

2. **Install Dependencies**:

   - **Backend**:

     ```bash
     cd backend
     npm install
     # or using yarn
     yarn install
     ```

   - **Frontend**:

     ```bash
     cd ../frontend
     npm install
     # or using yarn
     yarn install
     ```

3. **Run the Project Locally** (Optional):

   - **Start Backend**:

     ```bash
     cd backend
     npm run dev
     # or
     yarn dev
     ```

   - **Start Frontend**:

     ```bash
     cd ../frontend
     npm start
     # or
     yarn start
     ```

   Ensure that both frontend and backend are running without errors before proceeding.

---

## **Step 2: Configure Environment Variables**

To securely manage API keys and configurations, use environment variables.

1. **Backend Environment Variables**:

   - Navigate to the backend directory:

     ```bash
     cd backend
     ```

   - **Create or Update `.env` File**:

     If not already present, create a `.env` file.

     ```bash
     touch .env
     ```

   - **Add Perplexica API Credentials**:

     ```env
     PERPLEXICA_API_BASE_URL=https://your-perplexica-api-endpoint.com/api
     PERPLEXICA_API_KEY=your_perplexica_api_key_here
     ```

     *Replace `https://your-perplexica-api-endpoint.com/api` and `your_perplexica_api_key_here` with actual values provided by Perplexica.*

   - **Ensure Security**:

     Make sure `.env` is listed in `.gitignore` to prevent committing sensitive data.

2. **Frontend Environment Variables**:

   - Navigate to the frontend directory:

     ```bash
     cd ../frontend
     ```

   - **Create or Update `.env` File**:

     ```bash
     touch .env
     ```

   - **Add API Base URL**:

     ```env
     VITE_API_BASE_URL=http://localhost:3001/api
     VITE_PERPLEXICA_SEARCH_PROMPT=true
     ```

     *Adjust `VITE_API_BASE_URL` if your backend runs on a different port or host.*

   - **Note on VITE_PREFIX**:

     In Vite (commonly used in React projects), environment variables must be prefixed with `VITE_` to be accessible on the frontend.

3. **Restart Development Servers**:

   After setting environment variables, restart both backend and frontend servers to apply changes.

---

## **Step 3: Backend Modifications**

We need to integrate the Perplexica API into the backend to handle search queries when the toggle is enabled.

### **3.1. Create the Perplexica Service**

Create a dedicated service to interact with the Perplexica API.

1. **Create Service File**:

   - Path: `backend/services/perplexicaService.ts`

   - **Code:**

     ```typescript
     // backend/services/perplexicaService.ts

     import axios, { AxiosResponse } from 'axios';
     import dotenv from 'dotenv';

     dotenv.config();

     const PERPLEXICA_API_BASE_URL = process.env.PERPLEXICA_API_BASE_URL;
     const PERPLEXICA_API_KEY = process.env.PERPLEXICA_API_KEY;

     if (!PERPLEXICA_API_BASE_URL || !PERPLEXICA_API_KEY) {
       throw new Error('Perplexica API credentials are not set in environment variables.');
     }

     export interface PerplexicaRequestPayload {
       query: string;
       focusMode: string; // e.g., "webSearch"
       optimizationMode: string; // e.g., "speed"
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
       history: any[]; // Adjust type as needed
     }

     export interface PerplexicaResponse {
       message?: string;
       sources?: Array<{
         metadata: {
           title: string;
           url: string;
         };
       }>;
       // Add other fields as necessary
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
           customOpenAIKey: 'sk-FiIu6b1Hyq7TDX-C9phogQ',
           customOpenAIBaseURL: 'https://litellm.2damoon.xyz',
         },
         embeddingModel: {
           provider: 'openai',
           model: 'text-embedding-3-small',
         },
         history: [], // Sending empty history as per existing implementation
       };

       try {
         const response: AxiosResponse<PerplexicaResponse> = await axios.post(url, payload, {
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${PERPLEXICA_API_KEY}`,
             'Connection': 'close',
           },
           timeout: timeout * 1000, // Convert to milliseconds
         });

         return response.data;
       } catch (error: any) {
         console.error('Perplexica API Error:', error.message);
         return null;
       }
     };
     ```

   - **Notes**:
     - Replace `chatModel` and `embeddingModel` fields as per your specific requirements or Perplexica's API documentation.
     - Ensure that sensitive information like `customOpenAIKey` is handled securely. Consider moving them to environment variables if necessary.

2. **Install Required Packages**:

   Ensure that `axios` and `dotenv` are installed in the backend.

   ```bash
   npm install axios dotenv
   # or
   yarn add axios dotenv
   ```

### **3.2. Modify the Chat Message Handler**

Integrate the Perplexica service into the existing chat message handling logic.

1. **Locate the Chat Controller or Handler**:

   - Path Example: `backend/controllers/chatController.ts`

2. **Modify the Chat Handler**:

   - **Code Example**:

     ```typescript
     // backend/controllers/chatController.ts

     import { Request, Response } from 'express';
     import { performPerplexicaSearch, PerplexicaResponse } from '../services/perplexicaService';
     import { getChatResponse } from '../services/chatService'; // Existing chat service

     export const handleChatMessage = async (req: Request, res: Response) => {
       const { prompt, webSearch } = req.body;
       const history = req.body.history || []; // Assuming history is passed

       if (!prompt || typeof prompt !== 'string') {
         return res.status(400).json({ error: 'Invalid prompt.' });
       }

       try {
         let responseData: any;

         if (webSearch) {
           // Call Perplexica API
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
           // Normal chat processing
           responseData = await getChatResponse(prompt, history);
         }

         // Optionally, update history here

         return res.status(200).json(responseData);
       } catch (error: any) {
         console.error('Chat Handler Error:', error.message);
         return res.status(500).json({ error: 'Internal server error.' });
       }
     };
     ```

   - **Notes**:
     - Ensure that `handleChatMessage` is correctly connected to the appropriate route.
     - The `webSearch` flag determines whether to route the prompt to Perplexica or handle it normally.
     - Adjust the structure of `responseData` to match frontend expectations.

3. **Update Routes (If Necessary)**:

   Ensure that the chat route utilizes the modified handler.

   - **Example**:

     ```typescript
     // backend/routes/chatRoutes.ts

     import express from 'express';
     import { handleChatMessage } from '../controllers/chatController';

     const router = express.Router();

     router.post('/chat', handleChatMessage);

     export default router;
     ```

4. **Ensure Backend Server Imports Routes**:

   - **Example**:

     ```typescript
     // backend/index.ts

     import express from 'express';
     import chatRoutes from './routes/chatRoutes';
     // ... other imports

     const app = express();

     app.use(express.json());

     app.use('/api', chatRoutes);

     // ... other middleware and routes

     const PORT = process.env.PORT || 3001;
     app.listen(PORT, () => {
       console.log(`Backend server running on port ${PORT}`);
     });
     ```

5. **Restart Backend Server**:

   After making changes, restart the backend server to apply updates.

   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

## **Step 4: Frontend Modifications**

Adjust the frontend to handle sending the `webSearch` flag and displaying responses appropriately.

### **4.1. Update State Management**

Ensure that the frontend maintains the state of the web search toggle.

1. **Recoil Atom for Web Search**:

   It's mentioned that a Recoil atom `webSearch` has been created. Ensure it's correctly set up.

   - **File Path**: `frontend/src/recoil/webSearch.ts`

   - **Code Example**:

     ```typescript
     // frontend/src/recoil/webSearch.ts

     import { atom } from 'recoil';

     export const webSearchState = atom<boolean>({
       key: 'webSearchState',
       default: false,
     });
     ```

2. **Integrate WebSearch Atom into Main Store**:

   - **File Path**: `frontend/src/recoil/index.ts`

   - **Code Example**:

     ```typescript
     // frontend/src/recoil/index.ts

     import { atom, selector } from 'recoil';
     import { webSearchState } from './webSearch';
     // ... other atoms and selectors

     export { webSearchState /*, other exports */ };
     ```

### **4.2. Update Chat Submission Logic**

Modify the chat submission to include the `webSearch` flag and handle responses.

1. **Locate Chat Submission Component**:

   - Path Example: `frontend/src/components/ChatForm.tsx`

2. **Modify the Submission Handler**:

   - **Code Example**:

     ```tsx
     // frontend/src/components/ChatForm.tsx

     import React, { useState } from 'react';
     import { useRecoilState } from 'recoil';
     import { webSearchState } from '../recoil/webSearch';
     import axios from 'axios';

     const ChatForm: React.FC = () => {
       const [input, setInput] = useState('');
       const [webSearch, setWebSearch] = useRecoilState(webSearchState);
       const [messages, setMessages] = useState<Array<{ sender: string; text: string; sources?: string[] }>>([]);

       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         if (!input.trim()) return;

         // Add user message to messages
         setMessages([...messages, { sender: 'User', text: input }]);

         try {
           const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
             prompt: input,
             webSearch: webSearch,
             history: messages, // Include history if needed
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
           <TextareaAutosize
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
     ```

   - **Explanation**:
     - The `handleSubmit` function sends a POST request to the backend with the user's prompt and the `webSearch` flag.
     - The response is then added to the `messages` state, displaying the assistant's reply.
     - Ensure that `Switch` refers to a toggle component from your UI library (e.g., `@headlessui/react` or similar).

3. **Handle Response with Sources**:

   Update the chat display component to show sources if available.

   - **Locate Chat Display Component**:

     - Path Example: `frontend/src/components/ChatDisplay.tsx`

   - **Modify to Display Sources**:

     ```tsx
     // frontend/src/components/ChatDisplay.tsx

     import React from 'react';

     interface Message {
       sender: string;
       text: string;
       sources?: string[];
     }

     interface ChatDisplayProps {
       messages: Message[];
     }

     const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
       return (
         <div className="chat-display">
           {messages.map((msg, index) => (
             <div key={index} className={`message ${msg.sender}`}>
               <strong>{msg.sender}:</strong> <span>{msg.text}</span>
               {msg.sources && msg.sources.length > 0 && (
                 <div className="sources">
                   <strong>Sources:</strong>
                   <ul>
                     {msg.sources.map((source, idx) => (
                       <li key={idx}>
                         <a href={source.url} target="_blank" rel="noopener noreferrer">
                           {source.title}
                         </a>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
           ))}
         </div>
       );
     };

     export default ChatDisplay;
     ```

   - **Styles**:
     - Add appropriate CSS to style the sources section, ensuring clarity and readability.

4. **Ensure Proper Integration with Context and History**:

   - If your application maintains a chat history or context for AI models, ensure that when `webSearch` is enabled, the context is either maintained or appropriately reset based on your requirements.

---

## **Step 5: Integrate and Test the Functionality**

After implementing backend and frontend changes, it's crucial to test the integration thoroughly.

1. **Start Both Servers**:

   - **Backend**:

     ```bash
     cd backend
     npm run dev
     # or
     yarn dev
     ```

   - **Frontend**:

     ```bash
     cd frontend
     npm start
     # or
     yarn start
     ```

2. **Access the Application**:

   Navigate to `http://localhost:3000` (or the appropriate port) in your browser.

3. **Test Chat Functionality with Web Search Toggle Off**:

   - Ensure that sending messages works as expected.
   - Verify that responses are generated using the normal chat mechanism.

4. **Test Chat Functionality with Web Search Toggle On**:

   - Toggle the web search switch to "On."
   - Submit a prompt and verify:
     - The prompt is sent to the Perplexica API.
     - The assistant's response is displayed in the chat.
     - If sources are available and the toggle for showing sources is enabled, they are displayed correctly.

5. **Verify Toggle Persistence**:

   - Ensure that the state of the toggle persists across component re-renders and page navigations if applicable.

6. **Edge Cases and Error Handling**:

   - Submit empty prompts and verify that appropriate error messages are shown.
   - Disconnect the backend or mock API failures to ensure that error handling works as intended.

---

## **Step 6: Error Handling and Logging**

Enhance the robustness of your application by implementing comprehensive error handling and logging.

1. **Backend Error Responses**:

   - Ensure that the backend sends meaningful error messages to the frontend.
   - In the `handleChatMessage` function, adjust error responses as needed.

2. **Frontend Error Notifications**:

   - Implement user-friendly error messages in the UI when API calls fail.
   - Optionally, use a notification library (e.g., `react-toastify`) to display transient error messages.

3. **Logging**:

   - Utilize logging libraries like `winston` or `morgan` in the backend for enhanced logging capabilities.
   - **Example**:

     ```bash
     npm install winston morgan
     # or
     yarn add winston morgan
     ```

   - **Setup in Backend**:

     ```typescript
     // backend/index.ts

     import express from 'express';
     import morgan from 'morgan';
     import winston from 'winston';
     import chatRoutes from './routes/chatRoutes';
     // ... other imports

     const app = express();

     // Setup morgan for HTTP request logging
     app.use(morgan('combined'));

     // Setup winston for application logging
     const logger = winston.createLogger({
       level: 'info',
       format: winston.format.json(),
       transports: [
         new winston.transports.File({ filename: 'error.log', level: 'error' }),
         new winston.transports.File({ filename: 'combined.log' }),
       ],
     });

     if (process.env.NODE_ENV !== 'production') {
       logger.add(new winston.transports.Console({
         format: winston.format.simple(),
       }));
     }

     // Middleware to attach logger to requests
     app.use((req, res, next) => {
       req.logger = logger;
       next();
     });

     app.use('/api', chatRoutes);

     // ... other middleware and routes

     const PORT = process.env.PORT || 3001;
     app.listen(PORT, () => {
       logger.info(`Backend server running on port ${PORT}`);
     });
     ```

4. **Frontend Error Boundaries**:

   - Implement React Error Boundaries to catch and handle unexpected errors in the component tree.

   - **Example**:

     ```tsx
     // frontend/src/components/ErrorBoundary.tsx

     import React, { Component, ReactNode } from 'react';

     interface Props {
       children: ReactNode;
     }

     interface State {
       hasError: boolean;
     }

     class ErrorBoundary extends Component<Props, State> {
       constructor(props: Props) {
         super(props);
         this.state = { hasError: false };
       }

       static getDerivedStateFromError(_: Error): State {
         return { hasError: true };
       }

       componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
         console.error('Error Boundary Caught:', error, errorInfo);
       }

       render() {
         if (this.state.hasError) {
           return <h1>Something went wrong.</h1>;
         }

         return this.props.children;
       }
     }

     export default ErrorBoundary;
     ```

   - **Wrap Application with ErrorBoundary**:

     ```tsx
     // frontend/src/App.tsx

     import React from 'react';
     import ErrorBoundary from './components/ErrorBoundary';
     import ChatForm from './components/ChatForm';
     import ChatDisplay from './components/ChatDisplay';
     // ... other imports

     const App: React.FC = () => {
       // ... existing state and logic

       return (
         <ErrorBoundary>
           <div className="app-container">
             <ChatDisplay messages={messages} />
             <ChatForm />
           </div>
         </ErrorBoundary>
       );
     };

     export default App;
     ```

---

## **Step 7: Final Touches and Deployment**

After thorough testing, prepare your application for deployment.

1. **Optimize for Production**:

   - **Frontend**:

     ```bash
     cd frontend
     npm run build
     # or
     yarn build
     ```

   - **Backend**:

     - Ensure that environment variables are set appropriately.
     - Optimize server settings for production.

2. **Deployment Options**:

   - **Backend**:
     - Deploy to platforms like **Heroku**, **Vercel**, **AWS**, **DigitalOcean**, etc.
   - **Frontend**:
     - Deploy to platforms like **Netlify**, **Vercel**, **GitHub Pages**, etc.

3. **Configure CORS (If Necessary)**:

   If frontend and backend are on different domains, ensure CORS is properly configured in the backend.

   - **Example**:

     ```typescript
     // backend/index.ts

     import cors from 'cors';

     // ...

     const app = express();

     app.use(cors({
       origin: 'https://your-frontend-domain.com',
       methods: ['GET', 'POST'],
       credentials: true,
     }));

     // ...
     ```

   - **Install CORS Middleware**:

     ```bash
     npm install cors
     # or
     yarn add cors
     ```

4. **Secure API Keys and Environment Variables**:

   - Ensure that API keys are not exposed publicly.
   - Utilize platform-specific environment variable settings.

5. **Monitor and Maintain**:

   - Set up monitoring tools like **Sentry**, **LogRocket**, or **New Relic** for real-time error tracking and performance monitoring.

---

## **Appendix: Example Code Snippets**

### **A. Perplexica Service (`perplexicaService.ts`)**

```typescript
// backend/services/perplexicaService.ts

import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXICA_API_BASE_URL = process.env.PERPLEXICA_API_BASE_URL;
const PERPLEXICA_API_KEY = process.env.PERPLEXICA_API_KEY;

if (!PERPLEXICA_API_BASE_URL || !PERPLEXICA_API_KEY) {
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
      customOpenAIKey: 'sk-FiIu6b1Hyq7TDX-C9phogQ',
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
```

### **B. Chat Controller (`chatController.ts`)**

```typescript
// backend/controllers/chatController.ts

import { Request, Response } from 'express';
import { performPerplexicaSearch, PerplexicaResponse } from '../services/perplexicaService';
import { getChatResponse } from '../services/chatService'; // Existing chat service

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
```

### **C. Chat Form Component (`ChatForm.tsx`)**

```tsx
// frontend/src/components/ChatForm.tsx

import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { webSearchState } from '../recoil/webSearch';
import axios from 'axios';
import Switch from '@headlessui/react'; // Assuming use of Headless UI

const ChatForm: React.FC = () => {
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useRecoilState(webSearchState);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; sources?: string[] }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: 'User', text: input }]);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
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
      <TextareaAutosize
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
```

### **D. Chat Display Component (`ChatDisplay.tsx`)**

```tsx
// frontend/src/components/ChatDisplay.tsx

import React from 'react';

interface Source {
  title: string;
  url: string;
}

interface Message {
  sender: string;
  text: string;
  sources?: Source[];
}

interface ChatDisplayProps {
  messages: Message[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  return (
    <div className="chat-display">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender}`}>
          <strong>{msg.sender}:</strong> <span>{msg.text}</span>
          {msg.sources && msg.sources.length > 0 && (
            <div className="sources">
              <strong>Sources:</strong>
              <ul>
                {msg.sources.map((source, idx) => (
                  <li key={idx}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatDisplay;
```

---

## **Conclusion**

By following this guide meticulously, you should be able to integrate the Perplexica API into your Libre-Perplexica project effectively. This integration allows users to toggle web search functionality seamlessly, enhancing the chat experience with real-time web search capabilities. Ensure thorough testing across different scenarios to maintain a robust and user-friendly application.

Feel free to reach out if you encounter any issues or need further assistance!