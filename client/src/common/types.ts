export interface AudioState {
  audioId: string | null;
}

export enum PromptsEditorMode {
  Create = 'create',
  Edit = 'edit',
  View = 'view'
}

export interface TShowToast {
  message: string;
  severity?: NotificationSeverity;
  showIcon?: boolean;
  duration?: number;
  status?: NotificationSeverity;
}

export enum NotificationSeverity {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
  default: boolean;
}

// Assuming TAskFunction and ExtendedFile are defined as follows
export type TAskFunction = (params: {
  text: string;
  overrideConvoId?: string;
  overrideUserMessageId?: string;
  parentMessageId?: string;
  conversationId?: string;
  messageId?: string;
}, options?: {
  editedText?: string;
  editedMessageId?: string;
  resubmitFiles?: boolean;
  isRegenerate?: boolean;
  isContinued?: boolean;
  isEdited?: boolean;
  overrideMessages?: any[];
}) => void;

export interface ExtendedFile {
  file_id: string;
  filepath: string;
  type?: string;
  height?: number;
  width?: number;
}
