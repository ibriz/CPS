import React, { useEffect, useRef, useState } from 'react';
import CPSDescription from './cpsDescription';
import BuildOn from './buildOn';
import Navbar from './navbar';
import './style.scss';
import { withResizeDetector } from 'react-resize-detector';
import GrantProcess from './grantProcess';
import GrantTimeline from './grantTimeline';
import FAQ from './faq';
import Summary from './summary';
import GrantReceipent from './grantReceipents';
import IconResource from './iconResource';
import DeveloperCommunity from './developerCommunity';
import Footer from 'Components/Footer';
import {
    customRequestHasAccount,
    customRequestAddress,
} from '../../Redux/ICON/CustomEvents';
import { loginRequest, loginPrepRequest } from 'Redux/Reducers/accountSlice';
import { connect } from 'react-redux';
import HeaderComponents from 'Components/Header/HeaderComponents';
import { setLoginButtonClicked } from 'Redux/Reducers/accountSlice';
import { NotificationManager } from 'react-notifications';
import { logout } from '../../Redux/Reducers/accountSlice';
import { setUserDataSubmitSuccess } from 'Redux/Reducers/userSlice';
import { unregisterPrep, registerPrep } from 'Redux/Reducers/prepsSlice';
import { Modal } from 'react-bootstrap';
import { useLogin } from 'Hooks/useLogin';
const LandingPage = (props) => {
    const {
        loginRequest,
        walletAddress,
        setLoginButtonClicked,
        width,
        loginButtonClicked
    } = props;

    const { handleLogin, walletModal, setWalletModal } = useLogin();
    const { targetRef } = props;
    const [activeTabCenter, setActiveTabCenter] = useState('');

    const activeTabProps = { activeTabCenter, setActiveTabCenter: setActiveTabCenter }
    const faqRef = useRef(null);
    const headerRef = useRef(null);
    const createProposalRef = useRef(null);
    const grantProcessRef = useRef(null);
    const footerRef = useRef(null);

    const refs = { faqRef: faqRef.current, createProposalRef: createProposalRef, grantProcessRef: grantProcessRef, footerRef: footerRef }

    const navbarCenterItem = [
        { title: 'Create a proposal', id: 'description', className: 'landingPage__Description', ref: createProposalRef },
        { title: 'Grant Process', id: 'grantProcess', className: 'grantProcessContainer', ref: grantProcessRef },
        { title: 'FAQ', id: 'faq', className: 'faqHeader', ref: faqRef },
        { title: 'Contact Us', id: 'footer', className: 'footer', ref: footerRef },
    ];
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
    useEffect(() => {
        const handleScroll = () => {
            const { height: headerHeight } = getDimensions(headerRef.current);
            const scrollPosition = window.scrollY + headerHeight;
            const selected = navbarCenterItem.find(({ section, ref }) => {
                const ele = ref.current;
                if (ele) {
                    const { offsetBottom, offsetTop } = getDimensions(ele);
                    return scrollPosition > offsetTop && scrollPosition < offsetBottom;
                }
            });
            if (selected && selected.id !== activeTabCenter) {
                setActiveTabCenter(selected.id);
            } else if (!selected && activeTabCenter) {
                setActiveTabCenter(undefined);
            }
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [activeTabCenter]);
    return (
        <>

            <div className="landingPage" ref={targetRef} >
                <Navbar headerRef={headerRef} {...refs} onClickLogin={handleLogin}  {...props} {...activeTabProps} />
                <div className='landingPage__Description'>

                    <CPSDescription createProposalRef={createProposalRef} walletAddress={walletAddress} onClickLogin={handleLogin} {...activeTabProps} />
                    <Summary />
                </div>
                <BuildOn />
                <GrantProcess grantProcessRef={grantProcessRef} {...activeTabProps} />
                <GrantTimeline />
                <GrantReceipent {...props} />
                <IconResource />
                <FAQ faqRef={faqRef} {...activeTabProps} />
                <div ref={footerRef}>
                    <DeveloperCommunity />
                </div>
                <Footer width={width} {...activeTabProps} />
                <Modal style={{ zIndex: 99999, marginTop: 50 }} show={walletModal} onHide={() => setWalletModal(false)}>
                    <Modal.Body style={{ textAlign: 'center' }}>Please download <a target="_blank" href="https://chrome.google.com/webstore/detail/iconex/flpiciilemghbmfalicajoolhkkenfel" style={{ textDecoration: 'underline' }}>ICONex Wallet</a> or <a target="_blank" href="https://chrome.google.com/webstore/detail/hana/jfdlamikmbghhapbgfoogdffldioobgl" style={{ textDecoration: 'underline' }}>Hana Wallet</a>.</Modal.Body>
                </Modal>
            </div>
        </>);
}

const mapStateToProps = state => ({
    walletAddress: state.account.address,
    address: state.account.address,
    period: state.period.period,
    isPrep: state.account.isPrep,
    isRegistered: state.account.isRegistered,
    payPenalty: state.account.payPenalty,
    walletBalance: state.account.walletBalance,
    loginButtonClicked: state.account.loginButtonClicked,
    userDataSubmitSuccess: state.user.userDataSubmitSuccess,
    firstName: state.user.firstName,
    lastName: state.user.lastName,
    previousEmail: state.user.previousEmail,
    email: state.user.email,
    verified: state.user.verified,
    initialPromptRedux: state.user.initialPrompt,
});

const mapDispatchToProps = dispatch => ({
    loginRequest: payload => dispatch(loginRequest(payload)),
    loginPrepRequest: payload => dispatch(loginPrepRequest(payload)),
    setLoginButtonClicked: payload => dispatch(setLoginButtonClicked(payload)),
    logout: () => dispatch(logout()),
    unregisterPrep: () => dispatch(unregisterPrep()),
    registerPrep: () => dispatch(registerPrep()),
    setUserDataSubmitSuccess: payload =>
        dispatch(setUserDataSubmitSuccess(payload)),

});

export default connect(mapStateToProps, mapDispatchToProps)(withResizeDetector(LandingPage));