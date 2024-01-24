import React, { useEffect } from 'react';
import Layout from './Containers/Layout';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
import {
  fetchUserDataRequest,
  fetchUserPromptRequest,
} from 'Redux/Reducers/userSlice';
import Footer from 'Components/Footer';
import { Helmet } from 'react-helmet';
import UnsubscribePage from 'Containers/UnsubscribePage';
import VerifiedPage from 'Containers/VerifiedPage';
import { fetchbnUSDAddressRequest,fetchPrePaymentAmountRequest,  fetchCPSTreasuryScoreAddressRequest, } from './Redux/Reducers/fundSlice';
import LandingPage from './Containers/LandingPage';
import { useDispatch } from 'react-redux';
import { setTheme } from './Redux/Reducers/themeSlice';
import { fetchSponsorBondPercentageRequest } from './Redux/Reducers/prepsSlice';

function App({
  address,
  fetchUserDataRequest,
  fetchCPSTreasuryScoreAddressRequest,
  cpsTreasuryScoreAddress,
  fetchSponsorBondPercentageRequest,
  fetchPrePaymentAmountRequest,
  fetchUserPromptRequest,
  fetchbnUSDAddressRequest,
}) {
  const dispatch = useDispatch();
  useEffect(() => {
    address && fetchUserDataRequest();
    address && fetchUserPromptRequest();
  }, [address]);

  //changes the theme based on the system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = event => {
      // console.log(event.matches);
      // const newTheme = event.matches;
      dispatch(setTheme(event.matches));
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [dispatch]);

  const setThemeAtStartup = () => {
    const setDark = () => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    };

    const setLight = () => {
      localStorage.setItem('theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    };

    const storedTheme = localStorage.getItem('theme');

    // const defaultDark =
    //   storedTheme === 'dark' || (storedTheme === null && prefersDark);

    if (storedTheme === 'light') {
      setLight();
    } else {
      setDark();
    } 
  };

  setThemeAtStartup();
  useEffect(() => {
    fetchCPSTreasuryScoreAddressRequest();
    fetchSponsorBondPercentageRequest();
    fetchbnUSDAddressRequest();
  
  }, []);
  useEffect(() => {
    fetchPrePaymentAmountRequest();
  }, [cpsTreasuryScoreAddress]);
  return (
    <>
      <Switch>
        <Route exact path={process.env.PUBLIC_URL + '/'}>
          <>
            {
              <>
                <LandingPage />

                <Helmet>
                  <title>CPS</title>
                </Helmet>
              </>
            }
          </>
        </Route>

        <Route exact path={'/unsubscribe'}>
          <UnsubscribePage />
          <Helmet>
            <title>CPS - Unsubscribe</title>
          </Helmet>
        </Route>

        <Route exact path={'/email-verified'}>
          <VerifiedPage />
          <Helmet>
            <title>CPS - Email Verified</title>
          </Helmet>
        </Route>

        <Route path={process.env.PUBLIC_URL + '/'}>
          <Layout />
        </Route>
      </Switch>
      <NotificationContainer />
    </>
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
    cpsTreasuryScoreAddress: state.fund.cpsTreasuryScoreAddress,
  };
};

const mapDispatchToProps = {
  fetchUserDataRequest,
  fetchUserPromptRequest,
  fetchSponsorBondPercentageRequest,
  fetchCPSTreasuryScoreAddressRequest,
  fetchbnUSDAddressRequest,
  fetchPrePaymentAmountRequest
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
