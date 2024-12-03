import { useRecoilValue } from 'recoil';
import { lang } from '~/store/lang';

export const useLocalize = () => {
  const language = useRecoilValue(lang);
  // Assuming localize is a function that takes a string
  const localize = (key: string) => {
    // Implementation of localize function
    return key; // Placeholder implementation
  };

  return localize(language);
};
