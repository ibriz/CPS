import React, {useState, useEffect} from 'react';
import { Row } from 'react-bootstrap';
import styles from './Header.module.css'
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { logout } from '../../Redux/Reducers/accountSlice';
import {unregisterPrep, registerPrep} from 'Redux/Reducers/prepsSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import UserInfoFormModal from './UserInfoFormModal';
import useTimer from 'Hooks/useTimer';
import {Link} from 'react-router-dom';
import {setLoginButtonClicked} from 'Redux/Reducers/accountSlice';
import EmailConfirmationModal from './EmailConfirmationModal';
import useVerification from 'Hooks/useVerification';
import {setUserDataSubmitSuccess} from 'Redux/Reducers/userSlice';
import {withRouter} from 'react-router-dom';

const HeaderComponents = ({ address, logout, title, isPrep, isRegistered, unregisterPrep, registerPrep,period, payPenalty, firstName, lastName, walletBalance, landingPage, loginButtonClicked, setLoginButtonClicked, userDataSubmitSuccess, verified, setUserDataSubmitSuccess, previousEmail, email, initialPromptRedux, history }) => {

    const [emailConfirmationModalShow, setEmailConfirmationModal] = React.useState(false);
    const [modalShow, setModalShow] = React.useState(false);
    const [initialPrompt, setInitialPrompt] = React.useState(false);

    const {isRemainingTimeZero} = useTimer();
    useVerification();

    const onLogout = () => {
        logout();
        history.push('/');
    }

    useEffect(() => {
        console.log("userDataSubmitSuccess", userDataSubmitSuccess);
        if(userDataSubmitSuccess && !verified && (previousEmail !== email)) {
            setUserDataSubmitSuccess(
                {
                    status: false
                }
            );
            setEmailConfirmationModal(true);
        }
    }, [userDataSubmitSuccess, previousEmail, email]);

    useEffect(() => {
        if(address && loginButtonClicked) {
            history.push('/dashboard');
        }
        if(address && loginButtonClicked && initialPromptRedux) {
            setLoginButtonClicked({
                click: false
            });
            setInitialPrompt(true);

        }
    }, [address, initialPromptRedux])

    const [showUnregisterConfirmationModal, setShowUnregisterConfirmationModal] = useState(false);

    const onClickUnregisterPrep = () => {
        unregisterPrep();
    }

    const onClickRegisterPrep = () => {
        registerPrep();
    }

    return (
    <>
            <span onClick={() => setModalShow(true)} className={styles.address} style = {landingPage ? {color: 'white'} : {}}>{(firstName || lastName) ? `${firstName || ''} ${lastName || ''}` : `${address?.slice(0, 4)}...${address?.slice(address.length - 2)}`} ({walletBalance?.toFixed(2)} ICX)</span>
            {
                isPrep && isRegistered && !payPenalty && period === 'APPLICATION' && !isRemainingTimeZero &&
                <Button variant="danger" onClick={() => setShowUnregisterConfirmationModal(true)} style={{ marginRight: '5px', marginLeft: '5px' }}>Unregister Prep</Button>

            }

            {
                isPrep && !isRegistered && !payPenalty && !isRemainingTimeZero &&
                <Button variant="success" onClick={() => setShowUnregisterConfirmationModal(true)} style={{ marginRight: '5px', marginLeft: '5px' }}>Register Prep</Button>

            }




            {/* <span style = {{marginRight: '3px'}} className = "text-primary">Wallet Balance - {walletBalance.toFixed(2)} ICX</span> */}
            {
                landingPage ?
                <Link to="/dashboard">
                    <Button variant="outline-light" className={styles.button} style = {{marginRight: '5px', marginLeft: '3px'}}>GO TO CONSOLE</Button>
                </Link> : null
            }
            <Button variant={landingPage ? "light" : "info"} onClick={onLogout}>Logout</Button>

        <ConfirmationModal
            show={showUnregisterConfirmationModal}
            onHide={() => setShowUnregisterConfirmationModal(false)}
            heading={isRegistered ? 'Unregister Prep Confirmation' : 'Register Prep Confirmation'}
            onConfirm={() => {
                if (isRegistered) {
                    onClickUnregisterPrep();
                }
                else {
                    onClickRegisterPrep();

                }
            }} >
            {
                <>
                    <div>Are you sure you want to {isRegistered ? 'unregister from' : 'register to'} Prep List?</div>
                    {
                        !isRegistered &&
                        <div style={{ color: 'red' }}>Please note that if you miss a vote you will be required to pay a penalty before re-registering.</div>

                    }
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

    </>
    );
}


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
    email:state.user.email,
    verified: state.user.verified,

    initialPromptRedux: state.user.initialPrompt

})

const mapDispatchToProps = dispatch => (
    {
        logout: () => dispatch(logout()),
        unregisterPrep: () => dispatch(unregisterPrep()),
        registerPrep: () => dispatch(registerPrep()),
        setLoginButtonClicked: (payload) => dispatch(setLoginButtonClicked(payload)),
        setUserDataSubmitSuccess: (payload) => dispatch(setUserDataSubmitSuccess(payload))

    }
)


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderComponents));
