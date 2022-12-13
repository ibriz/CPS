import React from 'react';
import communityImg from '../../Assets/Images/StrongCommunity.png';
import cheapImg from '../../Assets/Images/CheapTransactions.png';
import fastImg from '../../Assets/Images/FastTransactions.png';
import Features from '../../Assets/Images/Features-Light.png';
import FeaturesDark from '../../Assets/Images/Features-Dark.png';

const BuildOn = props => {
  const { theme } = props;
  return (
    <div className='landingPage__BuildOn'>
      <div className='buildOnContainer'>
        <h1>Why build on ICON?</h1>
        <p>
          ICON provides a diversified ecosystem for developers to build on top
          of, with the protocol’s main focus being on interoperability
          solutions. With innovative protocols in the DeFi and NFT space, there
          are endless opportunities for teams to provide value to our growing
          ecosystem.
        </p>
        <div className='summary'>
          <img src={theme === 'light' ? Features : FeaturesDark} />
          {/*
                <div >
                    <img src={cheapImg} />
                   
                </div>
                <div className='fastTransactionsParent'>
                <div className='fastTransactions'>
                    <img src={fastImg} />
                   
                    </div>

                <div>
                    </div>
                    <img src={communityImg} />
                   
                </div>
                */}
        </div>

        {/* <div className="videos">
                <div>
                    <iframe src="https://www.youtube.com/embed/1MKosEH1OGY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <p>Why build on ICON?</p>
                </div>
                <div>
                    <iframe src="https://www.youtube.com/embed/1MKosEH1OGY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <p>What is ICON?</p>
                </div>
            </div> */}
      </div>
    </div>
  );
};

export default BuildOn;
