import React from 'react';
import Header from '../../Components/Header';
import { Container, Button } from 'react-bootstrap';
import useQuery from 'Hooks/useQuery';
import styles from './unsubscribePage.module.scss';
import Footer from 'Components/Footer';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { connect } from 'react-redux';
import store from 'Redux/Store';
import { NotificationManager } from 'react-notifications';
import { request } from 'Redux/Sagas/helpers';
import { withRouter } from 'react-router-dom';

const UnsubscribePage = ({ hasAddress, history }) => {
  let query = useQuery();
  let walletAddress = query.get('address');

  let [
    unsubscribeConfirmationShow,
    setUnsubscribeConfirmationShow,
  ] = React.useState(false);

  const customEvent = new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: {
      type: 'REQUEST_HAS_ADDRESS',
      payload: `${walletAddress}`,
    },
  });

  const checkHasAddressPromise = () => {
    return new Promise((resolve, reject) => {
      const interFunction = () => {
        const hasAddress = store.getState().account.hasAddress;
        if (hasAddress !== undefined && hasAddress !== null) {
          clearInterval(interFunction);
          resolve({
            hasAddress,
          });
          return;
        }
      };

      setInterval(interFunction, 100);
    });
  };

  const onClickOptOut = async () => {
    window.dispatchEvent(customEvent);
    const hasAddress = await checkHasAddressPromise();
    console.log('hasAddress', hasAddress);
    if (hasAddress.hasAddress) {
      setUnsubscribeConfirmationShow(true);
    } else {
      NotificationManager.error(
        `The address ${`${walletAddress.slice(0, 8)}...${walletAddress.slice(
          walletAddress.length - 4,
        )}`} not found in the ICONEX`,
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <Container style={{ color: '#262626' }}>
        <div className={styles.title}>Email Notification Opt Out</div>
        <div className={styles.confirmationMessage}>
          Are you sure you want to opt out of the email list for the wallet
          address <span style={{ fontWeight: '600' }}>{walletAddress}</span>
        </div>
        <div className={styles.optOutButtonContainer}>
          <Button
            variant='primary'
            className={styles.optOutButton}
            onClick={onClickOptOut}
          >
            Yes, I would like to opt out.
          </Button>
        </div>
      </Container>
      <Footer console />

      <ConfirmationModal
        show={unsubscribeConfirmationShow}
        onHide={() => setUnsubscribeConfirmationShow(false)}
        heading={'Email Notification Opt Out Confirmation'}
        size='md'
        onConfirm={() => {
          request({
            body: {
              address: walletAddress,
            },
            url: 'user/',
            requireSigning: true,
            walletAddress,
            method: 'PUT',
            callBackAfterSigning: () => {
              NotificationManager.info('Unsubscription Request Sent');
              history.push('/');
            },
            successCallback: () => {
              NotificationManager.success('Unsubscription Success');
            },
            failureCallback: error => {
              if (error === '-1') {
                return;
              }
              NotificationManager.error(error, 'Unsubscription failed');
            },
          });
          // NotificationManager.success("Unsubscribed Successfully")
        }}
      >
        {
          <>
            <div>Are you sure you want to opt out of the email list?</div>
          </>
        }
      </ConfirmationModal>
    </div>
  );
};

const mapStateToProps = state => ({
  hasAddress: state.account.hasAddress,
});

export default withRouter(connect(mapStateToProps)(UnsubscribePage));
