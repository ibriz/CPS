import React, {useState} from 'react';
import { Row } from 'react-bootstrap';
import styles from './Header.module.css'
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { logout } from '../../Redux/Reducers/accountSlice';
import {unregisterPrep, registerPrep} from 'Redux/Reducers/prepsSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';

const Header = ({ address, logout, title, isPrep, isRegistered, unregisterPrep, registerPrep }) => {

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
        <Row className = {styles.headerContainer} >
            <span className={styles.heading}>{title}</span>

            <div className={styles.account}>
                <span>{`${address.slice(0,4)}...${address.slice(address.length-2)}`}</span>
                {
                    isPrep && isRegistered &&
                    <Button variant="danger" onClick={() => setShowUnregisterConfirmationModal(true)} style = {{marginRight: '5px', marginLeft: '5px'}}>Unregister Prep</Button>

                }

{
                    isPrep && !isRegistered &&
                    <Button variant="success" onClick={() => setShowUnregisterConfirmationModal(true)} style = {{marginRight: '5px', marginLeft: '5px'}}>Register Prep</Button>

                }

                <Button variant="info" onClick={onLogout}>Logout</Button>
            </div>

            <ConfirmationModal
                show={showUnregisterConfirmationModal}
                onHide={() => setShowUnregisterConfirmationModal(false)}
                heading={isRegistered? 'Unregister Prep Confirmation' : 'Register Prep Confirmation'}
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
                        </> 
                }

            </ConfirmationModal>
        </Row>
    )
}

const mapStateToProps = state => ({
    address: state.account.address,
    isPrep: state.account.isPrep,
    isRegistered: state.account.isRegistered

})

const mapDispatchToProps = dispatch => (
    {
        logout: () => dispatch(logout()),
        unregisterPrep: () => dispatch(unregisterPrep()),
        registerPrep: () => dispatch(registerPrep()),

    }
)

export default connect(mapStateToProps, mapDispatchToProps)(Header);