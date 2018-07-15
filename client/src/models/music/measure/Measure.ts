import { Bar, Note, Rest, Line, Chord } from 'models/music';
import { VextabStruct, VextabMeasureSpec } from 'models/vextab';
import { compact, get } from 'lodash';

export type MeasureElement = Note | Rest | Bar | Chord;

export class Measure {
  public static tickableTypes = ['NOTE', 'CHORD', 'REST'];

  public readonly spec: any;
  public readonly rawStruct: Vextab.ParsedStruct[];
  public readonly id: number;
  public readonly type = 'MEASURE';

  public line: Line | void;

  public elements: MeasureElement[];

  constructor(elements: MeasureElement[], id: number, spec: VextabMeasureSpec) {
    if (elements[0].type !== 'BAR') {
      throw new Error(`expected the first element to have type BAR, got: ${elements[0].type}`);
    }
    
    this.id = id;
    this.elements = elements;
    this.spec = spec;

    this.rawStruct = this.getRawStruct();
  }

  public get tickables(): MeasureElement[] {
    const tickableTypes = new Set(Measure.tickableTypes);
    return this.elements.filter(element => tickableTypes.has(element.type));
  }

  private getRawStruct(): Vextab.ParsedStruct[] {
    return compact(this.elements.map(element => get(element, 'struct.raw')));
  }
};
