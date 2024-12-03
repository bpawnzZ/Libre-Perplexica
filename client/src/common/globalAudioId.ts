import { atom } from 'recoil';

export const globalAudioId = atom<string | null>({
  key: 'globalAudioId',
  default: null,
});
