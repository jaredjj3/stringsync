import * as React from 'react';
import { ScoreLine } from './ScoreLine';
import { compose, withState, lifecycle, withProps } from 'recompose';
import { Vextab } from 'models';
import { hash } from 'utilities';

const MIN_WIDTH_PER_MEASURE = 240; // px
const MIN_MEASURES_PER_LINE = 1;
const MAX_MEASURES_PER_LINE = 4;

interface IOuterProps {
  vextabString: string;
  width: number;
}

interface IVextabProps extends IOuterProps {
  vextab: Vextab;
  setVextab: (vextab: Vextab) => void;
}

interface IMeasuresPerLineProps extends IVextabProps {
  measuresPerLine: number;
}

interface IInnerProps extends IVextabProps {
  measuresPerLine: number;
}

const enhance = compose<IInnerProps, IOuterProps>(
  withState('vextab', 'setVextab', new Vextab([], 1)),
  withProps((props: IVextabProps) => {
    let measuresPerLine;
    
    // compute mpl based on width
    measuresPerLine = Math.floor(props.width / MIN_WIDTH_PER_MEASURE);

    // ensure mpl >= MIN_MEASURES_PER_LINE
    measuresPerLine = Math.max(measuresPerLine, MIN_MEASURES_PER_LINE);

    // ensure mpl <= MAX_MEASURES_PER_LINE
    measuresPerLine = Math.min(measuresPerLine, MAX_MEASURES_PER_LINE);

    return { measuresPerLine };
  }),
  lifecycle<IInnerProps, {}>({
    componentWillReceiveProps(nextProps) {
      const shouldCreateVextab = (
        this.props.vextabString !== nextProps.vextabString ||
        this.props.measuresPerLine !== nextProps.measuresPerLine
      );

      let vextab;
      if (shouldCreateVextab) {
        vextab = new Vextab(Vextab.decode(nextProps.vextabString), nextProps.measuresPerLine);
        nextProps.setVextab(vextab);
      } else {
        vextab = this.props.vextab;
      }

      // Sync the component width with the renderer's width.
      vextab.renderer.width = nextProps.width;
    }
  })
);

export const Score = enhance(props => (
  <div>
    {
      props.vextab.lines.map(line => {
        return (
          <ScoreLine
            key={`score-line-${line.id}-${props.vextab.id}`}
            line={line}
            vextab={props.vextab}
          />
        );
      })
    }
  </div>
));
