import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import { useChatContext } from '~/Providers';

export type TSubmitMessageData = {
  text: string;
  webSearch?: boolean;
};

export const useSubmitMessage = ({ clearDraft }: { clearDraft?: () => void }) => {
  const { conversationId, getMessages, setMessages } = useChatContext();
  const { data: endpointsConfig } = useGetEndpointsQuery();

  const submitMessage = useCallback(
    async (data: TSubmitMessageData) => {
      // Implementation details...
      const messages = getMessages();
      // Example: Add a new message to the conversation
      if (messages && conversationId) {
        const newMessage: TMessage = {
          messageId: Date.now().toString(),
          parentMessageId: messages[messages.length - 1]?.messageId || null,
          conversationId,
          text: data.text,
          isCreatedByUser: true,
          timestamp: new Date().toISOString(),
        };
        setMessages([...messages, newMessage]);
        if (clearDraft) {
          clearDraft();
        }
      }
    },
    [conversationId, getMessages, setMessages, endpointsConfig, clearDraft],
  );

  const submitPrompt = useCallback(
    async (data: TSubmitMessageData) => {
      // Implementation details...
      submitMessage(data);
    },
    [submitMessage],
  );

  return {
    submitMessage,
    submitPrompt,
  };
};
