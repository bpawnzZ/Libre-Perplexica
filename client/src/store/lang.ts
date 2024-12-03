import { atom } from 'recoil';

export const lang = atom<string>({
  key: 'lang',
  default: 'en', // Default language set to English
});
