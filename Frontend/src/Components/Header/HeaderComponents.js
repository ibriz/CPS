import React, { useState, useEffect } from 'react';
import { Modal, Row } from 'react-bootstrap';
import styles from './Header.module.css';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { logout } from '../../Redux/Reducers/accountSlice';
import { unregisterPrep, registerPrep } from 'Redux/Reducers/prepsSlice';
import { fetchPeriodCountRequest } from 'Redux/Reducers/periodSlice';
import timingImg from '../../Assets/Images/timing-blue.png';
import { BsSun, BsMoon } from 'react-icons/bs';
import { MdWbSunny } from 'react-icons/md';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import UserInfoFormModal from './UserInfoFormModal';
import useTimer from 'Hooks/useTimer';
import { Link } from 'react-router-dom';
import { setLoginButtonClicked } from 'Redux/Reducers/accountSlice';
import EmailConfirmationModal from './EmailConfirmationModal';
import useVerification from 'Hooks/useVerification';
import { setUserDataSubmitSuccess } from 'Redux/Reducers/userSlice';
import { withRouter } from 'react-router-dom';
import { useLogin } from 'Hooks/useLogin';
import { setTheme } from 'Redux/Reducers/themeSlice';
import { Switch } from '@headlessui/react';
import store from 'Redux/Store';
const HeaderComponents = ({
  address,
  logout,
  title,
  isPrep,
  isRegistered,
  unregisterPrep,
  registerPrep,
  period,
  payPenalty,
  firstName,
  lastName,
  walletBalance,
  landingPage,
  loginButtonClicked,
  setLoginButtonClicked,
  userDataSubmitSuccess,
  verified,
  setUserDataSubmitSuccess,
  previousEmail,
  email,
  setTheme,
  initialPromptRedux,
  history,
  periodCount,
  fetchPeriodCount,
}) => {
  const [emailConfirmationModalShow, setEmailConfirmationModal] =
    React.useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [initialPrompt, setInitialPrompt] = React.useState(false);
  // const [isEnabled, setIsEnabled] = useState(false);
  const isDark = localStorage.getItem('theme') === 'dark';
  // console.log('store', isDark);

  const { isRemainingTimeZero } = useTimer();
  useVerification();

  const onLogout = async() => {
   await logout();
    history.push('/');
  };

  const { walletModal, setWalletModal, handleLogin } = useLogin();

  useEffect(() => {
    fetchPeriodCount();
  }, []);

  useEffect(() => {
    // console.log('userDataSubmitSuccess', userDataSubmitSuccess);
    if (userDataSubmitSuccess && !verified && previousEmail !== email) {
      setUserDataSubmitSuccess({
        status: false,
      });
      setEmailConfirmationModal(true);
    }
  }, [userDataSubmitSuccess, previousEmail, email]);

  useEffect(() => {
    // if (address && loginButtonClicked) {
    //   history.push('/dashboard');
    // }
    if (address && loginButtonClicked && initialPromptRedux) {
      setLoginButtonClicked({
        click: false,
      });
      setInitialPrompt(true);
    }
  }, [address, initialPromptRedux]);

  const [showUnregisterConfirmationModal, setShowUnregisterConfirmationModal] =
    useState(false);

  const onClickUnregisterPrep = () => {
    unregisterPrep();
  };

  const onClickRegisterPrep = () => {
    registerPrep();
  };

  return (
    <>
      <div className={styles.periodCountContainer}>
        <img srcSet={timingImg + ' 2.5x'} />
        <p>
          Funding Cycle &nbsp;<span>{periodCount}</span>
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* <button
          style={{ padding: '4px 8px', border: 'none', borderRadius: 6,backgroundColor: isDark ? '#1b1b1b' : '#f1f1f1', }}
          onClick={() => {
            isDark
              ? localStorage.setItem('theme', 'light')
              : localStorage.setItem('theme', 'dark');
            window.location.reload();
          }}
        >
          {isDark ? (
            <MdWbSunny size={20} style={{ color: ' white' }} />
            ) : (
            <BsMoon size={20} style={{ color: '#27aab9' }} />
          )}
        </button> */}

        {address ? (
          <span
            onClick={() => setModalShow(true)}
            className={styles.address}
            style={landingPage ? { color: 'white' } : {}}
          >
            {firstName || lastName
              ? `${firstName || ''} ${lastName || ''}`
              : `${address?.slice(0, 4)}...${address?.slice(
                  address.length - 2,
                )}`}{' '}
            ({walletBalance?.toFixed(2)} ICX)
          </span>
        ) : (
          ''
        )}
        {isPrep &&
          isRegistered &&
          !payPenalty &&
          period === 'APPLICATION' &&
          !isRemainingTimeZero && (
            <Button
              variant='danger'
              onClick={() => setShowUnregisterConfirmationModal(true)}
              style={{ marginRight: '5px', marginLeft: '5px' }}
            >
              Unregister Prep
            </Button>
          )}

        {isPrep && !isRegistered && !payPenalty && !isRemainingTimeZero && (
          <Button
            variant='success'
            onClick={() => setShowUnregisterConfirmationModal(true)}
            style={{ marginRight: '5px', marginLeft: '5px' }}
          >
            Register Prep
          </Button>
        )}

        {/* <span style = {{marginRight: '3px'}} className = "text-primary">Wallet Balance - {walletBalance.toFixed(2)} ICX</span> */}
        {landingPage ? (
          <Link to='/dashboard'>
            <Button
              variant='outline-light'
              className={styles.button}
              style={{ marginRight: '5px', marginLeft: '3px' }}
            >
              GO TO DASHBOARD
            </Button>
          </Link>
        ) : null}
        <Button
          variant={landingPage ? 'light' : 'info'}
          onClick={address ? onLogout : handleLogin}
        >
          {address ? 'Logout' : 'Login'}
        </Button>

        <ConfirmationModal
          show={showUnregisterConfirmationModal}
          onHide={() => setShowUnregisterConfirmationModal(false)}
          heading={
            isRegistered
              ? 'Unregister Prep Confirmation'
              : 'Register Prep Confirmation'
          }
          onConfirm={() => {
            if (isRegistered) {
              onClickUnregisterPrep();
            } else {
              onClickRegisterPrep();
            }
          }}
        >
          {
            <>
              <div>
                Are you sure you want to{' '}
                {isRegistered ? 'unregister from' : 'register to'} Prep List?
              </div>
              {!isRegistered && (
                <div style={{ color: 'red' }}>
                  Please note that if you miss a vote you will be required to
                  pay a penalty before re-registering.
                </div>
              )}
            </>
          }
        </ConfirmationModal>

        <UserInfoFormModal
          show={modalShow}
          setModalShow={setModalShow}
          onHide={() => setModalShow(false)}
        />

        <UserInfoFormModal
          show={initialPrompt}
          setModalShow={setInitialPrompt}
          onHide={() => setInitialPrompt(false)}
          initialPrompt
        />

        <EmailConfirmationModal
          show={emailConfirmationModalShow}
          setModalShow={setEmailConfirmationModal}
          onHide={() => setEmailConfirmationModal(false)}
        />
        <Modal
          style={{ zIndex: 99999, marginTop: 50 }}
          show={walletModal}
          onHide={() => setWalletModal(false)}
        >
          <Modal.Body style={{ textAlign: 'center' }}>
            Please download{' '}
            <a
              target='_blank'
              href='https://chrome.google.com/webstore/detail/iconex/flpiciilemghbmfalicajoolhkkenfel'
              style={{ textDecoration: 'underline' }}
            >
              ICONex Wallet
            </a>{' '}
            or{' '}
            <a
              target='_blank'
              href='https://chrome.google.com/webstore/detail/hana/jfdlamikmbghhapbgfoogdffldioobgl'
              style={{ textDecoration: 'underline' }}
            >
              Hana Wallet
            </a>
            .
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  address: state.account.address,
  isPrep: state.account.isPrep,
  isRegistered: state.account.isRegistered,
  payPenalty: state.account.payPenalty,
  walletBalance: state.account.walletBalance,
  loginButtonClicked: state.account.loginButtonClicked,

  userDataSubmitSuccess: state.user.userDataSubmitSuccess,
  period: state.period.period,
  firstName: state.user.firstName,
  lastName: state.user.lastName,
  previousEmail: state.user.previousEmail,
  email: state.user.email,
  verified: state.user.verified,

  initialPromptRedux: state.user.initialPrompt,
  periodCount: state.period.periodCount,
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  setTheme: payload => dispatch(setTheme(payload)),
  unregisterPrep: () => dispatch(unregisterPrep()),
  registerPrep: () => dispatch(registerPrep()),
  setLoginButtonClicked: payload => dispatch(setLoginButtonClicked(payload)),
  setUserDataSubmitSuccess: payload =>
    dispatch(setUserDataSubmitSuccess(payload)),
  fetchPeriodCount: () => dispatch(fetchPeriodCountRequest()),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HeaderComponents),
);
