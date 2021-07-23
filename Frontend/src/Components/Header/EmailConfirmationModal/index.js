import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import React, { useState, useEffect } from "react";
import ClassNames from "classnames";
import { AiFillCheckCircle } from "react-icons/ai";
import styles from "../UserInfoFormModal/UserInfoFormModal.module.scss";
import { connect } from "react-redux";

import { resendVerificationEmailRequest } from "Redux/Reducers/userSlice";
import ConfirmationModal from "Components/UI/ConfirmationModal";
import { useDispatch, useSelector } from "react-redux";

const EmailConfirmationModal = ({
  user,
  resendVerificationEmailRequest,
  setModalShow,
  address,
  ...props
}) => {
  const verified = useSelector((state) => state.user.verified);

  const [userData, setUserData] = useState({
    firstName: null,
    lastName: null,
    email: null,
    enableEmailNotifications: false,
  });

  useEffect(
    () =>
      user &&
      setUserData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        enableEmailNotifications: user.enableEmailNotifications,
      }),
    [user]
  );

  let [confirmationShow, setConfirmationShow] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setConfirmationShow(true);
  };

  const handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value;

    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckedChange = (event) => {
    let name = event.target.name;
    let value = event.target.checked;

    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      style={{ color: "#262626" }}
    >
      <Modal.Header
        closeButton
        style={confirmationShow ? { backgroundColor: "#DDDDDD" } : {}}
      >
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ color: "#262626" }}
        >
          {verified ? "Email Verified" : "Email Verfication Required"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className={styles.modalBody}
        style={confirmationShow ? { backgroundColor: "#DDDDDD" } : {}}
      >
        {verified ? (
          <span style={{ display: "flex", alignItems: "center" }}>
            <AiFillCheckCircle
              className="text-success"
              style={{ fontSize: "18px", marginRight: "2px" }}
            />{" "}
            <span>Your email has been verified</span>
          </span>
        ) : (
          <>
            <span style={{ display: "flex", alignItems: "center" }}>
              <AiFillCheckCircle
                className="text-success"
                style={{ fontSize: "18px", marginRight: "2px" }}
              />{" "}
              <span>
                A verification link has been sent to your email address.
              </span>
            </span>
            Please click on the link that has been just sent to your email
            address in order to receive email notifications.
            <br /> Didn't receive email or the email link expired?{" "}
            <span
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => setConfirmationShow(true)}
            >
              Resend email confirmation
            </span>
          </>
        )}
      </Modal.Body>

      <ConfirmationModal
        show={confirmationShow}
        onHide={() => setConfirmationShow(false)}
        heading={"Resend Email Verification Confirmation"}
        onConfirm={() => {
          resendVerificationEmailRequest();
          setModalShow(false);
        }}
      >
        {
          <>
            <div>Are you sure you want to resend verification email?</div>
          </>
        }
      </ConfirmationModal>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  address: state.account.address,
});

const mapDispatchToProps = {
  resendVerificationEmailRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailConfirmationModal);
