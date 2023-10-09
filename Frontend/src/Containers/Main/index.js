import React from 'react';
import { FaBars } from 'react-icons/fa';
import { Switch, Route, Redirect } from 'react-router-dom';
import Dashboard from '../Dashboard';
import ProgressReports from '../ProgressReports';
import Proposals from '../Proposals';
import ProposalCreationPage from '../ProposalCreationPage';
import ProgressReportCreationPage from '../ProgressReportCreationPage';
import SponsorRequests from '../SponsorRequests';
import Voting from '../Voting';
import ActiveProposals from '../ActiveProposals';
import BackedProjects from '../BackedProjects';
import { connect } from 'react-redux';
import Footer from 'Components/Footer';
import { Helmet } from 'react-helmet';
import useTimer from 'Hooks/useTimer';
import Home from 'Containers/Home';
import Header from '../../Components/Header';
import DetailsModal from '../../Components/Card/DetailsModal';
import ProposalDetailsPage from 'Containers/ProposalDetailsPage';
import ProgressReportDetailsPage from 'Containers/ProgressReportDetailsPage';
import StatsPage from 'Containers/StatsPage';
import ProposalHistoryPage from 'Containers/ProposalHistoryPage';

const Main = ({
  handleToggleSidebar,
  isPrep,
  isRegistered,
  period,
  address,
}) => {
  const { isRemainingTimeZero } = useTimer();

  const prepRoute = component =>
    isPrep && isRegistered ? component : <Redirect to='/' />;

  const userRoute = component =>
    !isPrep || !isRegistered ? component : <Redirect to='/' />;

  const applicationPeriodRoute = component =>
    period !== 'VOTING' ? component : <Redirect to='/' />;
  // component

  return (
    <>
      <main
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <Header />
        <div
          style={{
            paddingLeft: '25px',
            paddingRight: '25px',
     
            height:
              !address && window.location.pathname === '/dashboard'
                ? '100%'
                : '',
          }}
        >
          <div className='btn-toggle' onClick={() => handleToggleSidebar(true)}>
            <FaBars />
          </div>

          <div
            className='block '
            style={{
              height:
                !address && window.location.pathname === '/dashboard'
                  ? '100%'
                  : '',
            }}
          >
            <Switch>
              <Route path='/dashboard'>
                <Dashboard />
                <Helmet>
                  <title>CPS - Dashboard</title>
                </Helmet>
              </Route>
              <Route path={process.env.PUBLIC_URL + '/proposals/:id'}>
                {/* <Proposals /> */}

                {<ProposalDetailsPage show={true} />}

                {/* {address ? (
                  <Proposals />
                ) : (
                  <>
                    <Home />
                    <Footer />

                    <Helmet>
                      <title>CPS</title>
                    </Helmet>
                  </>
                )} */}
                <Helmet>
                  <title>CPS - Proposals</title>
                </Helmet>
              </Route>

              <Route path={process.env.PUBLIC_URL + '/proposals'}>
                {<Proposals />}
                <Helmet>
                  <title>CPS - Proposals</title>
                </Helmet>
              </Route>

              <Route path={process.env.PUBLIC_URL + '/active-proposals'}>
                {<ActiveProposals />}
                <Helmet>
                  <title>CPS - Active Proposals</title>
                </Helmet>
              </Route>

              <Route path={process.env.PUBLIC_URL + '/voting/:id'}>
                {/* <Proposals /> */}

                {<ProposalDetailsPage show={true} />}

                {/* {address ? (
                  <Proposals />
                ) : (
                  <>
                    <Home />
                    <Footer />

                    <Helmet>
                      <title>CPS</title>
                    </Helmet>
                  </>
                )} */}
                <Helmet>
                  <title>CPS - Voting</title>
                </Helmet>
              </Route>

              <Route path={process.env.PUBLIC_URL + '/voting'}>
                {<Voting />}
                <Helmet>
                  <title>CPS - Voting</title>
                </Helmet>
              </Route>

              <Route path='/progress-reports/:id'>
                {/* {<ProgressReports />} */}
                <ProgressReportDetailsPage />
                <Helmet>
                  <title>CPS - Progress Reports</title>
                </Helmet>
              </Route>
              <Route path='/progress-reports'>
                {<ProgressReports />}
                <Helmet>
                  <title>CPS - Progress Reports</title>
                </Helmet>
              </Route>
              <Route path='/proposal-history'>
                <>
                  {<ProposalHistoryPage />}
                  <Helmet>
                    <title>CPS - Proposal History</title>
                  </Helmet>
                </>
              </Route>
              <Route path='/stats'>
                <>
                  {<StatsPage />}
                  <Helmet>
                    <title>CPS - Stats</title>
                  </Helmet>
                </>
              </Route>

              <Route path='/newProposal'>
                <>
                  {<ProposalCreationPage />}
                  <Helmet>
                    <title>CPS - Create New Proposal</title>
                  </Helmet>
                </>
              </Route>
              <Route path='/newProgressReport'>
                {
                  <>
                    {<ProgressReportCreationPage />}
                    <Helmet>
                      <title>CPS - Create New Progress Report</title>
                    </Helmet>
                  </>
                }
              </Route>
              {/* <Route path="/sponsorRequests">
            {prepRoute(<SponsorRequests />)}

          </Route> */}
              {/* /* <Route path="/voting">
            {prepRoute(<Voting />)}
          </Route> */
              /* <Route path="/backed-projects">
            {prepRoute(<BackedProjects />)}
          </Route> */}
              <Route path='/'>
                <Dashboard />
                <Helmet>
                  <title>CPS - Dashboard</title>
                </Helmet>
              </Route>
            </Switch>

            {/* <Footer /> */}
            {/* <Footer /> */}
          </div>
        </div>

        <Footer console />
      </main>
    </>
  );
};

const mapStateToProps = state => ({
  isPrep: state.account.isPrep,
  isRegistered: state.account.isRegistered,
  period: state.period.period,
  address: state.account.address,
});

export default connect(mapStateToProps)(Main);
