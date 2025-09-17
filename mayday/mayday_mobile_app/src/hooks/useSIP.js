import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setRegistered } from '../store/slices/sipSlice';
import { incomingCall, updateCallStatus, endCall } from '../store/slices/callSlice';
import { onEvent } from '../services/sipClient';
import { navigate } from '../navigation/navigationRef';

export default function useSIP() {
  const dispatch = useDispatch();

  useEffect(() => {
    onEvent('registered', () => dispatch(setRegistered(true)));
    onEvent('registrationFailed', () => dispatch(setRegistered(false))));

    onEvent('session:new', ({ originator, session }) => {
      if (originator === 'remote') {
        const from = session?.remoteIdentity?.uri?.user || 'Unknown';
        dispatch(incomingCall(from));
        navigate('IncomingCall', { caller: from });
      }
    });

    onEvent('session:progress', () => dispatch(updateCallStatus('progress')));
    onEvent('session:accepted', () => dispatch(updateCallStatus('accepted')));
    onEvent('session:confirmed', () => dispatch(updateCallStatus('confirmed')));

    onEvent('session:failed', () => dispatch(endCall()));
    onEvent('session:ended', () => dispatch(endCall()));
  }, [dispatch]);
}
