import React, {useState} from 'react';
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

const HeaderComponents = ({ address, logout, title, isPrep, isRegistered, unregisterPrep, registerPrep,period, payPenalty, firstName, lastName, walletBalance, landingPage }) => {


    const [modalShow, setModalShow] = React.useState(false);

    const {isRemainingTimeZero} = useTimer();

    const onLogout = () => {
        logout();
    }

    const [showUnregisterConfirmationModal, setShowUnregisterConfirmationModal] = useState(false);

    const onClickUnregisterPrep = () => {
        unregisterPrep();
    }

    const onClickRegisterPrep = () => {
        registerPrep();
    }

    return (
    <>
        <div className={styles.account}>
            <span onClick={() => setModalShow(true)} className={styles.address} style = {landingPage ? {color: 'white'} : {}}>{(firstName || lastName) ? `${firstName || ''} ${lastName || ''}` : `${address.slice(0, 4)}...${address.slice(address.length - 2)}`} ({walletBalance.toFixed(2)} ICX)</span>
            {
                isPrep && isRegistered && !payPenalty && period === 'APPLICATION' && !isRemainingTimeZero &&
                <Button variant="danger" onClick={() => setShowUnregisterConfirmationModal(true)} style={{ marginRight: '5px', marginLeft: '5px' }}>Unregister Prep</Button>

            }

            {
                isPrep && !isRegistered && !payPenalty && period === 'APPLICATION' && !isRemainingTimeZero &&
                <Button variant="success" onClick={() => setShowUnregisterConfirmationModal(true)} style={{ marginRight: '5px', marginLeft: '5px' }}>Register Prep</Button>

            }




            {/* <span style = {{marginRight: '3px'}} className = "text-primary">Wallet Balance - {walletBalance.toFixed(2)} ICX</span> */}
            {
                landingPage ?
                <Link to="/dashboard">
                    <Button variant="outline-light" className={styles.button} style = {{marginRight: '5px'}}>GO TO CONSOLE</Button>
                </Link> : null
            }
            <Button variant={landingPage ? "danger" : "info"} onClick={onLogout}>Logout</Button>
        </div>

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
                        <div style={{ color: 'red' }}>If you miss voting on voting period you should pay penalty to re-register.</div>

                    }
                </>
            }

        </ConfirmationModal>

        <UserInfoFormModal
            show={modalShow}
            setModalShow={setModalShow}
            onHide={() => setModalShow(false)}
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


    period: state.period.period,
    firstName: state.user.firstName,
    lastName: state.user.lastName

})

const mapDispatchToProps = dispatch => (
    {
        logout: () => dispatch(logout()),
        unregisterPrep: () => dispatch(unregisterPrep()),
        registerPrep: () => dispatch(registerPrep()),

    }
)


export default connect(mapStateToProps, mapDispatchToProps)(HeaderComponents);
