import { MikroORM, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { inject, injectable } from 'inversify';
import { Config } from '../../config';
import { InternalError } from '../../errors';
import { TYPES } from '../../inversify.constants';
import { camelCaseKeys } from '../../repos/queries';
import { Logger } from '../../util';
import { Db, Orm, Task } from '../types';
import { NotationEntity, TagEntity, TaggingEntity, UserEntity } from './entities';

@injectable()
export class MikroORMDb implements Db {
  ormType = Orm.MikroORM;

  private _orm: MikroORM<PostgreSqlDriver> | undefined = undefined;
  private didInit = false;

  constructor(@inject(TYPES.Logger) private logger: Logger, @inject(TYPES.Config) private config: Config) {}

  async init() {
    if (this.didInit) {
      return;
    }
    this._orm = await MikroORM.init({
      type: 'postgresql',
      host: this.config.DB_HOST,
      port: this.config.DB_PORT,
      dbName: this.config.DB_NAME,
      user: this.config.DB_USERNAME,
      password: this.config.DB_PASSWORD,
      validate: true,
      strict: true,
      namingStrategy: UnderscoreNamingStrategy,
      entities: [TagEntity, TaggingEntity, NotationEntity, UserEntity],
    });
    this.didInit = true;
  }

  get orm(): MikroORM<PostgreSqlDriver> {
    if (typeof this._orm === 'undefined') {
      throw new InternalError('must call init before accessing the orm member');
    }
    return this._orm;
  }

  get em() {
    return this.orm.em;
  }

  async transaction(task: Task) {
    this.orm.em.transactional(async (em) => {
      await task({ type: Orm.MikroORM, em });
    });
  }

  async query<T = unknown>(sql: string): Promise<T[]> {
    const connection = this.orm.em.getConnection();
    const rows = await connection.execute(sql);
    return camelCaseKeys<T>(rows);
  }

  async checkHealth() {
    return await this.orm.isConnected();
  }

  async closeConnection() {
    await this.orm.close(true);
  }

  async cleanup() {
    await this.orm.em.nativeDelete(TagEntity, {});
    await this.orm.em.nativeDelete(TaggingEntity, {});
    await this.orm.em.nativeDelete(NotationEntity, {});
    await this.orm.em.nativeDelete(UserEntity, {});
    this.orm.em.clear();
  }
}
