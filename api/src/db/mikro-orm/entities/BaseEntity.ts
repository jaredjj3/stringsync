import { BeforeCreate, BeforeUpdate, EntityManager } from '@mikro-orm/core';
import { validate } from 'class-validator';
import { ValidationError } from '../../../errors';

export type BaseEntityOpts = {
  em?: EntityManager;
};

export abstract class BaseEntity {
  em?: EntityManager;

  constructor(opts: BaseEntityOpts) {
    this.em = opts.em;
  }

  async isValid(): Promise<boolean> {
    const errors = await this.errors();
    return errors.length === 0;
  }

  async errors(): Promise<string[]> {
    const errors = await validate(this);
    return errors.flatMap((error) => (error.constraints ? Object.values(error.constraints) : []));
  }

  @BeforeCreate()
  @BeforeUpdate()
  async validate() {
    const details = await this.errors();
    if (details.length > 0) {
      throw new ValidationError(details);
    }
  }
}
