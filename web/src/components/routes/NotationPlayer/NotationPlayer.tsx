import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Col, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { $queries, NotationObject } from '../../../graphql';
import { Layout, withLayout } from '../../../hocs';
import { HEADER_HEIGHT_PX } from '../../../hocs/withLayout/DefaultLayout';
import { RootState } from '../../../store';
import { compose } from '../../../util/compose';
import { Notation } from '../../Notation';
import { Video } from '../../Video';
import { SuggestedNotations } from './SuggestedNotations';

const LoadingIcon = styled(LoadingOutlined)`
  font-size: 5em;
  color: ${(props) => props.theme['@border-color']};
`;

const RightBorder = styled.div<{ border: boolean }>`
  box-sizing: border-box;
  border-right: ${(props) => (props.border ? '1px' : '0')} solid ${(props) => props.theme['@border-color']};
`;

// We have to use this instead of styling the col directly because
// ant design will push any unknown props to the underlying HTML
// structure, causing an unknown attribute/property error.
const LeftOrTopCol = styled.div<{ overflow: boolean }>`
  max-height: calc(100vh - ${HEADER_HEIGHT_PX}px);
  overflow: ${(props) => (props.overflow ? 'auto' : 'hidden')};
`;

const RightOrBottomCol = styled.div<{ heightOffsetPx: number }>`
  padding-top: 24px;
  padding-bottom: 36px;
  background: white;
  height: calc(100vh - ${(props) => props.heightOffsetPx}px);
  overflow: auto;
`;

const SongName = styled.h1`
  text-align: center;
  font-size: 2em;
  margin-bottom: 0;
`;

const ArtistName = styled.h2`
  text-align: center;
  font-size: 1.25em;
  margin-bottom: 4px;
`;

const TranscriberName = styled.h3`
  text-align: center;
  font-size: 1em;
  font-weight: normal;
  color: ${(props) => props.theme['@muted']};
`;

const enhance = compose(withLayout(Layout.DEFAULT, { lanes: false, footer: false }));

interface Props {}

const NotationPlayer: React.FC<Props> = enhance(() => {
  const gtMd = useSelector<RootState, boolean>((state) => {
    const { lg, xl, xxl } = state.viewport;
    return lg || xl || xxl;
  });

  const params = useParams<{ id: string }>();
  const [notation, setNotation] = useState<NotationObject | null>(null);
  const [errors, setErrors] = useState(new Array<string>());
  const [isLoading, setIsLoading] = useState(true);
  const [videoHeightPx, setVideoHeightPx] = useState(0);

  const hasErrors = errors.length > 0;

  // Prevent the outer container from scrolling. The reason why we need this is
  // needed is because when the viewport is ltEqMd, the body will almost certainly
  // overflow, causing a scroll bar on the outer page (and the inner page from the
  // right/bottom column overflow). This is a reasonable hack that will undo itself
  // when the user navigates away from the page.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    setErrors([]);
    setIsLoading(true);
    setNotation(null);
    (async () => {
      const { data, errors } = await $queries.notation({ id: params.id });
      if (errors) {
        setErrors(errors.map((error) => error.message));
      } else if (!data?.notation) {
        setErrors([`no notation found with id '${params.id}'`]);
      } else {
        setNotation(data.notation);
      }
      setIsLoading(false);
    })();
  }, [params.id]);

  const onVideoResize = useCallback((widthPx: number, heightPx: number) => {
    setVideoHeightPx(heightPx);
  }, []);

  const rightOrBottomColHeightOffsetPx = gtMd ? HEADER_HEIGHT_PX : HEADER_HEIGHT_PX + videoHeightPx;

  return (
    <div data-testid="notation-player">
      {isLoading && (
        <>
          <br />
          <br />
          <Row justify="center">
            <LoadingIcon />
          </Row>
        </>
      )}

      {!isLoading && hasErrors && (
        <>
          <br />
          <br />
          <Row justify="center">
            <Alert
              showIcon
              type="error"
              message="error"
              description={
                <>
                  {errors.map((error, ndx) => (
                    <div key={ndx}>{error}</div>
                  ))}
                  <Link to="/library">library</Link>
                </>
              }
            />
          </Row>
        </>
      )}

      {gtMd}

      {!isLoading && !hasErrors && notation && (
        <Row>
          <Col xs={24} sm={24} md={24} lg={6} xl={6} xxl={8}>
            <LeftOrTopCol overflow={gtMd}>
              <Video
                onVideoResize={onVideoResize}
                playerOptions={{
                  sources: [
                    {
                      src: notation?.videoUrl || '',
                      type: 'application/x-mpegURL',
                    },
                  ],
                }}
              />
              <RightBorder border={gtMd}>{gtMd && <SuggestedNotations srcNotationId={notation.id} />}</RightBorder>
            </LeftOrTopCol>
          </Col>
          <Col xs={24} sm={24} md={24} lg={18} xl={18} xxl={16}>
            <RightOrBottomCol heightOffsetPx={rightOrBottomColHeightOffsetPx}>
              <SongName>{notation.songName}</SongName>
              <ArtistName>by {notation.artistName}</ArtistName>
              <TranscriberName>{notation.transcriber.username}</TranscriberName>

              {notation.musicXmlUrl && <Notation musicXmlUrl={notation.musicXmlUrl} />}
            </RightOrBottomCol>
          </Col>
        </Row>
      )}
    </div>
  );
});

export default NotationPlayer;
