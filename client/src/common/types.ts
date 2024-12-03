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
