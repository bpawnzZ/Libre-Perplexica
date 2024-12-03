import { useRecoilState } from 'recoil';
import { audioIdState } from '~/store/audioId'; // Adjust path based on your project structure
import { AudioState } from '~/common/types'; // Adjust path based on your project structure

function usePauseGlobalAudio(index = 0) {
  const [audioId, setAudioId] = useRecoilState(audioIdState);

  const pauseGlobalAudio = () => {
    if (audioId !== null && audioId !== index.toString()) {
      setAudioId(null);
    }
  };

  const setGlobalAudioId = () => {
    setAudioId(index.toString());
  };

  return {
    pauseGlobalAudio,
    setGlobalAudioId,
  };
}

export default usePauseGlobalAudio;
