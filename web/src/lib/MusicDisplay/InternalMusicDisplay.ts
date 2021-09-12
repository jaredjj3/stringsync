import { get, set, takeRight } from 'lodash';
import {
  BackendType,
  Cursor,
  CursorOptions,
  CursorType,
  OpenSheetMusicDisplay,
  SvgVexFlowBackend,
  VexFlowBackend,
} from 'opensheetmusicdisplay';
import { LerpCursor } from './LerpCursor';
import { LerpLoop, Loop, NoopLoop } from './Loop';
import { MusicDisplayLocator } from './MusicDisplayLocator';
import { NoopCursor } from './NoopCursor';
import { EphemeralRenderer, SelectionRenderer } from './renderers';
import { Scroller } from './Scroller';
import { SVGEventProxy } from './SVGEventProxy';
import { CursorWrapper, MusicDisplayEventBus, MusicDisplayOptions, SVGSettings, SyncSettings } from './types';

type IdentifiableCursorOptions = CursorOptions & {
  id: symbol;
};

type WithProbeCursorCallback = (probeCursor: Cursor) => void;

type ForEachCursorPositionCallback = (index: number, probeCursor: Cursor) => void;

const isSvgBackend = (backend: VexFlowBackend | undefined): backend is SvgVexFlowBackend => {
  return !!backend && backend.getOSMDBackendType() === BackendType.SVG;
};

/**
 * InternalMusicDisplay handles the logic involving rendering notations and cursors.
 *
 * The reason why this extends OpenSheetMusicDisplay (inheritance) instead of simply having an OpenSheetMusicDisplay
 * instance (composition) is because OpenSheetMusicDisplay has protected methods that we need access to. This
 * has some undesired side effects like callers being able to call whatever they want.
 *
 * Callers should instantiate a MusicDisplay object instead.
 */
export class InternalMusicDisplay extends OpenSheetMusicDisplay {
  scrollContainer: HTMLDivElement;
  syncSettings: SyncSettings;
  svgSettings: SVGSettings;
  cursorWrapper: CursorWrapper = new NoopCursor();
  loop: Loop = new NoopLoop();
  eventBus: MusicDisplayEventBus;
  svgEventProxy: SVGEventProxy | null = null;
  scroller: Scroller;
  selectionRenderer: SelectionRenderer | null = null;
  ephemeralRenderer: EphemeralRenderer | null = null;

  constructor(container: string | HTMLElement, eventBus: MusicDisplayEventBus, opts: MusicDisplayOptions) {
    super(container, opts);

    this.eventBus = eventBus;
    this.syncSettings = opts.syncSettings;
    this.svgSettings = opts.svgSettings;
    this.scrollContainer = opts.scrollContainer;
    this.scroller = new Scroller(opts.scrollContainer, this);
    this.handleResize(this.onResizeStart.bind(this), this.onResizeEnd.bind(this));

    (window as any).imd = this;
  }

  async load(xmlUrl: string) {
    this.eventBus.dispatch('loadstarted', {});
    try {
      return await super.load(xmlUrl);
    } finally {
      this.eventBus.dispatch('loadended', {});
    }
  }

  render() {
    super.render();

    this.clearCursors();

    const locator = MusicDisplayLocator.create(this);

    this.cursorWrapper = LerpCursor.create(this, locator.clone(), {
      numMeasures: this.Sheet.SourceMeasures.length,
      scrollContainer: this.scrollContainer,
      isNoteheadColoringEnabled: true,
    });

    this.svgEventProxy = SVGEventProxy.install(this, locator.clone(), this.svgSettings);

    this.loop = LerpLoop.create(this, locator.clone());

    this.selectionRenderer = SelectionRenderer.create(this, locator.clone());

    this.ephemeralRenderer = EphemeralRenderer.create(this);
  }

  clear() {
    super.clear();
    this.cursorWrapper.clear();
    this.loop.deactivate();
    this.scroller.disable();
    this.svgEventProxy?.uninstall();
    this.selectionRenderer?.clear();
    this.getSvg().remove();
  }

  getSvg() {
    const backend = this.Drawer.Backends[0];
    if (!isSvgBackend(backend)) {
      throw new Error('expected the first backend to be an svg backend');
    }
    return backend.getSvgElement();
  }

  clearCursors() {
    const cursorOptions = new Array<IdentifiableCursorOptions>();
    set(this, 'cursorsOptions', cursorOptions);
    this.applyCursorOptions(cursorOptions);
  }

  createCursors(additionalCursorOptions: IdentifiableCursorOptions[]): Cursor[] {
    const cursorsOptions = get(this, 'cursorsOptions', []);
    const nextCursorOptions = [...cursorsOptions, ...additionalCursorOptions];
    this.applyCursorOptions(nextCursorOptions);
    return takeRight(this.cursors, additionalCursorOptions.length);
  }

  removeCursor(id: symbol) {
    const cursorsOptions = get(this, 'cursorsOptions', []);
    const cursorIndex = cursorsOptions.findIndex((opt: IdentifiableCursorOptions) => opt.id === id);

    if (cursorIndex > -1) {
      const cursor = this.cursors[cursorIndex];
      if (cursor) {
        cursor.cursorElement.remove();
      }
    }

    const nextCursorOptions = cursorsOptions.filter((opt: IdentifiableCursorOptions) => opt.id !== id);
    this.applyCursorOptions(nextCursorOptions);
  }

  enableCursors() {
    this.enableOrDisableCursors(true);
  }

  disableCursors() {
    this.enableOrDisableCursors(false);
  }

  withProbeCursor(callback: WithProbeCursorCallback) {
    const cursorOption = {
      id: Symbol(),
      type: CursorType.Standard,
      color: 'black',
      follow: false,
      alpha: 0,
    };

    const [probeCursor] = this.createCursors([cursorOption]);

    try {
      probeCursor.show();
      callback(probeCursor);
    } finally {
      this.removeCursor(cursorOption.id);
    }
  }

  forEachCursorPosition(callback: ForEachCursorPositionCallback) {
    this.withProbeCursor((probeCursor) => {
      let index = 0;
      while (!probeCursor.iterator.EndReached) {
        callback(index, probeCursor);
        probeCursor.next();
        index++;
      }
    });
  }

  private onResizeStart() {
    this.eventBus.dispatch('resizestarted', {});
  }

  private onResizeEnd() {
    this.eventBus.dispatch('resizeended', {});
  }

  private applyCursorOptions(nextCursorOptions: IdentifiableCursorOptions[]) {
    const wasEnabled = this.drawingParameters.drawCursors;

    // Transforms cursor options to cursors.
    set(this, 'cursorsOptions', nextCursorOptions);
    this.cursors = [];
    this.enableCursors();

    if (!wasEnabled) {
      this.disableCursors();
    }
  }
}
