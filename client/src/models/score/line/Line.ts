import { Measure } from './measure';
import { last } from 'lodash';
import { Note } from './measure/note/Note';
import { SVGExtractor } from '../SVGExtractor';

export class Line {
  public readonly stave: any;
  public readonly index: number;

  public graphic: any;
  public measures: Measure[] = [];

  constructor(stave: any, index: number) {
    this.stave = stave;
    this.index = index;
  }

  public hydrate(extractor: SVGExtractor, noteOffset: number): Measure[] {
    this.graphic = extractor.getStaveLine(this.index);

    const noteNotes: any[] = this.stave.note_notes;
    const tabNotes: any[] = this.stave.tab_notes;

    const expectedNumNoteGraphics = noteNotes.filter(noteNote => !Note.isBar(noteNote)).length;
    const noteGraphics = extractor.getStaveNotes(noteOffset, noteOffset + expectedNumNoteGraphics);

    if (noteNotes.length !== tabNotes.length) {
      throw new Error('expected note_notes and tab_notes to be the same length');
    }

    // Create elementary versions of measures
    let noteGraphicNdx = 0;
    const noteGroups = noteNotes.reduce((groups, noteNote, ndx) => {
      if (Note.isBar(noteNote)) {
        // new measure
        groups.push([]);
        return groups;
      }

      const group = last<Note[]>(groups);
      if (!group) {
        throw new Error('expected a group to compute measures');
      }

      const noteGraphic = noteGraphics[noteGraphicNdx++];
      group.push(new Note(noteNote, tabNotes[ndx], noteGraphic));

      return groups;
    }, [] as Note[]);

    // Create the measure
    return this.measures = noteGroups.map(notes => new Measure(notes));
  }
}
