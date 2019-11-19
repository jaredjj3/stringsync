const { execSync } = require('child_process');

module.exports = async () => {
  const env = process.env.NODE_ENV;
  if (env !== 'test') {
    throw new Error(`cannot run jest setup in NODE_ENV=${env || ''}`);
  }

  // `yarn tsc:db` is called in pretest script
  execSync('yarn sequelize db:drop');
  execSync('yarn sequelize db:create');
  execSync('yarn sequelize db:migrate');
};
