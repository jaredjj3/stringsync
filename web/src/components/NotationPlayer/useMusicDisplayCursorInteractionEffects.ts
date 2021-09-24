import { useEffect } from 'react';
import { MusicDisplay } from '../../lib/MusicDisplay';
import { isTemporal } from '../../lib/MusicDisplay/pointer/pointerTypeAssert';
import { MusicDisplayScrollControls } from './useMusicDisplayScrollControls';
import { VideoPlayerControls } from './useVideoPlayerControls';

export const useMusicDisplayCursorInteractionEffects = (
  musicDisplay: MusicDisplay | null,
  videoPlayerControls: VideoPlayerControls,
  scrollControls: MusicDisplayScrollControls
) => {
  useEffect(() => {
    if (!musicDisplay) {
      return;
    }

    const eventBusIds = [
      musicDisplay.eventBus.subscribe('cursordragstarted', (payload) => {
        musicDisplay.scroller.startManualScrolling();
        videoPlayerControls.suspend();
      }),
      musicDisplay.eventBus.subscribe('cursordragupdated', (payload) => {
        musicDisplay.scroller.updateScrollIntent(payload.dst.position.relY);
        if (!isTemporal(payload.dst)) {
          return;
        }
        if (!musicDisplay.loop.timeMsRange.contains(payload.dst.timeMs)) {
          musicDisplay.loop.deactivate();
        }
        videoPlayerControls.seek(payload.dst.timeMs);
      }),
      musicDisplay.eventBus.subscribe('cursordragended', (payload) => {
        scrollControls.startPreferentialScrolling();
        videoPlayerControls.unsuspend();
      }),
    ];

    return () => {
      musicDisplay.eventBus.unsubscribe(...eventBusIds);
    };
  }, [musicDisplay, videoPlayerControls, scrollControls]);
};
