import React, { useState } from "react";
import { Row } from "react-bootstrap";
import styles from "./Header.module.css";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";
import { logout } from "../../Redux/Reducers/accountSlice";
import { unregisterPrep, registerPrep } from "Redux/Reducers/prepsSlice";
import ConfirmationModal from "Components/UI/ConfirmationModal";
import UserInfoFormModal from "./UserInfoFormModal";
import useTimer from "Hooks/useTimer";
import HeaderComponents from "./HeaderComponents";

const Header = ({
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
}) => {
  return (
    <>
      <Row className={styles.headerContainer} style={{ marginTop: "15px" }}>
        {window.innerWidth <= 1200 && (
          <span className={styles.heading} style={{ marginTop: "0px" }}>
            {title}
          </span>
        )}

        <div className={styles.headerComp1}>
          {window.innerWidth < 768 && <HeaderComponents />}
        </div>
        <div className={styles.account}>
          {window.innerWidth >= 768 && <HeaderComponents />}
        </div>
      </Row>

      {window.innerWidth > 1200 && (
        <Row style={{ justifyContent: "center", marginTop: "2px" }}>
          <span
            className={styles.heading}
            style={{ marginTop: "0px", textAlign: "center" }}
          >
            {title}
          </span>
        </Row>
      )}
      {/* 
        <Row>
        <span>Wallet Balance - {walletBalance.toFixed(2)} ICX</span>

        </Row> */}
    </>
  );
};

const mapStateToProps = (state) => ({
  address: state.account.address,
  isPrep: state.account.isPrep,
  isRegistered: state.account.isRegistered,
  payPenalty: state.account.payPenalty,
  walletBalance: state.account.walletBalance,

  period: state.period.period,
  firstName: state.user.firstName,
  lastName: state.user.lastName,
});

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(logout()),
  unregisterPrep: () => dispatch(unregisterPrep()),
  registerPrep: () => dispatch(registerPrep()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
