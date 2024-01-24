import { useEffect, useState } from 'react';
import { fetchUserDataRequest } from 'Redux/Reducers/userSlice';
import { useDispatch, useSelector } from 'react-redux';

const useVerification = () => {
  const dispatch = useDispatch();
  const verified = useSelector(state => state.user.verified);
  const firstName = useSelector(state => state.user.firstName);
  const walletAddress = useSelector(state => state.account.address);
  useEffect(() => {
    const interval = setInterval(() => {
      // console.log(
      //   'INTERVAL',
      //   new Date().getTime() / 1000,
      //   walletAddress,
      //   firstName,
      //   !verified,
      // );
      if (walletAddress && firstName && !verified) {
        dispatch(fetchUserDataRequest());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [firstName, verified, walletAddress]);

  return {};
};

export default useVerification;
