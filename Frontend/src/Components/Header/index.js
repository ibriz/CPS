import React from 'react';
import { Row } from 'react-bootstrap';
import styles from './Header.module.css'
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { logout } from '../../Redux/Reducers/accountSlice'

const Header = ({ address, logout, title }) => {

    const onLogout = () => {
        logout();
    }


    return (
        <Row className = {styles.headerContainer} >
            <span className={styles.heading}>{title}</span>

            <div className={styles.account}>
                <span>{`${address.slice(0,4)}...${address.slice(address.length-2)}`}</span>
                <Button variant="info" onClick={onLogout}>Logout</Button>
            </div>
        </Row>
    )
}

const mapStateToProps = state => ({
    address: state.account.address
})

const mapDispatchToProps = dispatch => (
    {
        logout: () => dispatch(logout())
    }
)

export default connect(mapStateToProps, mapDispatchToProps)(Header);