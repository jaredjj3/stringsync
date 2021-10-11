import { useMemo } from 'react';
import { MusicDisplay } from '../../lib/MusicDisplay';
import { NotationPlayerSettings } from './useNotationPlayerSettings';

export type ScrollControls = {
  startPreferredScrolling: () => void;
};

export const useMusicDisplayScrollControls = (musicDisplay: MusicDisplay | null, settings: NotationPlayerSettings) => {
  return useMemo(
    () => ({
      startPreferredScrolling: () => {
        if (!musicDisplay) {
          return;
        }
        if (settings.isAutoscrollPreferred) {
          musicDisplay.getScroller().startAutoScrolling();
          musicDisplay.getCursor().scrollIntoView();
        } else {
          musicDisplay.getScroller().disable();
        }
      },
    }),
    [musicDisplay, settings.isAutoscrollPreferred]
  );
};
