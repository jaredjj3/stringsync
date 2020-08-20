import { PagingCtx, PagingType, TestFactory, UNKNOWN_ERROR_MSG, UnknownError, Connection } from '@stringsync/common';
import { TYPES, useTestContainer } from '@stringsync/container';
import { Notation } from '@stringsync/domain';
import { first, last, sortBy, minBy, maxBy } from 'lodash';
import { NotationPager } from './NotationPager';

const container = useTestContainer();

let notationPager: NotationPager;

beforeEach(() => {
  notationPager = container.get<NotationPager>(TYPES.NotationPager);
});

describe('encoding', () => {
  it('can encode and decode a cursor', () => {
    const cursor = 1;

    const encodedCursor = notationPager.encodeCursor(cursor);
    const decodedCursor = notationPager.decodeCursor(encodedCursor);

    expect(decodedCursor).toBe(cursor);
  });
});

describe('connect', () => {
  const NUM_NOTATIONS = 15;

  const notations = new Array<Notation>(NUM_NOTATIONS);

  beforeEach(() => {
    for (let ndx = 0; ndx < NUM_NOTATIONS; ndx++) {
      notations[ndx] = TestFactory.buildRandNotation({ cursor: ndx + 1 });
    }
  });

  const findEntities = async (pagingCtx: PagingCtx) => {
    switch (pagingCtx.pagingType) {
      case PagingType.FORWARD:
        return sortBy(notations, (notation) => notation.cursor)
          .filter((notation) => notation.cursor > pagingCtx.cursor)
          .slice(0, pagingCtx.limit);

      case PagingType.BACKWARD:
        return sortBy(notations, (notation) => notation.cursor)
          .reverse()
          .filter((notation) => notation.cursor < pagingCtx.cursor)
          .slice(0, pagingCtx.limit)
          .reverse();

      default:
        throw new UnknownError(UNKNOWN_ERROR_MSG);
    }
  };

  it('defaults to forward paging', async () => {
    const { edges, pageInfo } = await notationPager.connect({}, findEntities);

    expect(edges.length).toBeGreaterThan(0);
    expect(edges).toHaveLength(notationPager.defaultLimit);
    expect(pageInfo.startCursor).toBe(first(edges)!.cursor);
    expect(pageInfo.endCursor).toBe(last(edges)!.cursor);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.hasPreviousPage).toBe(false);
  });

  it('returns the first N records when forward paging', async () => {
    const cursors = notations.map((notation) => notation.cursor);
    const minCursor = Math.min(...cursors);

    const { edges, pageInfo } = await notationPager.connect({ first: 1 }, findEntities);

    expect(edges).toHaveLength(1);
    const edge = edges[0];
    expect(edge.node.cursor).toBe(minCursor);
    expect(edge.cursor).toBe(notationPager.encodeCursor(minCursor));
    expect(pageInfo.startCursor).toBe(edge.cursor);
    expect(pageInfo.endCursor).toBe(edge.cursor);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.hasPreviousPage).toBe(false);
  });

  it('returns the last N records when backward paging', async () => {
    const cursors = notations.map((notation) => notation.cursor);
    const maxCursor = Math.max(...cursors);

    const { edges, pageInfo } = await notationPager.connect({ last: 1 }, findEntities);

    expect(edges).toHaveLength(1);
    const edge = edges[0];
    expect(edge.node.cursor).toBe(maxCursor);
    expect(edge.cursor).toBe(notationPager.encodeCursor(maxCursor));
    expect(pageInfo.startCursor).toBe(edge.cursor);
    expect(pageInfo.endCursor).toBe(edge.cursor);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.hasPreviousPage).toBe(false);
  });

  it('returns the first N records after a cursor', async () => {
    const connection = await notationPager.connect({ first: 1 }, findEntities);
    expect(connection.pageInfo.startCursor).not.toBeNull();
    const after = connection.pageInfo.startCursor!;

    const { edges, pageInfo } = await notationPager.connect({ first: 1, after }, findEntities);

    expect(edges).toHaveLength(1);
    const edge = edges[0];
    expect(edge.node.cursor).toBeGreaterThan(notationPager.decodeCursor(after));
    expect(edge.cursor).toBe(notationPager.encodeCursor(edge.node.cursor));
    expect(pageInfo.startCursor).toBe(edge.cursor);
    expect(pageInfo.endCursor).toBe(edge.cursor);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.hasPreviousPage).toBe(true);
  });

  it('returns the first N records before a cursor', async () => {
    const connection = await notationPager.connect({ last: 1 }, findEntities);
    expect(connection.pageInfo.startCursor).not.toBeNull();
    const before = connection.pageInfo.startCursor!;

    const { edges, pageInfo } = await notationPager.connect({ last: 1, before }, findEntities);

    expect(edges).toHaveLength(1);
    const edge = edges[0];
    expect(edge.node.cursor).toBeLessThan(notationPager.decodeCursor(before));
    expect(edge.cursor).toBe(notationPager.encodeCursor(edge.node.cursor));
    expect(pageInfo.startCursor).toBe(edge.cursor);
    expect(pageInfo.endCursor).toBe(edge.cursor);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.hasPreviousPage).toBe(true);
  });

  it('returns records in the same order regardless of paging type', async () => {
    const forwardNotationConnection = await notationPager.connect({ first: NUM_NOTATIONS }, findEntities);
    const backwardNotationConnection = await notationPager.connect({ last: NUM_NOTATIONS }, findEntities);
    expect(forwardNotationConnection).toStrictEqual(backwardNotationConnection);
  });

  it('returns an empty array when paging after the last record', async () => {
    const connection = await notationPager.connect({ last: 1 }, findEntities);
    expect(connection.pageInfo.startCursor).not.toBeNull();
    const after = connection.pageInfo.startCursor!;

    const { edges, pageInfo } = await notationPager.connect({ first: 1, after }, findEntities);

    expect(edges).toHaveLength(0);
    expect(pageInfo.startCursor).toBeNull();
    expect(pageInfo.endCursor).toBeNull();
    expect(pageInfo.hasNextPage).toBe(false);
    expect(pageInfo.hasPreviousPage).toBe(true);
  });

  it('returns an empty array when paging before the first record', async () => {
    const connection = await notationPager.connect({ first: 1 }, findEntities);
    expect(connection.pageInfo.startCursor).not.toBeNull();
    const before = connection.pageInfo.startCursor!;

    const { edges, pageInfo } = await notationPager.connect({ last: 1, before }, findEntities);

    expect(edges).toHaveLength(0);
    expect(pageInfo.startCursor).toBeNull();
    expect(pageInfo.endCursor).toBeNull();
    expect(pageInfo.hasNextPage).toBe(false);
    expect(pageInfo.hasPreviousPage).toBe(true);
  });
});
