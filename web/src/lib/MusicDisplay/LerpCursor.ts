import $ from 'jquery';
import { difference, intersection, isString, uniq } from 'lodash';
import { Cursor, CursorOptions, CursorType } from 'opensheetmusicdisplay';
import { UpdateCause } from '.';
import { Box } from '../../util/Box';
import { Duration } from '../../util/Duration';
import { ColoringOperation } from './ColoringOperation';
import { InternalMusicDisplay } from './InternalMusicDisplay';
import { MusicDisplayLocator } from './MusicDisplayLocator';
import { CursorSnapshot } from './types';

const CURSOR_BOX_PADDING_PX = 20;
const CURSOR_STYLE_TRANSITION_DURATION = Duration.ms(250);

const DEFAULT_CURSOR_OPTS = [
  {
    type: CursorType.Standard,
    color: 'blue',
    follow: false,
    alpha: 0,
  },
  {
    type: CursorType.Standard,
    color: 'lime',
    follow: false,
    alpha: 0,
  },
  {
    type: CursorType.ThinLeft,
    color: '#00ffd9',
    follow: false,
    alpha: 1,
  },
];

type Cursors = {
  lagger: Cursor;
  leader: Cursor;
  lerper: Cursor;
};

type LerpCursorStyle = Omit<Record<string, string>, 'top' | 'left' | 'x' | 'y'>;

export type LerpCursorOpts = {
  numMeasures: number;
  cursorOptions?: Partial<Pick<CursorOptions, 'type' | 'color' | 'alpha'>>;
  isNoteheadColoringEnabled: boolean;
  defaultStyle?: LerpCursorStyle;
  interactingStyle?: LerpCursorStyle;
};

export class LerpCursor {
  static create(imd: InternalMusicDisplay, locator: MusicDisplayLocator, opts: LerpCursorOpts) {
    const cursorsOptions = DEFAULT_CURSOR_OPTS.map((cursorsOption) => ({ id: Symbol(), ...cursorsOption }));
    Object.assign(cursorsOptions[2], opts.cursorOptions);
    const cursors = imd.createCursors(cursorsOptions);
    if (cursors.length !== 3) {
      throw new Error(`expected 3 cursors, got: ${cursors.length}`);
    }

    const [lagger, leader, lerper] = cursors;

    const lerpCursor = new LerpCursor(imd, { lagger, leader, lerper }, opts);
    lerpCursor.init(locator);
    return lerpCursor;
  }

  imd: InternalMusicDisplay;

  lagger: Cursor;
  leader: Cursor;
  lerper: Cursor;
  scrollContainer: HTMLElement;
  timeMs = 0;
  cause = UpdateCause.Unknown;
  opts: LerpCursorOpts;

  private locator: MusicDisplayLocator | null = null;
  private prevCursorSnapshot: CursorSnapshot | null = null;
  private prevColoringOperation: ColoringOperation | null = null;

  private constructor(imd: InternalMusicDisplay, cursors: Cursors, opts: LerpCursorOpts) {
    this.imd = imd;
    this.scrollContainer = imd.scrollContainer;
    this.lagger = cursors.lagger;
    this.leader = cursors.leader;
    this.lerper = cursors.lerper;
    this.opts = opts;
  }

  get element() {
    return this.lerper.cursorElement;
  }

  private init(locator: MusicDisplayLocator) {
    const $element = $(this.element);
    $element.css('z-index', 2);
    $element.css('pointer-events', 'none');
    $element.attr('draggable', 'false');

    const defaultStyle = this.opts.defaultStyle || {};
    for (const [prop, value] of Object.entries(defaultStyle)) {
      $element.css(prop, value);
    }

    // get only CSS styles that will transition
    const defaultStyleProps = Object.keys(defaultStyle);
    const interactingStyleProps = Object.keys(this.opts.interactingStyle || {});
    const props = uniq([...defaultStyleProps, ...interactingStyleProps]).join(', ');
    $element.css('transition', `${props} ${CURSOR_STYLE_TRANSITION_DURATION.ms}ms`);

    this.lagger.resetIterator();
    this.leader.resetIterator();
    this.leader.next();
    this.lerper.resetIterator();

    this.lagger.show();
    this.leader.show();
    this.lerper.show();

    this.locator = locator;
  }

