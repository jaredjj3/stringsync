import { Notation, Tag, User } from '../../domain';
import { DisplayMode } from '../../lib/MusicDisplay';

export type NotationLayout = 'theater' | 'sidecar';

export type NotationLayoutOptions = {
  target: NotationLayout;
  permitted: NotationLayout[];
};

export type RenderableNotation = Pick<
  Notation,
  'id' | 'musicXmlUrl' | 'thumbnailUrl' | 'videoUrl' | 'deadTimeMs' | 'durationMs' | 'artistName' | 'songName'
> & {
  transcriber: Pick<User, 'username'>;
  tags: Tag[];
};

export enum FretMarkerDisplay {
  None,
  Degree,
  Note,
}

export enum ScaleSelectionType {
  None,
  Dynamic,
  User,
  Random,
}

export type NotationSettings = {
  preferredLayout: NotationLayout;
  isFretboardVisible: boolean;
  fretMarkerDisplay: FretMarkerDisplay;
  isAutoscrollPreferred: boolean;
  isVideoVisible: boolean;
  scaleSelectionType: ScaleSelectionType;
  selectedScale: string | null;
  isLoopActive: boolean;
  defaultTheaterHeightPx: number;
  defaultSidecarWidthPx: number;
  displayMode: DisplayMode;
};
