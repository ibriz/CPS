import React from 'react';
import discordImg from '../../Assets/Images/discord.png';
import telegramImg from '../../Assets/Images/telegram.png';
import iconCommunityImg from '../../Assets/Images/iconCommunity.png';
import mediumImg from '../../Assets/Images/medium.png';
import redditImg from '../../Assets/Images/reddit.png';
import facebookImg from '../../Assets/Images/facebook.png';
import twitterImg from '../../Assets/Images/twitter.png';

const DeveloperCommunity = (props) => {

    const { footerRef } = props;

    return (<div className="landingPage__DeveloperCommunity" ref={footerRef}>
        <h1>Join the ICON Developer Community</h1>
        <div>
            <div>
                <a target="_blank" href='https://twitter.com/helloiconworld'
                >
                    <img src={twitterImg} />
                    <p>Twitter</p>
                </a>
            </div>
            <div>
                <a target="_blank" href="https://discord.com/channels/395473147333443587/413810858997841930">
                    <img src={discordImg} />
                    <p>Discord</p>
                </a>
            </div>
            <div>
                <a target="_blank" href='https://t.me/hello_iconworld'>
                    <img src={telegramImg} />
                    <p>Telegram</p>
                </a>
            </div>
            <div>
                <a target="_blank" href='https://medium.com/helloiconworld'>
                    <img src={mediumImg} />
                    <p>Medium</p>
                </a>
            </div>


            <div>
                <a target="_blank" href="https://forum.icon.community/c/contribution-proposals/45">  <img src={iconCommunityImg} />
                    <p>Community Forum</p>
                </a>
            </div>

        </div>
    </div >)
}

export default DeveloperCommunity;