import React from 'react';
import PropTypes from 'prop-types';
import sonarSearchSrc from 'assets/sonar-search.svg';
import styled from 'react-emotion';
import { compact } from 'lodash';
import { compose, setPropTypes, setDisplayName, withProps } from 'recompose';

const enhance = compose(
  setDisplayName('NotationSearchResults'),
  setPropTypes({
    queryString: PropTypes.string.isRequired,
    queryTags: PropTypes.object.isRequired,
    numQueried: PropTypes.number.isRequired,
    onClear: PropTypes.func.isRequired
  }),
  withProps(props => {
    const { queryTags, queryString, numQueried } = props;

    const resultOrResults = numQueried === 1 ? 'result' : 'results';
    const query = [...queryTags].sort();
    query.push(queryString);
    const forString = `${compact(query).join(', ')}`

    const resultString = `${numQueried} ${resultOrResults} for ${forString}`;
    return { resultString };
  }),
  withProps(props => ({
    hasResults: props.queryString || props.queryTags.size > 0
  }))
)

const Results = styled('div') `
  text-align: center;
  margin: 24px 8px 0 8px;
  font-size: 24px;
`;

const SonarSearch = styled('img') `
  width: 65%;
`;

const RemoveFilter = styled('div') `
  margin: 0 auto;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  color: ${props => props.theme.primaryColor};

  &:hover {
    text-decoration: underline;
  }
`;

const NotationSearchResults = enhance(props => (
  <div>
    {
      props.hasResults
        ? <Results>
            <div>{props.resultString}</div>
            <RemoveFilter onClick={props.onClear}>remove filters</RemoveFilter>
            {
              props.numQueried === 0
                ? <SonarSearch src={sonarSearchSrc} alt="StringSync logo" />
                : null
            }
          </Results>
        : null
    }
  </div>
));

export default NotationSearchResults;