import React from 'react';
import { useDispatch } from 'react-redux';
import { getReauthAction } from '../../store/modules';
import useEffectOnce from '../../hooks/use-effect-once/useEffectOnce';

const ReauthOnce: React.FC = () => {
  const dispatch = useDispatch();
  useEffectOnce(() => {
    const reauthAction = getReauthAction();
    dispatch(reauthAction);
  });
  return null;
};

export default ReauthOnce;
