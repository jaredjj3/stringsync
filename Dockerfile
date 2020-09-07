FROM node:13

WORKDIR /stringsync

COPY ./package.json .
COPY ./yarn.lock .
COPY ./modules/common/package.json ./modules/common/
COPY ./modules/container/package.json ./modules/container/
COPY ./modules/config/package.json ./modules/config/
COPY ./modules/domain/package.json ./modules/domain/
COPY ./modules/repos/package.json ./modules/repos/
COPY ./modules/graphql/package.json ./modules/graphql/
COPY ./modules/services/package.json ./modules/services/
COPY ./modules/web/package.json ./modules/web/
COPY ./modules/sequelize/package.json ./modules/sequelize/
COPY ./modules/util/package.json ./modules/util/

RUN yarn

COPY ./tsconfig.json .
COPY ./jest.config.js .
