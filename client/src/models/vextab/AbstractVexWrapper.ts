import { VextabStruct } from 'models/vextab';

export interface IVexAttrs {
  staveNote: Vex.Flow.StaveNote | Vex.Flow.BarNote;
  tabNote: Vex.Flow.TabNote | Vex.Flow.BarNote;
}

/**
 * Extending this class indicates that the child class has properties related to Vexflow\
 * and Vextab.
 */
export abstract class AbstractVexWrapper {
  public struct: VextabStruct | null;
  public vexAttrs: IVexAttrs | null = null;

  constructor(struct: VextabStruct | null) {
    this.struct = struct;
  }

  /**
   * This function is called after the VextabGenerator creates Vexflow (not Vextab) elements.
   * Using any number of arbitrary arguments, it must set the vexAttrs variable.
   */
  public abstract hydrate(...args: any[]): void;

  public get isHydrated(): boolean {
    return this.vexAttrs !== null;
  }

  public get isHydratable(): boolean {
    return this.struct instanceof VextabStruct;
  }
}