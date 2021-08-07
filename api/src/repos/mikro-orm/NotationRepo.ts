import { EntityManager, QueryOrder } from '@mikro-orm/core';
import { inject, injectable } from 'inversify';
import { get } from 'lodash';
import { Db, NotationEntity } from '../../db';
import { Notation } from '../../domain';
import { NotFoundError } from '../../errors';
import { TYPES } from '../../inversify.constants';
import { Connection, NotationConnectionArgs, Pager, PagingCtx, PagingType } from '../../util';
import { findNotationPageMaxQuery, findNotationPageMinQuery, findNotationPageQuery } from '../queries';
import { NotationLoader, NotationRepo as INotationRepo } from '../types';
import { em } from './em';

@injectable()
export class NotationRepo implements INotationRepo {
  static pager = new Pager<Notation>(10, 'notation');

  em: EntityManager;

  constructor(@inject(TYPES.NotationLoader) private notationLoader: NotationLoader, @inject(TYPES.Db) private db: Db) {
    this.em = em(this.db);
  }

  async findAllByTranscriberId(transcriberId: string): Promise<Notation[]> {
    return await this.notationLoader.findAllByTranscriberId(transcriberId);
  }

  async findAllByTag(tagId: string): Promise<Notation[]> {
    return await this.notationLoader.findAllByTagId(tagId);
  }

  async count(): Promise<number> {
    return await this.em.count(NotationEntity);
  }

  async validate(notation: Notation): Promise<void> {
    await new NotationEntity(notation).validate();
  }

  async find(id: string): Promise<Notation | null> {
    return await this.notationLoader.findById(id);
  }

  async findAll(): Promise<Notation[]> {
    return await this.em.find(NotationEntity, {}, { orderBy: { cursor: QueryOrder.DESC } });
  }

  async findAllByTagId(tagId: string): Promise<Notation[]> {
    return await this.notationLoader.findAllByTagId(tagId);
  }

  async create(attrs: Partial<Notation>) {
    return this.em.create(NotationEntity, attrs);
  }

  async bulkCreate(bulkAttrs: Partial<Notation>[]): Promise<Notation[]> {
    const notations = bulkAttrs.map((attrs) => new NotationEntity(attrs));
    this.em.persist(notations);
    await this.em.flush();
    return notations;
  }

  async update(id: string, attrs: Partial<Notation>): Promise<Notation> {
    const notation = await this.find(id);
    if (!notation) {
      throw new NotFoundError('notation not found');
    }
    this.em.assign(notation, attrs);
    this.em.persist(notation);
    await this.em.flush();
    return notation;
  }

  async findPage(args: NotationConnectionArgs): Promise<Connection<Notation>> {
    const tagIds = args.tagIds || null;
    const query = args.query ? `%${args.query}%` : null;

    return await NotationRepo.pager.connect(args, async (pagingCtx: PagingCtx) => {
      const { cursor, limit, pagingType } = pagingCtx;
      const queryArgs = { cursor, pagingType, limit, query, tagIds };

      const [entityRows, minRows, maxRows] = await Promise.all([
        this.db.query<Notation>(findNotationPageQuery(queryArgs)),
        this.db.query<number>(findNotationPageMinQuery(queryArgs)),
        this.db.query<number>(findNotationPageMaxQuery(queryArgs)),
      ]);

      const entities = entityRows;
      if (pagingType === PagingType.BACKWARD) {
        entities.reverse();
      }

      const min = get(minRows, '[0].min') || -Infinity;
      const max = get(maxRows, '[0].max') || +Infinity;

      return { entities, min, max };
    });
  }
}
