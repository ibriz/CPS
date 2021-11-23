import React from 'react';
import { Waypoint } from 'react-waypoint';

const GrantProcess = (props) => {

    const { grantProcessRef } = props;

    return (
        <Waypoint
            onEnter={() => {
                // setActiveTabCenter('grantProcess')
            }}
            onLeave={() => {
                // setActiveTabCenter('')
            }}

        >

            <div ref={grantProcessRef} className="landingPage__GrantProcess">
                <div className="grantProcessContainer scrollSection" id="grantProcess">
                    <h1>Grant Process</h1>
                    <p>Here’s how the CPS Grants Program process works, from application to finish line </p>
                    <div className="process">
                        <ul>
                            <li className="current"><h3>Read through “Start Here” guide</h3>
                                <p>Read through the “Start Here” guide on the Console to familiarize yourself with the CPS and the application process in detail.</p></li>
                            <li className="current">
                                <h3>Log in/Create an account in the CPS Console</h3>
                                <p>Explore the CPS Console and all the current proposals/active projects being funded.
                                </p>
                            </li>
                            <li className="current"><h3>Submit your Grant Application
                            </h3>
                                <p>Using our standardized application form, provide the details for your desired project and find a P-Rep to sponsor your idea.
                                </p></li>
                            <li className="current">
                                <h3>Evaluation by P-Reps</h3>
                                <p>During the “Voting Period”, P-Reps will vote on your application and either “Approve” or “Deny” your concept. Improve your chances in this stage by answering questions and advocating for your idea.
                                </p>
                            </li>
                            <li className="current "><h3>Proposal decision</h3>

                                <p>
                                    If you project is accepted during the "Voting Period", you will have 15 days (the length of the next application period), to submit a "Progress Report". Your Progress Report is then voted on during the next "Voting Period", and if accepted you will receive your first milestone of funds.
                                </p>
                            </li>
                            <li className="current"><h3>Build!
                            </h3>
                                <p>Congratulations! As said in the "Acceptance" stage, you now can build your project, and after submitting progress reports that are accepted, you will receive funding for your hard work. After you complete your project, it's time to submit a new idea and continue to grow the ICON ecosystem!
                                </p></li>
                        </ul>
                    </div>
                </div>
            </div >
        </Waypoint>
    )
}

export default GrantProcess;