import React from 'react';
import { useDynamicScaleSync } from '../hooks/useDynamicScaleSync';
import { useMediaPlayerVolumeBehavior } from '../hooks/useMediaPlayerVolumeBehavior';
import { useMusicDisplayCursorInteractions } from '../hooks/useMusicDisplayCursorInteractions';
import { useMusicDisplayCursorTimeSync } from '../hooks/useMusicDisplayCursorTimeSync';
import { useMusicDisplayLoopBehavior } from '../hooks/useMusicDisplayLoopBehavior';
import { useMusicDisplayPointerInteractions } from '../hooks/useMusicDisplayPointerInteractions';
import { useMusicDisplayRipples } from '../hooks/useMusicDisplayRipples';
import { useMusicDisplayScrolling } from '../hooks/useMusicDisplayScrolling';
import { MediaPlayer } from '../lib/MediaPlayer';
import { MusicDisplay } from '../lib/MusicDisplay';
import * as notations from '../lib/notations';

type Props = {
  settings: notations.Settings;
  setSettings: React.Dispatch<React.SetStateAction<notations.Settings>>;
  musicDisplay: MusicDisplay;
  mediaPlayer: MediaPlayer;
};

/**
 * A component that runs MusicDisplay and MediaPlayer events.
 *
 * This is an optimization that prevents React from re-rendering and diffing a vdom too much.
 *
 * @param props
 * @returns
 */
export const NotationSink: React.FC<Props> = (props) => {
  // props
  const settings = props.settings;
  const setSettings = props.setSettings;
  const musicDisplay = props.musicDisplay;
  const mediaPlayer = props.mediaPlayer;

  useMusicDisplayPointerInteractions(musicDisplay, mediaPlayer);
  useMusicDisplayRipples(musicDisplay);
  useMusicDisplayScrolling(settings, musicDisplay, mediaPlayer);
  useMusicDisplayLoopBehavior(settings, setSettings, musicDisplay, mediaPlayer);
  useMusicDisplayCursorInteractions(musicDisplay, mediaPlayer);
  useMusicDisplayCursorTimeSync(musicDisplay, mediaPlayer);
  useDynamicScaleSync(settings, setSettings, musicDisplay);
  useMediaPlayerVolumeBehavior(mediaPlayer);

  return null;
};
