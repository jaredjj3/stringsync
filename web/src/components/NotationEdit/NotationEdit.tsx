import React from 'react';
import { useParams } from 'react-router';
import { Layout, withLayout } from '../../hocs/withLayout';
import { useNotation } from '../../hooks/useNotation';
import { compose } from '../../util/compose';
import { Player } from '../Player';

const enhance = compose(withLayout(Layout.DEFAULT));

const NotationEdit: React.FC = enhance(() => {
  const params = useParams<{ id: string }>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notation, errors, isLoading] = useNotation(params.id);

  return (
    <div>
      <br />
      <br />
      <div>edit {params.id}</div>
      <hr />
      {!isLoading && notation && notation.videoUrl && (
        <Player.Video
          playerOptions={{
            sources: [
              {
                src: notation.videoUrl,
                type: 'application/x-mpegURL',
              },
            ],
          }}
        />
      )}
    </div>
  );
});

export default NotationEdit;
