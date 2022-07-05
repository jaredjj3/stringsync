import { useCallback, useEffect, useState } from 'react';
import { Notation, Tag, User } from '../domain';
import * as graphql from '../lib/graphql';
import * as pager from '../lib/pager';
import * as queries from '../lib/queries';
import { GqlReqStatus, useGql2 } from './useGql2';

type Transcriber = Pick<User, 'id' | 'username' | 'role' | 'avatarUrl'>;

type NotationPreview = Omit<Notation, 'createdAt' | 'updatedAt'> & {
  transcriber: Transcriber;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
};

type LoadPage = () => void;

type PageInfo = pager.PageInfo & {
  hasLoadedFirstPage: boolean;
};

const getInitialPageInfo = () => ({
  ...pager.getInitialPageInfo(),
  hasLoadedFirstPage: false,
});

const toNotationPreviews = (connection: graphql.DataOf<typeof queries.NOTATION_PREVIEWS>): NotationPreview[] => {
  return (connection?.edges || []).map((edge) => {
    const transcriber = { ...edge.node.transcriber };
    return { ...edge.node, transcriber } as NotationPreview;
  });
};

export const useNotationPreviews = (
  pageSize: number,
  query: string,
  tagIds: string[]
): [notations: NotationPreview[], pageInfo: PageInfo, loadPage: LoadPage, status: GqlReqStatus] => {
  const [notations, setNotations] = useState(new Array<NotationPreview>());
  const [pageInfo, setPageInfo] = useState(getInitialPageInfo);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [exec, res, cancel, reset] = useGql2(queries.NOTATION_PREVIEWS);

  useEffect(() => {
    setNotations([]);
    setPageInfo(getInitialPageInfo);
    reset();
  }, [query, tagIds, reset]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadPage = useCallback(() => {
    if (res.status === GqlReqStatus.Pending) {
      return;
    }
    if (!pageInfo.hasNextPage) {
      return;
    }
    exec({
      first: pageSize,
      after: pageInfo.endCursor,
      query: query ? query : null,
      tagIds: tagIds.length ? tagIds : null,
    });
  }, [exec, res, pageSize, pageInfo, query, tagIds]);

  useEffect(() => {
    switch (res.status) {
      case GqlReqStatus.Success:
        const connection = res.data.notations!;
        // the server sorts by ascending cursor, but we're pagingating backwards
        // this is correct according to spec:
        // https://relay.dev/graphql/connections.htm#sec-Backward-pagination-arguments
        setNotations((notations) => [...notations, ...toNotationPreviews(connection).reverse()]);
        setPageInfo({ ...connection.pageInfo, hasLoadedFirstPage: true });
    }
  }, [res]);

  return [notations, pageInfo, loadPage, res.status];
};
