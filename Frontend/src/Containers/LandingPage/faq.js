import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Waypoint } from 'react-waypoint';


const faqList = [
    {
        "key": 1,
        "question": "How do I get started?",
        "answer": "The best way to get started is by logging into the CPS Dashboard using any ICON wallet. From here, explore the layout of the dashboard and click on “Proposals” to explore both active and completed proposals. Once you feel comfortable, submit a draft for your proposal at <a href='https://forum.icon.community/c/contribution-proposals/45' target='_blank'>https://forum.icon.community/c/contribution-proposals/45</a> to receive feedback from the community. When ready, submit your revised proposal on the dashboard and select a sponsor P-Rep. You will need 50 ICX to submit your proposal. This article is also a good resource: <a href='https://medium.com/@ibriz.ai/1efe714c9182' target='_blank'>https://medium.com/@ibriz.ai/1efe714c9182</a> "
    },
    {
        "key": 2,
        "question": "What is a sponsor P-Rep?",
        "answer": "P-Reps are validators on the ICON network, and certain P-Reps participate in the CPS as decision makers. Each proposal needs a Sponsor P-Rep to successfully apply and pass onto the “Voting Period”. Sponsor P-Reps are required to post 10% bond of the proposal amount, and are incentivized if the proposal makes it through to completion. P-Reps can be advisors and give helpful tips on how to create a successful proposal/project. "
    },
    {
        "key": 3,
        "question": "What happens once my proposal is submitted?",
        "answer": "Once your proposal is submitted during the “Application Period”, you will have to wait until the “Voting Period”. During the 15 day voting period, P-Reps will vote “Accept” or “Reject” on your proposal. "
    },
    {
        "key": 4,
        "question": "When do I receive my funds?",
        "answer": "If your initial proposal is accepted, you will have 15 days (length of application period) to submit a “Progress Report”. This progress report will be used to show your progress towards completing the milestones you stated in your initial proposals. If this progress report is accepted by P-Reps, you will receive your first disbursement of funds. This process repeats until the length of your proposal is over."
    },
    {
        "key": 5,
        "question": "What happens if my Progress Report is rejected?",
        "answer": "If a Progress Report does not receive enough Approval Votes, it becomes “Paused”. If a Progress Report is rejected, the Contribution Proposal will also become “Paused”. Paused Contribution Proposals will not receive funding at the end of the Voting Period. During the next Voting Period, registered P-Reps will have the option to resume the Contribution Proposal or disqualify the Contribution Proposal. "
    },
    {
        "key": 6,
        "question": "How can I make up for the fluctuation of ICX price?",
        "answer": "All proposals on the CPS are proposed in our native stablecoin (bnUSD). This means you will receive the exact amount of funding you request due to the non-volatile stablecoin."
    },
    {
        "key": 7,
        "question": "What types of projects does the CPS fund?",
        "answer": "Check out the “Request for Proposal” (RFP) section of the dashboard for specific needs in the ICON community. Other than that, Proposals can be made for anything that stands to benefit either the ICON or ICE blockchains. This could include: Infrastructure, Dapps, Marketing, Hackathons, etc. "
    },
];
const FAQ = (props) => {
    const [activeKey, setActiveKey] = useState(1);
    const { faqRef } = props;
    const handleAccordion = key => {
        if (key === activeKey) {
            setActiveKey(0);
        } else {
            setActiveKey(key);
        }
    };

    return (
        <Waypoint
            onEnter={() => {
                // setActiveTabCenter('faq')
            }}
            onLeave={() => {
                // setActiveTabCenter('')
            }}
        >
            <div className="landingPage__FAQ" id="faq" ref={faqRef}>
                <h1 className="faqHeader scrollSection" >Frequently Asked Questions</h1>
                <div className="faqList">
                    {faqList.map(result => (
                        <div
                            style={{
                                marginTop: 20,
                                cursor: 'pointer',
                                background: activeKey == 0 || activeKey === result.key ? 'rgba(255, 255, 255, 0.9)' : '#F5FCFF',
                                position: 'relative',
                                borderRadius: 8,
                                border: '1px solid #CFE3E8'
                            }}
                            className="faqItem"
                            onClick={() => handleAccordion(result.key)}
                            key={result.key}
                        >
                            <p style={{
                                color: activeKey === result.key ?
                                    'rgba(26, 170, 186, 1)' : 'rgba(88, 102, 101, 1)'
                            }}> {result.question} </p>
                            {activeKey === result.key && <p style={{ color: 'rgba(88, 102, 101, 1)', }} dangerouslySetInnerHTML={{__html: result.answer}}></p>}
                            {activeKey === result.key ? <FaChevronDown style={{
                                position: 'absolute', right: 30, top: 32, color: activeKey === result.key ?
                                    'rgba(26, 170, 186, 1)' : 'rgba(61, 69, 86, 1)'
                            }} /> :
                                <FaChevronRight style={{
                                    position: 'absolute', right: 30, top: 32, color: activeKey === result.key ?
                                        'rgba(26, 170, 186, 1)' : 'rgba(61, 69, 86, 1)'
                                }} />
                            }
                        </div>
                    ))}
                </div>
            </div >
        </Waypoint>)
}

export default FAQ;