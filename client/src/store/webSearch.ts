import { atom } from 'recoil';

export const webSearchState = atom<boolean>({
  key: 'webSearchState',
  default: false,
});
