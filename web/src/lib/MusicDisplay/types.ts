import { IOSMDOptions, VoiceEntry } from 'opensheetmusicdisplay';
import { NumberRange } from '../../util/NumberRange';
import { EventBus } from '../EventBus';
import { AnchoredTimeSelection } from './AnchoredTimeSelection';
import { IteratorSnapshot } from './IteratorSnapshot';

export type MusicDisplayEventBus = EventBus<{
  loadstarted: {};
  loadended: {};
  resizestarted: {};
  resizeended: {};
  cursorinfochanged: CursorInfo;
  autoscrollstarted: {};
  autoscrollended: {};
  longpress: {};
  click: SVGElementEventMap['click'];
  touchstart: SVGElementEventMap['touchstart'];
  touchmove: SVGElementEventMap['touchmove'];
  touchend: SVGElementEventMap['touchend'];
  mousedown: SVGElementEventMap['mousedown'];
  mousemove: SVGElementEventMap['mousemove'];
  mouseup: SVGElementEventMap['mouseup'];
  cursorentered: { cursor: CursorWrapper };
  cursorexited: { cursor: CursorWrapper };
  cursordragstarted: { cursor: CursorWrapper };
  cursordragupdated: { cursor: CursorWrapper };
  cursordragended: { cursor: CursorWrapper };
  selectionstarted: { selection: AnchoredTimeSelection };
  selectionupdated: { selection: AnchoredTimeSelection };
  selectionended: {};
  voicepointerclicked: { voicePointer: VoicePointer; timeMs: number };
  voicepointerhovered: { voicePointer: VoicePointer; timeMs: number };
}>;

export type SyncSettings = {
  deadTimeMs: number;
  durationMs: number;
};

export interface CursorWrapper {
  element: HTMLElement;
  update(timeMs: number): void;
  clear(): void;
  disableAutoScroll(): void;
  enableAutoScroll(): void;
}

export type Callback = () => void;

export type CursorInfo = {
  currentMeasureIndex: number;
  currentMeasureNumber: number;
  numMeasures: number;
};

export type MusicDisplayOptions = IOSMDOptions & {
  syncSettings: SyncSettings;
  scrollContainer: HTMLDivElement;
};

/**
 * The purpose of this type is to keep track of a value and its
 * position in an array.
 *
 * Index must be tracked because it is the mechanism by which the
 * cursor iterator is set. We store these in an array, which is
 * what distiguishes this data structure from a classic doubly
 * linked list.
 */
export type VoicePointer = {
  index: number;
  next: VoicePointer | null;
  prev: VoicePointer | null;
  iteratorSnapshot: IteratorSnapshot;
  xRange: NumberRange;
  yRange: NumberRange;
  beatRange: NumberRange;
  timeMsRange: NumberRange;
  entries: VoiceEntry[];
};

export enum LocateCost {
  Unknown,
  Cheap,
  Expensive,
}

export type LocateResult = {
  timeMs: number;
  cost: LocateCost;
  voicePointer: Readonly<VoicePointer> | null;
};
