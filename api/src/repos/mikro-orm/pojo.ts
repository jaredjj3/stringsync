import { wrap } from '@mikro-orm/core';
import { isNull } from 'lodash';
import { BaseEntity } from '../../db/mikro-orm';

export function pojo(value: null): null;
export function pojo<T extends BaseEntity>(value: T): T;
export function pojo<T extends BaseEntity>(value: T[]): T[];
export function pojo<T extends BaseEntity>(value: T | T[] | null): T | T[] | null {
  if (isNull(value)) {
    return null;
  } else if (Array.isArray(value)) {
    return value.map((v) => wrap(v).toObject(v.associations)) as T[];
  } else {
    return wrap(value).toObject(value.associations) as T;
  }
}
