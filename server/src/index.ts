import { createGlobalCtx } from './ctx';
import { getServer } from './server';
import { getConfig, Config } from './config';
import { createWorkers } from './jobs';

const server = async (config: Config): Promise<void> => {
  const ctx = createGlobalCtx(config);

  const server = getServer(
    ctx,
    `
    type Query {
      hello: String
    }
  `,
    {
      hello: () => 'Hello, world!',
    }
  );

  await server.listen(config.PORT, () => {
    console.log(`server at port ${config.PORT}`);
  });
};

const worker = (config: Config): void => {
  const ctx = createGlobalCtx(config);
  createWorkers(ctx);
};

if (require.main === module) {
  const config = getConfig(process.env);

  switch (config.ROLE) {
    case 'server':
      server(config);
      break;
    case 'worker':
      worker(config);
      break;
    default:
      throw new TypeError(`ROLE not supported: ${config.ROLE}`);
  }
}