  update(timeMs: number, cause = UpdateCause.Unknown) {
    if (!this.locator) {
      console.warn('cannot update cursors, must call init first');
      return;
    }
    if (cause !== this.cause) {
      this.onCauseChange(this.cause, cause);
      this.cause = cause;
    }
    if (timeMs === this.timeMs) {
      return;
    }
    this.timeMs = timeMs;

    const locateResult = this.locator.locateByTimeMs(timeMs);

    const nextCursorSnapshot = locateResult.cursorSnapshot;
    const prevCursorSnapshot = this.prevCursorSnapshot;

    if (nextCursorSnapshot === prevCursorSnapshot) {
      this.updateLerperPosition(locateResult.x);
    } else {
      this.updateCursors(nextCursorSnapshot);
      if (nextCursorSnapshot) {
        this.updateLerperPosition(locateResult.x);
      }
    }

    if (prevCursorSnapshot?.measureLine !== nextCursorSnapshot?.measureLine) {
      this.imd.eventBus.dispatch('measurelinechanged', {});
    }
    this.imd.eventBus.dispatch('interactablemoved', {});
  }

  scrollIntoView() {
    this.imd.scroller.scrollToCursor(this.lerper);
  }

  show() {
    if (this.leader.hidden) {
      this.leader.show();
    }
    if (this.lagger.hidden) {
      this.lagger.show();
    }
    if (this.lerper.hidden) {
      this.lerper.show();
    }
  }

  clear() {
    this.prevColoringOperation?.restore();

    this.leader.hide();
    this.lagger.hide();
    this.lerper.hide();
  }

  getBox(): Box {
    if (this.lerper.hidden) {
      return Box.from(-1, -1).to(-1, -1);
    }

    const leftSidePxStr = this.lerper.cursorElement.style.left;
    const leftSidePx = parseFloat(leftSidePxStr.replace('px', ''));
    if (isNaN(leftSidePx)) {
      return Box.from(-1, -1).to(-1, -1);
    }

    const topSidePxStr = this.lerper.cursorElement.style.top;
    const topSidePx = parseFloat(topSidePxStr.replace('px', ''));
    if (isNaN(leftSidePx)) {
      return Box.from(-1, -1).to(-1, -1);
    }

    const widthPx = this.lerper.cursorElement.width;
    const heightPx = this.lerper.cursorElement.height;
    const rightSidePx = leftSidePx + widthPx;
    const bottomSidePx = topSidePx + heightPx;

    const x0 = Math.max(0, leftSidePx - CURSOR_BOX_PADDING_PX);
    const x1 = Math.max(0, rightSidePx + CURSOR_BOX_PADDING_PX);
    const y0 = Math.max(0, topSidePx - CURSOR_BOX_PADDING_PX);
    const y1 = Math.max(0, bottomSidePx + CURSOR_BOX_PADDING_PX);

    return Box.from(x0, y0).to(x1, y1);
  }

  private onCauseChange(currentCause: UpdateCause, nextCause: UpdateCause) {
    const currentStyle = this.getStyleForCause(currentCause);
    const nextStyle = this.getStyleForCause(nextCause);

    const currentProps = Object.keys(currentStyle);
    const nextProps = Object.keys(nextStyle);

    const removedProps = difference(currentProps, nextProps);
    const changedProps = intersection(currentProps, nextProps);
    const addedProps = difference(nextProps, currentProps);

    const $element = $(this.element);
    for (const prop of removedProps) {
      $element.css(prop, '');
    }
    for (const prop of [...changedProps, ...addedProps]) {
      const value = nextStyle[prop];
      if (isString(value)) {
        $element.css(prop, value);
      }
    }
  }

  private getStyleForCause(cause: UpdateCause): LerpCursorStyle {
    switch (cause) {
      case UpdateCause.Interaction:
        return this.opts.interactingStyle || {};
      default:
        return this.opts.defaultStyle || {};
    }
  }

  private updateCursors(nextCursorSnapshot: CursorSnapshot | null) {
    if (!nextCursorSnapshot) {
      this.clear();
    } else {
      nextCursorSnapshot.iteratorSnapshot.apply(this.lagger);
      nextCursorSnapshot.iteratorSnapshot.apply(this.leader);
      this.leader.next();
      nextCursorSnapshot.iteratorSnapshot.apply(this.lerper);

      this.show();
    }

    this.prevCursorSnapshot = nextCursorSnapshot;

    this.prevColoringOperation?.restore();

    if (nextCursorSnapshot && this.opts.isNoteheadColoringEnabled) {
      const coloringOperation = ColoringOperation.init(this.lagger);
      coloringOperation.perform();
      this.prevColoringOperation = coloringOperation;
    } else {
      this.prevColoringOperation = null;
    }

    this.imd.eventBus.dispatch('cursorinfochanged', {
      currentMeasureIndex: this.lagger.iterator.CurrentMeasureIndex,
      currentMeasureNumber: this.lagger.iterator.CurrentMeasure.MeasureNumber,
      numMeasures: this.opts.numMeasures,
    });
  }

  private updateLerperPosition(x: number) {
    this.element.style.left = `${x}px`;
  }
}
