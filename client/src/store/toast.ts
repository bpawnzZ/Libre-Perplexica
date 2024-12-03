import { atom } from 'recoil';

export const toastState = atom({
  key: 'toastState',
  default: {
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    showIcon: true,
  },
});
