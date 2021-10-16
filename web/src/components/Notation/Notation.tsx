import { DoubleRightOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { useViewport } from '../../ctx/viewport/useViewport';
import { Dimensions, Nullable } from '../../util/types';
import * as helpers from './helpers';
import { Media } from './Media';
import { MusicDisplay } from './MusicDisplay';
import { Sidecar } from './Sidecar';
import { SplitPane } from './SplitPane';
import { NotationLayoutOptions, RenderableNotation } from './types';

const FloatingButton = styled(Button)<{ $top: number }>`
  position: fixed;
  top: ${(props) => props.$top}px;
  right: -1px;
  z-index: 3;
`;

type Props = {
  loading?: boolean;
  layout?: NotationLayoutOptions;
  video: boolean;
  sidecar?: React.ReactNode;
  notation: Nullable<RenderableNotation>;
};

export const Notation: React.FC<Props> = (props) => {
  // props
  const layout = helpers.getLayout(props.layout);
  const loading = props.loading || false;
  const video = props.video;
  const notation = props.notation;
  const sidecar = props.sidecar;
  const src = notation?.videoUrl || null;

  // split pane sizing
  const viewport = useViewport();
  const layoutSizeBoundsPx = helpers.getLayoutSizeBoundsPx(viewport);
  const [pane1Dimensions, setPane1Dimensions] = useState({ width: 0, height: 0 });
  const onPane1Resize = useCallback((dimensions: Dimensions) => setPane1Dimensions(dimensions), []);
  useEffect(() => {
    if (!video) {
      setPane1Dimensions({ width: 0, height: 0 });
    }
  }, [video]);
  useEffect(() => {}, [pane1Dimensions]);

  // sidecar drawer button
  const [isSidecarDrawerVisible, setSidecarDrawerVisibility] = useState(false);
  const onOpenSidecarDrawerButtonClick = () => setSidecarDrawerVisibility(true);
  const onSidecarDrawerCloseClick = () => setSidecarDrawerVisibility(false);

  // home button
  const history = useHistory();
  const onHomeClick = () => history.push('/library');

  return (
    <div data-testid="notation">
      {layout === 'sidecar' && (
        <>
          <SplitPane
            split="vertical"
            minSize={layoutSizeBoundsPx.sidecar.min}
            maxSize={layoutSizeBoundsPx.sidecar.max}
            onPane1Resize={onPane1Resize}
          >
            <Sidecar videoSkeleton loading={loading}>
              <Media video loading={loading} src={src} />
              {sidecar}
            </Sidecar>
            <MusicDisplay loading={loading} notation={notation} />
          </SplitPane>
        </>
      )}

      {layout === 'theater' && (
        <>
          <FloatingButton $top={16} size="large" type="primary" icon={<HomeOutlined />} onClick={onHomeClick} />
          <FloatingButton
            $top={72}
            size="large"
            type="primary"
            icon={<DoubleRightOutlined />}
            onClick={onOpenSidecarDrawerButtonClick}
          />
          <Drawer closable visible={isSidecarDrawerVisible} width="100%" onClose={onSidecarDrawerCloseClick}>
            <Sidecar loading={loading}>
              <div>video</div>
            </Sidecar>
          </Drawer>

          {video && (
            <SplitPane
              split="horizontal"
              style={{ position: 'static' }}
              minSize={layoutSizeBoundsPx.theater.min}
              maxSize={layoutSizeBoundsPx.theater.max}
              onPane1Resize={onPane1Resize}
            >
              <Media video fluid={false} loading={loading} src={src} />
              <MusicDisplay loading={loading} notation={notation} />
            </SplitPane>
          )}

          {!video && <div>TODO</div>}
        </>
      )}
    </div>
  );
};
