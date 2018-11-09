import * as React from 'react';
import { INotation } from '../../../../@types/notation';
import { Card, Divider, Tag } from 'antd';
import styled from 'react-emotion';
import { Avatar } from '../../../../components/avatar';
import { get } from 'lodash';

interface IProps {
  notation: INotation;
}

const Tags = styled('div')`
  margin-top: 12px;
`;

const CoverImg = styled('img')`
  width: 100%;
  height: 100%;
`;

export const Detail: React.SFC<IProps> = props => {
  const { thumbnailUrl, songName, artistName, tags, transcriber } = props.notation;

  return (
    <Card cover={<CoverImg src={thumbnailUrl} alt={songName} />}>
      <Card.Meta
        avatar={
          <Avatar
            src={get(transcriber, 'image', null)}
            name={get(transcriber, 'name', '')}
          />
        }
        title={artistName}
        description={songName}
      />
      <Tags>
        {tags.map(tag => (<Tag key={tag}>{tag}</Tag>))}
      </Tags>
    </Card>
  );
};
