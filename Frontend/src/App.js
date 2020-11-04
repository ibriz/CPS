import React from 'react';
import Layout from './Containers/Layout';
import Home from './Containers/Home';
import { Switch, Route} from 'react-router-dom';
import { connect } from 'react-redux'
import { NotificationContainer} from 'react-notifications';

function App({ address }) {

  return (
    <>
      <Switch>
        <Route path={process.env.PUBLIC_URL + "/"}>
          {address ? <Layout /> :
            <Home />}
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

export default connect(mapStateToProps)(App);