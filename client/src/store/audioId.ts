import { atom } from 'recoil';

export const audioIdState = atom<string | null>({
  key: 'audioIdState',
  default: null,
});
