import { ContainerModule } from 'inversify';
import { GraphqlConfig } from '@stringsync/config';
import { TYPES } from '@stringsync/common';
import { connectToDb, Db } from '@stringsync/sequelize';

export const getSequelizeModule = (config: GraphqlConfig) =>
  new ContainerModule((bind) => {
    const db = connectToDb({
      databaseName: config.DB_NAME,
      host: config.DB_HOST,
      password: config.DB_PASSWORD,
      username: config.DB_NAME,
      port: config.DB_PORT,
      namespaceName: 'transaction',
    });
    bind<Db>(TYPES.Db).toConstantValue(db);
  });
