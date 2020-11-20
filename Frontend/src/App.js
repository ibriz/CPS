import React, { useEffect } from 'react';
import Layout from './Containers/Layout';
import Home from './Containers/Home';
import { Switch, Route} from 'react-router-dom';
import { connect } from 'react-redux'
import { NotificationContainer} from 'react-notifications';
import {fetchUserDataRequest} from 'Redux/Reducers/userSlice';
import Footer from 'Components/Footer';

function App({ address, fetchUserDataRequest }) {

  useEffect(() => {
    address && fetchUserDataRequest();
  }, [address])

  return (
    <>
      <Switch>
        <Route path={process.env.PUBLIC_URL + "/"}>
          <>
          {address ? <Layout /> :
          <>
            <Home />
            <Footer />

          </>}
            </>
        </Route>
      </Switch>
      <NotificationContainer />

    </>
  );
}

const mapStateToProps = (state) => {
  return {
    address: state.account.address
  }
}

const mapDispatchToProps = {
  fetchUserDataRequest
}

export default connect(mapStateToProps, mapDispatchToProps)(App);