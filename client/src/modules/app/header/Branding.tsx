import * as React from 'react';
import { Logo } from '../../../components/branding';
import { compose, branch, renderComponent, createSink } from 'recompose';
import withSizes from 'react-sizes';
import { Divider } from 'antd';
import { Name } from '../../../components/branding/Name';

const HalfBranding = () => (
  <Logo size={28} />
);

const FullBranding = () => (
  <span>
    <HalfBranding />
    <Divider type="vertical" />
    <Name />
  </span>
);

interface IInnerProps {
  isStTablet: boolean;
}

const enhance = compose<IInnerProps, {}>(
  withSizes(sizes => ({ isStTablet: withSizes.isStTablet(sizes) })),
  branch<IInnerProps>(
    props => props.isStTablet,
    renderComponent(HalfBranding),
    renderComponent(FullBranding)
  )
);

export const Branding = enhance(() => null);
