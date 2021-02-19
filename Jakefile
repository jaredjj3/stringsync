const { task, desc, namespace } = require('jake');
const { spawn } = require('child_process');
const chalk = require('chalk');

const env = (name, fallback = undefined) => {
  const val = process.env[name];
  if (typeof val === 'undefined') {
    if (typeof fallback === 'undefined') {
      throw new Error(`env variable is not defined with no fallback: ${name}`);
    } else {
      return fallback;
    }
  }
  return val;
};

namespace('install', () => {
  desc('installs api dependencies');
  task('api', async () => {
    await new Promise((resolve) => {
      const yarn = spawn('yarn', { cwd: 'api' });
      yarn.on('close', resolve);
    });
  });
});

namespace('db', () => {
  desc('migrates the database');
  task('migrate', ['install:api'], async () => {
    env('DB_NAME');
    env('DB_USERNAME');
    env('DB_PASSWORD');
    env('DB_HOST');
    env('DB_PORT');

    await new Promise((resolve) => {
      const yarn = spawn('yarn', ['migrate'], { cwd: 'api', stdio: 'inherit' });
      yarn.on('close', resolve);
    });
  });
});

namespace('build', () => {
  desc('builds the stringsync docker image');
  task('api', [], async () => {
    const DOCKER_TAG = env('DOCKER_TAG', 'latest');

    await new Promise((resolve, reject) => {
      const docker = spawn('docker', ['build', '-t', `stringsync:${DOCKER_TAG}`, './api']);
      docker.on('close', resolve);
      docker.on('error', reject);
    });
  });
});

namespace('test', () => {
  desc('tests the api project');
  task('api', ['build:api'], async () => {
    const WATCH = env('WATCH', 'false') === 'true';

    const runTests = async () => {
      await new Promise((resolve, reject) => {
        const succeed = () => {
          console.log(chalk.green('tests succeeded'));
          resolve();
        };
        const fail = () => {
          console.log(chalk.red('tests failed'));
          reject();
        };
        const dockerCompose = spawn(
          'docker-compose',
          ['-f', './api/docker-compose.test.yml', 'run', '--rm', 'test', 'yarn', 'test', `--watchAll=${WATCH}`],
          { stdio: 'inherit' }
        );
        dockerCompose.on('close', (exitCode) => {
          if (exitCode === 0) {
            succeed();
          } else {
            fail();
          }
        });
        dockerCompose.on('error', fail);
      });
    };

    const cleanupTests = async () => {
      await new Promise((resolve) => {
        const dockerCompose = spawn('docker-compose', [
          '-f',
          './api/docker-compose.test.yml',
          'down',
          '--remove-orphans',
        ]);
        dockerCompose.on('close', resolve);
      });
    };

    try {
      await runTests();
    } finally {
      await cleanupTests();
    }
  });
});
