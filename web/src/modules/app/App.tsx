import React from 'react';
import { StoreViewportSync } from '../../components/store-viewport-sync';
import { AuthenticateOnce } from '../../components/authenticate-once';
import { Routes } from '../routes/Routes';

interface Props {}

const App: React.FC<Props> = (props) => {
  return (
    <>
      <StoreViewportSync />
      <AuthenticateOnce />
      <Routes />
    </>
  );
};

export default App;
