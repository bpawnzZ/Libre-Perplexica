import React from 'react';

interface Source {
  metadata: {
    title: string;
    url: string;
  };
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
                    <a href={source.metadata.url} target="_blank" rel="noopener noreferrer">
                      {source.metadata.title}
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
