import { memo, useRef, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  useChatContext,
  useChatFormContext,
  useAddedChatContext,
  useAssistantsMapContext,
} from '~/Providers';
import {
  useTextarea,
  useAutoSave,
  useRequiresKey,
  useHandleKeyUp,
  useQueryParams,
  useSubmitMessage,
} from '~/hooks';
import FileFormWrapper from './Files/FileFormWrapper';
import { TextareaAutosize, Switch } from '~/components/ui';
import { cn, removeFocusRings } from '~/utils';
import TextareaHeader from './TextareaHeader';
import PromptsCommand from './PromptsCommand';
import AudioRecorder from './AudioRecorder';
import { mainTextareaId } from '~/common';
import StreamAudio from './StreamAudio';
import StopButton from './StopButton';
import SendButton from './SendButton';
import Mention from './Mention';
import store from '~/store';

const ChatForm = ({ index = 0 }) => {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useQueryParams({ textAreaRef });

  const SpeechToText = useRecoilValue(store.speechToText);
  const TextToSpeech = useRecoilValue(store.textToSpeech);
  const automaticPlayback = useRecoilValue(store.automaticPlayback);
  const [webSearch, setWebSearch] = useRecoilState(store.webSearch);

  const isSearching = useRecoilValue(store.isSearching);
  const [showStopButton, setShowStopButton] = useRecoilState(store.showStopButtonByIndex(index));
  const [showPlusPopover, setShowPlusPopover] = useRecoilState(store.showPlusPopoverFamily(index));
  const [showMentionPopover, setShowMentionPopover] = useRecoilState(
    store.showMentionPopoverFamily(index),
  );

  const chatDirection = useRecoilValue(store.chatDirection).toLowerCase();
  const isRTL = chatDirection === 'rtl';

  const { requiresKey } = useRequiresKey();
  const handleKeyUp = useHandleKeyUp({
    index,
    textAreaRef,
    setShowPlusPopover,
    setShowMentionPopover,
  });
  const { handlePaste, handleKeyDown, handleCompositionStart, handleCompositionEnd } = useTextarea({
    textAreaRef,
    submitButtonRef,
    disabled: !!(requiresKey ?? false),
  });

  const {
    files,
    setFiles,
    conversation,
    isSubmitting,
    filesLoading,
    newConversation,
    handleStopGenerating,
  } = useChatContext();
  const methods = useChatFormContext();
  const {
    addedIndex,
    generateConversation,
    conversation: addedConvo,
    setConversation: setAddedConvo,
    isSubmitting: isSubmittingAdded,
  } = useAddedChatContext();
  const showStopAdded = useRecoilValue(store.showStopButtonByIndex(addedIndex));

  const { clearDraft } = useAutoSave({
    conversationId: useMemo(() => conversation?.conversationId, [conversation]),
    textAreaRef,
    files,
    setFiles,
  });

  const assistantMap = useAssistantsMapContext();
  const { submitMessage, submitPrompt } = useSubmitMessage({ clearDraft });

  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: null };
  const endpoint = endpointType ?? _endpoint;

  const invalidAssistant = useMemo(
    () =>
      conversation?.endpoint === 'assistants' &&
      (!(conversation?.assistant_id ?? '') ||
        !assistantMap?.[conversation?.endpoint ?? ''][conversation?.assistant_id ?? '']),
    [conversation?.assistant_id, conversation?.endpoint, assistantMap],
  );
  const disableInputs = useMemo(
    () => !!((requiresKey ?? false) || invalidAssistant),
    [requiresKey, invalidAssistant],
  );

  const { ref, ...registerProps } = methods.register('text', {
    required: true,
    onChange: (e) => {
      methods.setValue('text', e.target.value, { shouldValidate: true });
    },
  });

  useEffect(() => {
    if (!isSearching && textAreaRef.current && !disableInputs) {
      textAreaRef.current.focus();
    }
  }, [isSearching, disableInputs]);

  const showWebSearchToggle = import.meta.env.VITE_PERPLEXICA_SEARCH_PROMPT === 'true';

  const baseClasses =
    'md:py-3.5 m-0 w-full resize-none bg-surface-tertiary py-[13px] placeholder-black/50 dark:placeholder-white/50 [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] max-h-[65vh] md:max-h-[75vh]';

  const speechClass = isRTL ? 'pr-4 pl-12' : 'pl-12 pr-12';

  const handleSubmit = (data: { text: string }) => {
    const message = {
      ...data,
      ...(showWebSearchToggle ? { webSearch } : {}),
    };
    console.log('Submitting message with data:', message);
    submitMessage(message);
  };

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
    >
      <div className="relative flex h-full flex-1 items-stretch md:flex-col">
        <div className="flex w-full items-center">
          {showPlusPopover && conversation?.endpoint !== 'assistants' && (
            <Mention
              setShowMentionPopover={setShowPlusPopover}
              newConversation={generateConversation}
              textAreaRef={textAreaRef}
              commandChar="+"
              placeholder="com_ui_add_model_preset"
              includeAssistants={false}
            />
          )}
          {showMentionPopover && (
            <Mention
              setShowMentionPopover={setShowMentionPopover}
              newConversation={newConversation}
              textAreaRef={textAreaRef}
            />
          )}
          <PromptsCommand index={index} textAreaRef={textAreaRef} submitPrompt={submitPrompt} />
          <div className="transitional-all relative flex w-full flex-grow flex-col overflow-hidden rounded-3xl bg-surface-tertiary text-text-primary duration-200">
            {showWebSearchToggle && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1D21] border-b border-[#2F3336] text-sm">
                <Switch
                  id="web-search"
                  checked={webSearch}
                  onCheckedChange={setWebSearch}
                  className="data-[state=checked]:bg-blue-500"
                />
                <label htmlFor="web-search" className="text-gray-300">Web Search</label>
              </div>
            )}
            <TextareaHeader addedConvo={addedConvo} setAddedConvo={setAddedConvo} />
            <FileFormWrapper disableInputs={disableInputs}>
              {endpoint && (
                <TextareaAutosize
                  {...registerProps}
                  ref={(e) => {
                    ref(e);
                    textAreaRef.current = e;
                  }}
                  disabled={disableInputs}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  id={mainTextareaId}
                  tabIndex={0}
                  data-testid="text-input"
                  style={{ height: 44, overflowY: 'auto' }}
                  rows={1}
                  className={cn(baseClasses, speechClass, removeFocusRings)}
                />
              )}
            </FileFormWrapper>
            {SpeechToText && (
              <AudioRecorder
                disabled={!!disableInputs}
                textAreaRef={textAreaRef}
                ask={submitMessage}
                isRTL={isRTL}
                methods={methods}
              />
            )}
            {TextToSpeech && automaticPlayback && <StreamAudio index={index} />}
          </div>
          <div
            className={cn(
              'mb-[5px] ml-[8px] flex flex-col items-end justify-end',
              isRTL && 'order-first mr-[8px]',
            )}
            style={{ alignSelf: 'flex-end' }}
          >
            {(isSubmitting || isSubmittingAdded) && (showStopButton || showStopAdded) ? (
              <StopButton stop={handleStopGenerating} setShowStopButton={setShowStopButton} />
            ) : (
              endpoint && (
                <SendButton
                  ref={submitButtonRef}
                  control={methods.control}
                  disabled={!!(filesLoading || isSubmitting || disableInputs)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default memo(ChatForm);
