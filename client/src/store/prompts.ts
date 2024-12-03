import { atom } from 'recoil';
import { atomWithLocalStorage } from '~/store/utils';
import { PromptsEditorMode } from '~/common/types';

// Static atoms without localStorage
export const promptsName = atom<string>({ key: 'promptsName', default: '' });
export const promptsCategory = atom<string>({ key: 'promptsCategory', default: '' });
export const promptsPageNumber = atom<number>({ key: 'promptsPageNumber', default: 1 });
export const promptsPageSize = atom<number>({ key: 'promptsPageSize', default: 10 });

// Atoms with localStorage
export const autoSendPrompts = atomWithLocalStorage('autoSendPrompts', true);
export const alwaysMakeProd = atomWithLocalStorage('alwaysMakeProd', true);
// Editor mode
export const promptsEditorMode = atomWithLocalStorage<PromptsEditorMode>(
  'promptsEditorMode',
  PromptsEditorMode.Create,
);
