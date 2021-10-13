import { IOSMDOptions } from 'opensheetmusicdisplay';
import { EventBus } from '../EventBus';
import { CursorSnapshot, SyncSettings } from './locator';
import { Loop } from './loop';
import {
  CursorPointerTarget,
  CursorSnapshotPointerTarget,
  NonePointerTarget,
  PointerTarget,
  SelectionPointerTarget,
} from './pointer';
import { ScrollBehaviorType } from './scroller';
import { SVGSettings } from './svg';

export type MusicDisplayOptions = IOSMDOptions & {
  syncSettings: SyncSettings;
  scrollContainer: HTMLDivElement;
  svgSettings: SVGSettings;
};

export type MusicDisplayEventBus = EventBus<{
  click: { src: PointerTarget };
  cursordragstarted: { src: CursorPointerTarget };
  cursordragupdated: { src: CursorPointerTarget; dst: PointerTarget };
  cursordragended: { src: CursorPointerTarget; dst: PointerTarget };
  cursorentered: { src: CursorPointerTarget };
  cursorexited: { src: CursorPointerTarget };
  cursorsnapshotchanged: { cursorSnapshot: CursorSnapshot | null };
  cursorsnapshotentered: { src: CursorSnapshotPointerTarget };
  cursorsnapshotexited: { src: CursorSnapshotPointerTarget };
  externalscrolldetected: {};
  interactablemoved: {};
  loadended: {};
  loadstarted: {};
  longpress: { src: PointerTarget };
  loopactivated: { loop: Loop };
  loopupdated: { loop: Loop };
  loopdeactivated: { loop: Loop };
  press: { src: PointerTarget };
  measurelinechanged: {};
  rendered: {};
  nummeasureschanged: { numMeasures: number };
  notargetentered: { src: NonePointerTarget };
  notargetexited: { src: NonePointerTarget };
  pointeractive: {};
  pointerdown: { src: PointerTarget };
  pointeridle: {};
  resizeended: {};
  resizestarted: {};
  scrollbehaviorchanged: { type: ScrollBehaviorType };
  selectionentered: { src: SelectionPointerTarget };
  selectionexited: { src: SelectionPointerTarget };
  selectionstarted: { src: PointerTarget };
  selectionupdated: { src: PointerTarget; dst: PointerTarget };
  selectionended: { src: PointerTarget; dst: PointerTarget };
}>;
