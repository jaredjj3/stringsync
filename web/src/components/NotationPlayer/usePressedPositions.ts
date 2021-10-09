import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { VideoJsPlayer } from 'video.js';
import { Position } from '../../lib/guitar/Position';
import { CursorSnapshot } from '../../lib/MusicDisplay/locator';
import { AsyncLoop } from '../../util/AsyncLoop';
import { Duration } from '../../util/Duration';
import { NumberRange } from '../../util/NumberRange';
import { useVideoPlayerState, VideoPlayerState } from './useVideoPlayerState';

const FLASH_REGION_FRACTION = 0.125;
const MAX_FLASH_DURATION = Duration.ms(50);

const computeIsInFlashRegion = (currentTimeMs: number, cursorSnapshot: CursorSnapshot | null): boolean => {
  if (!cursorSnapshot) {
    return false;
  }
  const size = Math.min(MAX_FLASH_DURATION.ms, cursorSnapshot.getTimeMsRange().size * FLASH_REGION_FRACTION);
  const start = cursorSnapshot.getTimeMsRange().start;
  const end = start + size;
  const range = NumberRange.from(start).to(end);
  return range.contains(currentTimeMs);
};

/**
 * Returns an array of positions that are considered pressed based on a cursor snapshot.
 *
 * When two adjacent cursor snapshots have overlapping notes, it may be difficult for the
 * user to see a transition that corresponds to the notes. As a remedy, this hook will
 * take care of "flashing" adjecent positions, so that it's obvious that a position is being
 * re-pressed.
 *
 * However, when the video player is not playing, we don't want the positions to flash. So,
 * when the video player is not playing, the positions will not be filtered.
 */
export const usePressedPositions = (cursorSnapshot: CursorSnapshot | null, videoPlayer: VideoJsPlayer | null) => {
  const [pressedPositions, setPressedPositions] = useState(() =>
    cursorSnapshot ? cursorSnapshot.getGuitarPositions() : []
  );
  const [isInFlashRegion, setIsInFlashRegion] = useState(false);
  const videoPlayerState = useVideoPlayerState(videoPlayer);
  const isPlaying = videoPlayerState === VideoPlayerState.Playing;

  useEffect(() => {
    if (!videoPlayer) {
      return;
    }

    const loop = new AsyncLoop(
      () => {
        try {
          const currentTimeMs = Duration.sec(videoPlayer.currentTime()).ms;
          setIsInFlashRegion(computeIsInFlashRegion(currentTimeMs, cursorSnapshot));
        } catch (e) {}
      },
      videoPlayer.requestAnimationFrame.bind(videoPlayer),
      videoPlayer.cancelAnimationFrame.bind(videoPlayer)
    );

    videoPlayer.ready(() => {
      loop.start();
    });

    return () => {
      loop.stop();
    };
  }, [videoPlayer, cursorSnapshot]);

  useEffect(() => {
    let nextPressedPositions = cursorSnapshot ? cursorSnapshot.getGuitarPositions() : [];

    if (isPlaying && isInFlashRegion && cursorSnapshot && cursorSnapshot.prev) {
      const prevPositionLookup = cursorSnapshot.prev
        .getGuitarPositions()
        .reduce<Record<number, Record<number, true>>>((memo, position) => {
          memo[position.fret] = memo[position.fret] || {};
          memo[position.fret][position.string] = true;
          return memo;
        }, {});

      const wasPreviouslyPressed = (position: Position): boolean => {
        return !!(prevPositionLookup[position.fret] && prevPositionLookup[position.fret][position.string]);
      };

      nextPressedPositions = nextPressedPositions.filter((position) => !wasPreviouslyPressed(position));
    }

    setPressedPositions((currentPressedPositions) => {
      return isEqual(currentPressedPositions, nextPressedPositions) ? currentPressedPositions : nextPressedPositions;
    });
  }, [cursorSnapshot, isInFlashRegion, isPlaying]);

  return pressedPositions;
};
