import React, {useState} from 'react';
import { Row } from 'react-bootstrap';
import styles from './Header.module.css'
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { logout } from '../../Redux/Reducers/accountSlice';
import {unregisterPrep} from 'Redux/Reducers/prepsSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';

const Header = ({ address, logout, title, isPrep, unregisterPrep }) => {

    const onLogout = () => {
        logout();
    }

    const [showUnregisterConfirmationModal, setShowUnregisterConfirmationModal] = useState(false);

    const onClickUnregisterPrep = () => {
        unregisterPrep();
    }

    return (
        <Row className = {styles.headerContainer} >
            <span className={styles.heading}>{title}</span>

            <div className={styles.account}>
                <span>{`${address.slice(0,4)}...${address.slice(address.length-2)}`}</span>
                {/* {
                    isPrep &&
                    <Button variant="danger" onClick={() => setShowUnregisterConfirmationModal(true)} style = {{marginRight: '5px', marginLeft: '5px'}}>Unregister Prep</Button>

                } */}

                <Button variant="info" onClick={onLogout}>Logout</Button>
            </div>

            <ConfirmationModal
                show={showUnregisterConfirmationModal}
                onHide={() => setShowUnregisterConfirmationModal(false)}
                heading={'Unregister Prep Confirmation'}
                onConfirm={() => {
                    onClickUnregisterPrep(

                    )
                }} >
                {                 
                        <>
                            <div>Are you sure you want to unregister from Prep List?</div>
                        </> 
                }

            </ConfirmationModal>
        </Row>
    )
}

const mapStateToProps = state => ({
    address: state.account.address,
    isPrep: state.account.isPrep
})

const mapDispatchToProps = dispatch => (
    {
        logout: () => dispatch(logout()),
        unregisterPrep: () => dispatch(unregisterPrep()),
    }
)

export default connect(mapStateToProps, mapDispatchToProps)(Header);