import React, { useEffect } from 'react';
import Layout from './Containers/Layout';
import Home from './Containers/Home';
import { Switch, Route, Redirect} from 'react-router-dom';
import { connect } from 'react-redux'
import { NotificationContainer} from 'react-notifications';
import {fetchUserDataRequest} from 'Redux/Reducers/userSlice';
import Footer from 'Components/Footer';
import { Helmet } from "react-helmet";
import UnsubscribePage from 'Containers/UnsubscribePage'

function App({ address, fetchUserDataRequest }) {

  useEffect(() => {
    address && fetchUserDataRequest();
  }, [address])

  return (
    <>
      <Switch>
        <Route exact path={process.env.PUBLIC_URL + "/"}>
          <>
          {
          <>
            <Home />
            <Footer />

            <Helmet>
                  <title>CPS</title>
            </Helmet>

          </>}
            </>
        </Route>

        <Route exact path = {"/unsubscribe"}>
            <UnsubscribePage />
            <Helmet>
                  <title>CPS - Unsubscribe</title>
            </Helmet>
        </Route>

        <Route path={process.env.PUBLIC_URL + "/"}>
          <>
          {address ? <Layout /> :
              <Redirect to = "/"></Redirect>
          }
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