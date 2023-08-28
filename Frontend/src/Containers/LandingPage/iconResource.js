import React from 'react';
import iconDevPortalImg from '../../Assets/Images/iconDevPortal.png';
import iconDevIconImg from '../../Assets/Images/iconDevIcon.png';
import tokenScoreFactoryImg from '../../Assets/Images/tokenScoreFactory.png';
import iconWebStudioImg from '../../Assets/Images/iconWebStudio.png';

const IconResource = props => {
  const { footerRef } = props;

  return (
    <div className='landingPage__IconResource' ref={footerRef}>
      <h1>ICON Resources</h1>
      <div>
        <a target='_blank' href='https://www.icondev.io/'>
          <img src={iconDevPortalImg} />
        </a>

        {/* <a target="_blank" href="https://docs.opendevicon.io/">
                <img src={iconDevIconImg} />
            </a>
            <a target="_blank" href="https://tsf.opendevicon.io/">
                <img src={tokenScoreFactoryImg} />
            </a> */}
        <a target='_blank' href='https://icon-web-studio.pages.dev/'>
          <img src={iconWebStudioImg} />
        </a>
      </div>
    </div>
  );
};

export default IconResource;
