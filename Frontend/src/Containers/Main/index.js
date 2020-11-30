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

const Main = ({
  handleToggleSidebar,
  isPrep,
  isRegistered
}) => {

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

  return (
    <>
      <main style = {{display: 'flex', justifyContent: 'space-between', paddingBottom: 0, paddingLeft: 0, paddingRight: 0}}>
        <div style = {{paddingLeft: '25px', paddingRight: '25px'}}>
          <div className="btn-toggle" onClick={() => handleToggleSidebar(true)}>
            <FaBars />
          </div>

          <div className="block ">
            <Switch>
              <Route path="/dashboard">
                <Dashboard />
              </Route>
              <Route path={process.env.PUBLIC_URL + "/proposals"}>
                {<Proposals />}
              </Route>
              <Route path="/progress-reports">
                {<ProgressReports />}
              </Route>
              <Route path="/newProposal">
                {userRoute(<ProposalCreationPage />)}
              </Route>
              <Route path="/newProgressReport">
                {userRoute(<ProgressReportCreationPage />)}
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
    isRegistered: state.account.isRegistered

  }
)

export default connect(mapStateToProps)(Main);
