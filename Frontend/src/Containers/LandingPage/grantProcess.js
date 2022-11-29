import React from 'react';
import { Waypoint } from 'react-waypoint';
import { Link } from 'react-router-dom';

const GrantProcess = props => {
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
      <div ref={grantProcessRef} className='landingPage__GrantProcess'>
        <div className='grantProcessContainer scrollSection' id='grantProcess'>
          <h1>Grant Process</h1>
          <p>
            Here’s how the CPS Grants Program process works, from application to
            finish line{' '}
          </p>
          <div className='processContainer'>
            <div className='process'>
              <ul>
                <li className='current'>
                  <h3>Familiarize yourself with the CPS</h3>
                  {/* <p>
                    Read through the{' '}
                    <a
                      href='https://medium.com/iconosphere-io/how-to-use-the-contribution-proposal-system-1efe714c9182'
                      target='_blank'
                    >
                      “Getting Started” guide{' '}
                    </a>
                    ,{' '}
                    <a
                      href='https://github.com/icon-community/CPS/wiki/Applicant-Flow'
                      target='_blank'
                    >
                      Applicant Flow{' '}
                    </a>
                    ,{' '}
                    <a
                      href='https://github.com/icon-community/CPS/wiki/Application-Templates'
                      target='_blank'
                    >
                      Application Templates
                    </a>{' '}
                    and{' '}
                    <a
                      href='https://github.com/icon-community/CPS/wiki/Project-Activity-Flow-States'
                      target='_blank'
                    >
                      Project Activity Flow States{' '}
                    </a>{' '}
                    to familiarize yourself with the CPS and the application
                    process in detail.
                  </p> */}
                </li>
                <li className='current'>
                  <h3>Log in/Create an account in the CPS App</h3>
                  {/* <p>
                    Explore the <Link to='/dashboard'>CPS App</Link> and all the
                    current proposals/active projects being funded.
                  </p> */}
                </li>
                <li className='current'>
                  <h3>Submit your Grant Application</h3>
                  {/* <p>
                    Using our{' '}
                    <a
                      href='https://github.com/icon-project/grants-program/blob/main/templates/yymmdd-project-proposal.md'
                      target='_blank'
                    >
                      standardized application form
                    </a>
                    , provide the details for your desired project and find a
                    Validator to sponsor your idea.
                  </p> */}
                </li>
                <li className='current'>
                  <h3>Evaluation by Validators</h3>
                  {/* <p>
                    During the “Voting Period”, Validators will vote on your
                    application and either “Approve” or “Deny” your concept.
                    Improve your chances in this stage by answering questions
                    and advocating for your idea.
                  </p> */}
                </li>
                <li className='current '>
                  <h3>Proposal decision</h3>

                  {/* <p>
                    If your project is accepted during the "Voting Period", you
                    will have 15 days (the length of the next application
                    period), to submit a{' '}
                    <a
                      href='https://github.com/icon-project/grants-program/blob/main/templates/yymmdd-project-progress-report.md'
                      target='_blank'
                    >
                      "Progress Report"{' '}
                    </a>
                    . Your Progress Report is then voted on during the next
                    "Voting Period", and if accepted you will receive your first
                    milestone of funds.
                  </p> */}
                </li>
                <li className='current'>
                  <h3>Build</h3>
                  {/* <p>
                    Congratulations! As said in the "Acceptance" stage, you can
                    now build your project, and after submitting progress
                    reports that are accepted, you will receive funding for your
                    hard work. After you complete your project, it's time to
                    submit a new idea and continue to grow the ICON ecosystem!
                  </p> */}
                </li>
              </ul>
            </div>

            <div className='processDescription'>
              <p>
                Read through the{' '}
                <a
                  href='https://medium.com/iconosphere-io/how-to-use-the-contribution-proposal-system-1efe714c9182'
                  target='_blank'
                >
                  “Getting Started” guide{' '}
                </a>
                ,{' '}
                <a
                  href='https://github.com/icon-community/CPS/wiki/Applicant-Flow'
                  target='_blank'
                >
                  Applicant Flow{' '}
                </a>
                ,{' '}
                <a
                  href='https://github.com/icon-community/CPS/wiki/Application-Templates'
                  target='_blank'
                >
                  Application Templates
                </a>{' '}
                and{' '}
                <a
                  href='https://github.com/icon-community/CPS/wiki/Project-Activity-Flow-States'
                  target='_blank'
                >
                  Project Activity Flow States{' '}
                </a>{' '}
                to familiarize yourself with the CPS and the application process
                in detail.
              </p>

              <p>
                Explore the <Link to='/dashboard'>CPS App</Link> and all the
                current proposals/active projects being funded.
              </p>

              <p>
                Using our{' '}
                <a
                  href='https://github.com/icon-project/grants-program/blob/main/templates/yymmdd-project-proposal.md'
                  target='_blank'
                >
                  standardized application form
                </a>
                , provide the details for your desired project and find a
                Validator to sponsor your idea.
              </p>

              <p>
                During the “Voting Period”, Validators will vote on your
                application and either “Approve” or “Deny” your concept. Improve
                your chances in this stage by answering questions and advocating
                for your idea.
              </p>

              <p>
                If your project is accepted during the "Voting Period", you will
                have 15 days (the length of the next application period), to
                submit a{' '}
                <a
                  href='https://github.com/icon-project/grants-program/blob/main/templates/yymmdd-project-progress-report.md'
                  target='_blank'
                >
                  "Progress Report"{' '}
                </a>
                . Your Progress Report is then voted on during the next "Voting
                Period", and if accepted you will receive your first milestone
                of funds.
              </p>

              <p>
                Congratulations! As said in the "Acceptance" stage, you can now
                build your project, and after submitting progress reports that
                are accepted, you will receive funding for your hard work. After
                you complete your project, it's time to submit a new idea and
                continue to grow the ICON ecosystem!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Waypoint>
  );
};

export default GrantProcess;
