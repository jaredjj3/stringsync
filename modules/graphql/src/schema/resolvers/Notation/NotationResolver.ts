import { AuthRequirement, Connection, randInt } from '@stringsync/common';
import { FileStorage, Logger, TYPES } from '@stringsync/container';
import { Notation } from '@stringsync/domain';
import { NotationService } from '@stringsync/services';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { inject, injectable } from 'inversify';
import { extname } from 'path';
import { Arg, Args, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { NotationObject } from '.';
import { WithAuthRequirement } from '../../middlewares';
import { ResolverCtx } from '../../types';
import { CreateNotationInput } from './CreateNotationInput';
import { NotationArgs } from './NotationArgs';
import { NotationConnectionArgs } from './NotationConnectionArgs';
import { NotationConnectionObject } from './NotationConnectionObject';

@Resolver()
@injectable()
export class NotationResolver {
  notationService: NotationService;
  fileStorage: FileStorage;
  logger: Logger;

  constructor(
    @inject(TYPES.NotationService) notationService: NotationService,
    @inject(TYPES.FileStorage) fileStorage: FileStorage,
    @inject(TYPES.Logger) logger: Logger
  ) {
    this.notationService = notationService;
    this.fileStorage = fileStorage;
    this.logger = logger;
  }

  @Query((returns) => NotationConnectionObject)
  async notations(@Args() args: NotationConnectionArgs): Promise<Connection<Notation>> {
    return await this.notationService.findPage(args);
  }

  @Query((returns) => NotationObject, { nullable: true })
  async notation(@Args() args: NotationArgs): Promise<Notation | null> {
    return await this.notationService.find(args.id);
  }

  @Mutation((returns) => NotationObject, { nullable: true })
  @UseMiddleware(WithAuthRequirement(AuthRequirement.LOGGED_IN_AS_TEACHER))
  async createNotation(@Arg('input') input: CreateNotationInput, @Ctx() ctx: ResolverCtx): Promise<Notation> {
    const notation = await this.notationService.create(input.songName, input.artistName, ctx.req.session.user.id);

    const thumbnail = await input.thumbnail;
    const video = await input.video;

    const thumbnailExt = extname(thumbnail.filename);
    const videoExt = extname(video.filename);
    const thumbnailFilepath = `notations/thumbnail/${notation.id}${thumbnailExt}`;
    const videoFilepath = `notations/video/${notation.id}${videoExt}`;

    const [thumbnailUrl, videoUrl] = await Promise.all([
      this.fileStorage.put(thumbnailFilepath, thumbnail.createReadStream()),
      this.fileStorage.put(videoFilepath, video.createReadStream()),
    ]);

    notation.thumbnailUrl = thumbnailUrl;
    notation.videoUrl = videoUrl;
    await this.notationService.update(notation.id, notation);

    return notation;
  }
}
