import { Container } from '@stringsync/di';
import { altairExpress } from 'altair-express-middleware';
import cors from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { ApiConfig } from '../API_CONFIG';
import { API_TYPES } from '../API_TYPES';
import { HealthController } from './controllers';
import { withGraphQL, withSession } from './middlewares';
import { withLogging } from './middlewares/withLogging';
import { withSessionUser } from './middlewares/withSessionUser';

export const app = (container: Container, schema: GraphQLSchema) => {
  const app = express();
  const healthController = container.get<HealthController>(API_TYPES.HealthController);
  const config = container.get<ApiConfig>(API_TYPES.ApiConfig);

  app.use(withLogging(container));

  app.set('trust proxy', 1);

  app.use(cors({ origin: [config.APP_WEB_URI], credentials: true }));

  app.get('/health', healthController.get);

  app.use(
    '/graphql',
    withSession(container),
    withSessionUser(container),
    graphqlUploadExpress(),
    withGraphQL(container, schema)
  );

  if (config.NODE_ENV === 'development') {
    app.use(
      '/altair',
      altairExpress({
        endpointURL: '/graphql',
      })
    );
  }

  return app;
};
