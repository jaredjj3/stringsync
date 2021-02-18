// organize-imports-ignore
import 'reflect-metadata';
import { Container } from 'inversify';
import { Db, SequelizeDb, TestSequelizeDb } from './db';
import { TYPES } from './inversify.constants';
import { Logger } from './util';
import { WinstonLogger } from './util/logger/WinstonLogger';
import { getConfig, Config } from './config';

export const container = new Container();

const config = getConfig();

if (config.NODE_ENV === 'test') {
  container
    .bind<Db>(TYPES.Db)
    .to(TestSequelizeDb)
    .inSingletonScope();
} else {
  container
    .bind<Db>(TYPES.Db)
    .to(SequelizeDb)
    .inSingletonScope();
}

container.bind<Logger>(TYPES.Logger).to(WinstonLogger);
container.bind<Config>(TYPES.Config).toConstantValue(getConfig());
