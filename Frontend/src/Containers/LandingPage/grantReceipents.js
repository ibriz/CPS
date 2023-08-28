import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import iconWebStudioImg from '../../Assets/Images/iconWebStudioReceipent.png';
import craftImg from '../../Assets/Images/craftReceipent.png';
import gangstabetImg from '../../Assets/Images/ganstabetReceipent.png';
import vibravidLogo from '../../Assets/Images/vibravidLogo.png';
import icxComicsLogo from '../../Assets/Images/icxComicsLogo.jpg';
import winibleLogo from '../../Assets/Images/winibleLogo.png';
import icxRelayLogo from '../../Assets/Images/icxRelayLogo.png';
import metricxLogo from '../../Assets/Images/metricxLogo.png';
import tsfLogo from '../../Assets/Images/tsfLogo.PNG';
import iconWebStudioLogo from '../../Assets/Images/iconWebStudioLogo.png';
import iconReviewLogo from '../../Assets/Images/iconReviewLogo.PNG';
import cpsBotLogo from '../../Assets/Images/cpsBot.jpg';
import icon18nLogo from '../../Assets/Images/icon18nLogo.png';
import codaLogo from '../../Assets/Images/codaLogo.png';
import { useSelector } from 'react-redux';

import { FaArrowRight } from 'react-icons/fa';

const grantReceipentList = [
  {
    image: iconWebStudioLogo,
    title: 'ICON Web Studio',
    description: 'Web IDE for writing Python score on ICON blockchain',
    link: 'https://iconweb.studio/',
    className: 'iconStudio',
  },
  {
    image: icxComicsLogo,
    title: 'ICX Comics',
    description: 'A visual guide for ICON Blockchain',
    link: 'https://craft.network/',
  },
  {
    image: gangstabetImg,
    title: 'GangstaBet',
    description: 'A Digital Collectible NFT Project',
    link: 'https://gangstabet.io/',
  },
  {
    image: vibravidLogo,
    title: 'Vibravid Inc',
    description: 'A decentralized Audio/Video platform with NFT Marketplace',
    link: 'https://vibravid.io/home',
  },
  {
    image: iconWebStudioImg,
    title: 'icon-cli',
    description: 'Command line tool for ICON',
    link: null,
    className: 'iconCli',
  },
  {
    image: icon18nLogo,
    title: 'ICON i18n',
    description:
      'Aims to expand the reach of the ICON Ecosystem into Spanish, Hindi and Korean speaking communities.',
    link: 'https://craft.network/',
    disabled: true,
  },
  {
    image: winibleLogo,
    title: 'Winible',
    description: 'Tokenized Wine on ICON',
    link: 'https://www.winible.io/',
    className: 'winible',
  },
  {
    image: icxRelayLogo,
    title: 'ICXRelay.app',
    description:
      'ICX relay is a tool that will allow the transfer of ICX and IRC2 tokens to email and mobile phone recipients, allowing users who may not be familiar with cryptocurrency to be anonymously sent ICX or IRC2 tokens only they can claim',
    link: 'https://icxrelay.app/',
    className: 'winible',
  },
  {
    image: tsfLogo,
    title: 'Token Score Factory',
    description:
      'Web platform where anyone can easily create and deploy an IRC-2 or an IRC-3 SCORE directly from their browser.',
    link: 'https://tsf.opendevicon.io/',
    className: 'tsf',
  },
  {
    image: metricxLogo,
    title: 'MetrICX',
    description: 'MetrICX is one of the most-used apps in the ICON ecosystem',
    link: 'https://metricx.com/',
    disabled: true,
  },
  {
    image: gangstabetImg,
    title: 'SPARTANBOT',
    description: 'Informative Twitter bot',
    link: 'https://gangstabet.io/',
    disabled: true,
  },
  {
    image: codaLogo,
    title: 'CODA',
    description:
      'A web platform that allows musicians to tokenize musical works, sell musical works, collaborate with other creators, and seek funding for their ideas.',
    link: 'https://iconweb.studio/',
    disabled: true,
  },
  {
    image: iconReviewLogo,
    title: 'ICON Reviews',
    description:
      'Application trying to solve voter apathy and vote stagnation on ICON',
    link: 'https://icon-reviews-website.herokuapp.com/',
    className: 'iconReview',
  },
  {
    image: cpsBotLogo,
    title: 'ICON CPS Bot',
    description:
      'Follow to get all the updates on ICON CPS (http://cps.icon.community).',
    link: 'https://twitter.com/iconcpsbot',
  },
  {
    image: iconWebStudioImg,
    title: 'ICON Pinas',
    description:
      'Follow to get all the updates on ICON CPS (http://cps.icon.community).',
    link: 'https://twitter.com/iconcpsbot',
    disabled: true,
  },
  {
    image: iconWebStudioImg,
    title: 'Worldwide ICON dApps Accelerator',
    description:
      'Follow to get all the updates on ICON CPS (http://cps.icon.community).',
    link: 'https://twitter.com/iconcpsbot',
    disabled: true,
  },
];
const GrantReceipent = props => {
  const { width } = props;
  const [activeKey, setActiveKey] = useState(0);
  const [slideIndex, setSlideIndex] = useState(1);
  const handleAccordion = key => {
    if (key === activeKey) {
      setActiveKey(0);
    } else {
      setActiveKey(key);
    }
  };
  const isDarkTheme = localStorage.getItem('theme') === 'dark';
//   const isDark = useSelector(state => state.theme.isDark);

  const getSlideToShow = () => {
    if (width > 769) {
      return 5;
    } else if (width > 567) {
      return 3;
    } else {
      return 1;
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: getSlideToShow(),
    slidesToScroll: 1,
    arrows: true,
    lazyLoad: 'ondemand',
    beforeChange: (current, next) => {
      setSlideIndex(next + 1);
      // setActiveKey(0);
    },
  };

  return (
    <div className='landingPage__GrantReceipent'>
      <h1>CPS Grant Recipients</h1>
      <Slider
        {...settings}
        style={{
          backgroundColor: isDarkTheme ? '#242425' : 'rgba(243, 251, 255, 1)',
          padding: '0px 10px 50px 10px',
        }}
      >
        {grantReceipentList
          .filter(result => result.disabled == undefined)
          .map((result, index) => {
            return (
              <div className='receipentCard' key={index}>
                <img src={result.image} className={result.className} />
                <h5>{result.title}</h5>
                <p>{result.description}</p>
                <a
                  href={result.link}
                  target={result.link ? '_blank' : ''}
                  style={{
                    color: '#27AAB9',
                    fontSize: 14,
                    fontWeight: 'bold',
                    position: 'absolute',
                    textDecoration: 'none',
                    bottom: 30,
                  }}
                >
                  {' '}
                  Learn more <FaArrowRight />
                </a>
              </div>
            );
          })}
      </Slider>
    </div>
  );
};

export default GrantReceipent;
