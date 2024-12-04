import { v4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import {
  Constants,
  QueryKeys,
  ContentTypes,
  parseCompactConvo,
  isAssistantsEndpoint,
  EModelEndpoint,
} from 'librechat-data-provider';
import { useSetRecoilState, useResetRecoilState, useRecoilValue } from 'recoil';
import type {
  TMessage,
  TSubmission,
  TConversation,
  TEndpointOption,
  TEndpointsConfig,
} from 'librechat-data-provider';
import type { SetterOrUpdater } from 'recoil';
import type { TAskFunction, ExtendedFile } from '~/common';
import useSetFilesToDelete from '~/hooks/Files/useSetFilesToDelete';
import useGetSender from '~/hooks/Conversations/useGetSender';
import { getArtifactsMode } from '~/utils/artifacts';
import { getEndpointField, logger } from '~/utils';
import useUserKey from '~/hooks/Input/useUserKey';
import {
  codeArtifacts,
  includeShadcnui,
  customPromptMode,
  latestMessageFamily,
  showStopButtonByIndex,
} from '~/store';

const logChatRequest = (request: Record<string, unknown>) => {
  logger.log('=====================================\nAsk function called with:');
  logger.dir(request);
  logger.log('=====================================');
};

export default function useChatFunctions({
  index = 0,
  files,
  setFiles,
  getMessages,
  setMessages,
  isSubmitting,
  conversation,
  latestMessage,
  setSubmission,
  setLatestMessage,
}: {
  index?: number;
  isSubmitting: boolean;
  paramId?: string | undefined;
  conversation: TConversation | null;
  latestMessage: TMessage | null;
  getMessages: () => TMessage[] | undefined;
  setMessages: (messages: TMessage[]) => void;
  files?: Map<string, ExtendedFile>;
  setFiles?: SetterOrUpdater<Map<string, ExtendedFile>>;
  setSubmission: SetterOrUpdater<TSubmission | null>;
  setLatestMessage?: SetterOrUpdater<TMessage | null>;
}) {
  const codeArtifactsState = useRecoilValue(codeArtifacts);
  const includeShadcnuiState = useRecoilValue(includeShadcnui);
  const customPromptModeState = useRecoilValue(customPromptMode);
  const resetLatestMultiMessage = useResetRecoilState(latestMessageFamily(index + 1));
  const setShowStopButton = useSetRecoilState(showStopButtonByIndex(index));
  const setFilesToDelete = useSetFilesToDelete();
  const getSender = useGetSender();

  const queryClient = useQueryClient();
  const { getExpiry } = useUserKey(conversation?.endpoint ?? '');

  const ask: TAskFunction = (
    {
      text,
      overrideConvoId,
      overrideUserMessageId,
      parentMessageId = null,
      conversationId = null,
      messageId = null,
    }: {
      text: string;
      overrideConvoId?: string;
      overrideUserMessageId?: string;
      parentMessageId?: string;
      conversationId?: string;
      messageId?: string;
    },
    {
      editedText = null,
      editedMessageId = null,
      resubmitFiles = false,
