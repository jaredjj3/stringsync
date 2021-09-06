import { get, isNumber } from 'lodash';
import { CursorPointerTarget, CursorSnapshotPointerTarget, NonePointerTarget, PointerTargetType } from './types';

type UnknownTarget = {
  type: PointerTargetType;
};

type Seekable = UnknownTarget & {
  timeMs: number;
};

export const isNonePointerTarget = (target: UnknownTarget): target is NonePointerTarget => {
  return target.type === PointerTargetType.None;
};

export const isCursorPointerTarget = (target: UnknownTarget): target is CursorPointerTarget => {
  return target.type === PointerTargetType.Cursor;
};

export const isCursorSnapshotPointerTarget = (target: UnknownTarget): target is CursorSnapshotPointerTarget => {
  return target.type === PointerTargetType.CursorSnapshot;
};

export const isSeekable = (target: UnknownTarget): target is Seekable => {
  return isNumber(get(target, 'timeMs'));
};
