import React, { useState, useEffect, useRef } from 'react';
import iconCPSImg from '../../Assets/Images/iconCPSlogo.svg';
import iconCPSImgDark from '../../Assets/Images/iconCPSlogo-light.svg';

import { FaBars, FaTimes } from 'react-icons/fa';
import { Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import useTimer from 'Hooks/useTimer';
import useVerification from 'Hooks/useVerification';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import EmailConfirmationModal from 'Components/Header/EmailConfirmationModal';
import UserInfoFormModal from 'Components/Header/UserInfoFormModal';
import { withRouter } from 'react-router-dom';
import DarkMode from '../../Theme/darkMode';

const Navbar = props => {
  const [emailConfirmationModalShow, setEmailConfirmationModal] =
    useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState(false);

  const { isRemainingTimeZero } = useTimer();
  useVerification();

  const [showUnregisterConfirmationModal, setShowUnregisterConfirmationModal] =
    useState(false);

  const onClickUnregisterPrep = () => {
    unregisterPrep();
  };

  const onClickRegisterPrep = () => {
    registerPrep();
  };
  const {
    width,
    onClickLogin,
    walletAddress,
    logout,
    address,
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
    initialPromptRedux,
    history,
    activeTabCenter,
    setActiveTabCenter,
    createProposalRef,
    faqRef,
    grantProcessRef,
    footerRef,
    headerRef,
    theme,
  } = props;
  const onLogout = () => {
    logout();
    history.push('/');
  };
  const navbarCenterItem = [
    {
      title: 'Create a proposal',
      id: 'description',
      className: 'landingPage__Description',
      ref: createProposalRef,
    },
    {
      title: 'Grant Process',
      id: 'grantProcess',
      className: 'grantProcessContainer',
      ref: grantProcessRef,
    },
    { title: 'FAQ', id: 'faq', className: 'faqHeader', ref: faqRef },
    { title: 'Contact Us', id: 'footer', className: 'footer', ref: footerRef },
  ];

  const navbarRightItem = [
    { title: 'username' },
    { title: 'Dashboard', path: '/dashboard' },
    { title: 'Logout', onClick: onLogout },
  ];

  const [isOpened, setIsOpened] = useState(false);
  const [activeTabRight, setActiveTabRight] = useState('');
  const [clickedLogin, setClickedLogin] = useState(false);

  if (clickedLogin && walletAddress) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <div
      ref={headerRef}
      className={`landingPage__Navbar ${
        isOpened && window.innerWidth <= 1100 ? 'mobileNavbar' : ''
      }`}
    >
      <div className='navbarContainer'>
        <div className='navbarLeft'>
          <div>
            <img
              src={theme === 'light' ? iconCPSImg : iconCPSImgDark}
              alt='ICON CPS text'
            />
          </div>
        </div>
        <div
          className='navbarCenter'
          style={{
            display: !isOpened && window.innerWidth <= 1100 ? 'none' : 'flex',
            justifyContent:
              !walletAddress || window.innerWidth <= 1100
                ? 'center'
                : 'flex-end',
          }}
        >
          <ul>
            {navbarCenterItem.map((item, index) => (
              <li
                onClick={() => {
                  setActiveTabCenter(item.id);
                  const getDimensions = ele => {
                    const { height } = ele.getBoundingClientRect();
                    const offsetTop = ele.offsetTop;
                    const offsetBottom = offsetTop + height;
                    return {
                      height,
                      offsetTop,
                      offsetBottom,
                    };
                  };
                  const section = document.querySelector(`.${item.className}`);
                  const { height: headerHeight } = getDimensions(
                    headerRef.current,
                  );
                  const topPos =
                    section.getBoundingClientRect().top +
                    window.pageYOffset -
                    headerHeight;
                  if (window.innerWidth <= 1100) {
                    section.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                      inline: 'start',
                    });
                  } else {
                    window.scrollTo({
                      top: topPos, // scroll so that the element is at the top of the view
                      behavior: 'smooth', // smooth scroll
                    });
                  }

                  setIsOpened(false);
                }}
                className={activeTabCenter === item.id ? 'activeTab' : ''}
                key={index}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
        <div
          className='navbarRight'
          style={{
            display: !isOpened && window.innerWidth <= 1100 ? 'none' : 'flex',
            flex:
              (window.innerWidth < 1300 &&
                isPrep &&
                isRegistered &&
                !payPenalty &&
                period === 'APPLICATION' &&
                !isRemainingTimeZero) ||
              (isPrep && !isRegistered && !payPenalty && !isRemainingTimeZero)
                ? 1
                : !walletAddress
                ? 0.2
                : 0.8,
          }}
        >
          <DarkMode></DarkMode>

          {!walletAddress ? (
            <div style={{ padding: '8px 0px', whiteSpace: 'nowrap' }}>
              <Button
                className='dashboardBtn'
                variant='info'
                style={
                  window.innerWidth > 1100
                    ? { marginRight: 20, borderRadius: '43px' }
                    : { borderRadius: '43px' }
                }
                onClick={async () => {
                  history.push('/dashboard');
                }}
              >
                Launch App
              </Button>
            </div>
          ) : (
            <ul>
              <li
                className={activeTabRight === 'username' ? 'activeTab' : ''}
                onClick={() => {
                  // setActiveTabRight('username')
                }}
                // style={(isPrep &&
                //     isRegistered &&
                //     !payPenalty &&
                //     period === 'APPLICATION' &&
                //     !isRemainingTimeZero) || (isPrep && !isRegistered && !payPenalty && !isRemainingTimeZero) ? { padding: '15px 15px 15px 15px' } : {}}
              >
                {' '}
                <span
                  onClick={() => setModalShow(true)}
                  style={landingPage ? { color: 'white' } : {}}
                >
                  {firstName || lastName
                    ? `${firstName?.slice(0, 6)}...` ||
                      `${lastName?.slice(0, 6)}...}`
                    : `${address?.slice(0, 4)}...${address?.slice(
                        address.length - 2,
                      )}`}{' '}
                  ({walletBalance?.toFixed(2)} ICX)
                </span>
                {/* {isPrep &&
                                    isRegistered &&
                                    !payPenalty &&
                                    period === 'APPLICATION' &&
                                    !isRemainingTimeZero && (
                                        <Button
                                            variant='danger'
                                            onClick={() => setShowUnregisterConfirmationModal(true)}
                                            style={{ marginRight: '2px', marginLeft: 'px', fontSize: 12 }}
                                        >
                                            Unregister Prep
                                        </Button>
                                    )}
                                {isPrep && !isRegistered && !payPenalty && !isRemainingTimeZero && (
                                    <Button
                                        variant='success'
                                        onClick={() => setShowUnregisterConfirmationModal(true)}
                                        style={{ marginRight: '2px', marginLeft: '2px' }}
                                    >
                                        Register Prep
                                    </Button>
                                )} */}
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
                        {isRegistered ? 'unregister from' : 'register to'} Prep
                        List?
                      </div>
                      {!isRegistered && (
                        <div style={{ color: 'red' }}>
                          Please note that if you miss a vote you will be
                          required to pay a penalty before re-registering.
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
              </li>
              {/* <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white' }}> */}
              <li onClick={() => history.push('/dashboard')}>
                <div style={{ padding: '8px 0px', whiteSpace: 'nowrap' }}>
                  <Button
                    className='dashboardBtn'
                    variant='info'
                    style={{ borderRadius: '43px' }}
                    onClick={async () => {
                      history.push('/dashboard');
                    }}
                  >
                    Launch App
                  </Button>
                </div>
              </li>
              {/* </Link> */}
              <li onClick={onLogout}>Logout</li>
            </ul>
          )}
        </div>
        <div className='menuIcon'>
          <label onClick={() => setIsOpened(prev => !prev)} htmlFor='menu'>
            {!isOpened ? (
              <FaBars
                style={{
                  fontSize: 22,
                  color: theme === 'light' ? 'black' : 'white',
                }}
              />
            ) : (
              <FaTimes
                style={{
                  fontSize: 22,
                  color: theme === 'light' ? 'black' : 'white',
                }}
              />
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Navbar);
