import * as React from 'react';
import { compose, lifecycle, withState } from 'recompose';
import { ContentLane } from '../../../components/content-lane';
import { Grid } from './grid';
import { fetchAllNotations } from './fetchAllNotations';
import { connect } from 'react-redux';
import { NotationsActions } from '../../../data/notations/notationsActions';
import { INotation } from '../../../@types/notation';
import withSizes from 'react-sizes';
import { Search } from './search';
import { isEqual } from 'lodash';
import { filterNotations } from './filterNotations';
import { IStore } from '../../../@types/store';

interface IConnectProps {
  notations: INotation[];
  setNotations: (notations: INotation[]) => any;
}

interface IStateProps extends IConnectProps {
  queryString: string;
  queryTags: string[];
  queriedNotations: INotation[];
  setQueryString: (queryString: string) => void;
  setQueryTags: (queryTags: string[]) => void;
  setQueriedNotations: (queriedNotations: INotation[]) => void;
}

interface ISizeProps extends IStateProps {
  isMobile: boolean;
}

const didQueryChange = (props: IStateProps, prevProps: IStateProps): boolean => (
  props.queryString !== prevProps.queryString ||
  !isEqual(new Set(props.queryTags), new Set(prevProps.queryTags))
);

const enhance = compose<ISizeProps, {}>(
  connect(
    (state: IStore) => ({ notations: state.notations }),
    dispatch => ({
      setNotations: (notations: INotation[]) => dispatch(NotationsActions.setNotations(notations))
    })
  ),
  withState('queryString', 'setQueryString', ''),
  withState('queryTags', 'setQueryTags', []),
  withState('queriedNotations', 'setQueriedNotations', []),
  lifecycle<IStateProps, {}>({
    async componentDidMount(): Promise<void> {
      const notations = await fetchAllNotations();
      // sorted in reverse
      const sorted = notations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      this.props.setNotations(sorted);
      this.props.setQueriedNotations(sorted);
    },
    componentDidUpdate(prevProps): void {
      if (!didQueryChange(this.props, prevProps)) {
        return;
      }

      const { queryString, queryTags, notations } = this.props;
      if (queryString.length > 0 || queryTags.length > 0) {
        this.props.setQueriedNotations(filterNotations(queryString, queryTags, notations));
      } else {
        this.props.setQueriedNotations(notations);
      }
    }
  }),
  withSizes(size => ({ isMobile: withSizes.isMobile(size) }))
);

export const Index = enhance(props => (
  <ContentLane
    withPadding={!props.isMobile}
    withTopMargin={true}
  >
    <Search
      numQueried={props.queriedNotations.length}
      queryString={props.queryString}
      queryTags={props.queryTags}
      setQueryString={props.setQueryString}
      setQueryTags={props.setQueryTags}
    />
    <Grid
      queryTags={props.queryTags}
      notations={props.queriedNotations}
    />
  </ContentLane>
));
