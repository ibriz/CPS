import React from 'react';
import { FaBars } from 'react-icons/fa';
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Dashboard from '../Dashboard';
import ProgressReports from '../ProgressReports';
import Proposals from '../Proposals';
import ProposalCreationPage from '../ProposalCreationPage';
import ProgressReportCreationPage from '../ProgressReportCreationPage';
import SponsorRequests from '../SponsorRequests';
import Voting from '../Voting';
import BackedProjects from '../BackedProjects';
import { connect } from 'react-redux';
import Footer from 'Components/Footer';
import { Helmet } from "react-helmet";
import useTimer from 'Hooks/useTimer';

const Main = ({
  handleToggleSidebar,
  isPrep,
  isRegistered,
  period
}) => {

  const {isRemainingTimeZero} = useTimer();

  const prepRoute = (component) => (
    (isPrep && isRegistered) ?
      component :
      <Redirect to='/' />
  )

  const userRoute = (component) => (
    (!isPrep || !isRegistered) ?
      component :
      <Redirect to='/' />
  )

  const applicationPeriodRoute = (component) => (
    (period == 'APPLICATION' && !isRemainingTimeZero) ?
      component :
      // <Redirect to='/' />
      component
  )

  return (
    <>
      <main style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div style={{ paddingLeft: '25px', paddingRight: '25px' }}>
          <div className="btn-toggle" onClick={() => handleToggleSidebar(true)}>
            <FaBars />
          </div>

          <div className="block ">
            <Switch>
              <Route path="/dashboard">
                <Dashboard />
                <Helmet>
                  <title>CPS - Dashboard</title>
                </Helmet>
              </Route>
              <Route path={process.env.PUBLIC_URL + "/proposals"}>
                {<Proposals />}
                <Helmet>
                  <title>CPS - Proposals</title>
                </Helmet>
              </Route>
              <Route path="/progress-reports">
                {<ProgressReports />}
                <Helmet>
                  <title>CPS - Progress Reports</title>
                </Helmet>
              </Route>
              <Route path="/newProposal">
                {applicationPeriodRoute(
                  <>
                    {userRoute(<ProposalCreationPage />)}
                    <Helmet>
                      <title>CPS - Create New Proposal</title>
                    </Helmet>
                  </>

                )
                }

              </Route>
              <Route path="/newProgressReport">
                {
                  applicationPeriodRoute(
                    <>
                      {userRoute(<ProgressReportCreationPage />)}
                      <Helmet>
                        <title>CPS - Create New Progress Report</title>
                      </Helmet>
                    </>
                  )
                }

              </Route>
              {/* <Route path="/sponsorRequests">
            {prepRoute(<SponsorRequests />)}

          </Route> */}
              {/* <Route path="/voting">
            {prepRoute(<Voting />)}
          </Route> */}
              {/* <Route path="/backed-projects">
            {prepRoute(<BackedProjects />)}
          </Route> */}
              <Route path="/">
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



const mapStateToProps = state => (
  {
    isPrep: state.account.isPrep,
    isRegistered: state.account.isRegistered,
    period: state.period.period

  }
)

export default connect(mapStateToProps)(Main);
