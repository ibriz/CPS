import React, { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import iconWebStudioImg from '../../Assets/Images/iconWebStudioReceipent.png';
import craftImg from '../../Assets/Images/craftReceipent.png';
import gangstabetImg from '../../Assets/Images/ganstabetReceipent.png';
import { FaArrowRight } from 'react-icons/fa';


const grantReceipentList = [{
    "key": 1,
    "image": iconWebStudioImg,
    "title": "ICON Web Studio",
    "description": "Web IDE for writing Python score on ICON blockchain",
    "link": "https://iconweb.studio/"
},
{
    "key": 2,
    "image": craftImg,
    "title": "Craft Network",
    "description": "Craft is an NFT marketplace owned by the community. Each week, users will earn $CFT tokens based on their",
    "link": "https://craft.network/"

},
{
    "key": 3,
    "image": gangstabetImg,
    "title": "GangstaBet",
    "description": "GangstaBet is a digital collectible where people can evolve their characters for an eventual permanence on the",
    "link": "https://gangstabet.io/"
},
    // {
    //     "key": 4,
    //     "image": iconWebStudioImg,
    //     "title": "ICON Web Studio",
    //     "description": "Web IDE for writing Python score on ICON blockchain",
    //     "link": "https://iconweb.studio/"
    // },
]
const GrantReceipent = (props) => {
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

    const getSlideToShow = () => {
        if (width > 769) {
            return 3;
        }
        else if (width > 567) {
            return 2;
        }
        else {
            return 1;
        }
    }

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
        }
    };


    return (<div className="landingPage__GrantReceipent">
        <h1>CPS Grant Receipents</h1>
        <Slider  {...settings} style={{ backgroundColor: 'rgba(243, 251, 255, 1)', maxWidth: 900, padding: '0px 10px' }}>
            {grantReceipentList.map((result) => {
                return <div className="receipentCard" onClick={() => handleAccordion(result.key)} key={result.key}>
                    <img src={result.image} />
                    <h5 style={{ color: activeKey == result.key ? '#1AAABA' : 'black' }}>{result.title}</h5>
                    <p>{result.description}</p>
                    {activeKey == result.key && <a href={result.link} target="_blank" style={{ color: '#1AAABA', fontSize: 14, fontWeight: 'bold', position: 'absolute', textDecoration: 'none', bottom: 30 }}> Learn more <FaArrowRight /></a>}
                </div>
            })}
        </Slider >
        <p className="counter" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}><label style={{ color: activeKey == 0 ? 'black' : '#1AAABA', fontWeight: 'bold' }}>
            {/* {slideIndex} */}
            {activeKey == 0 ? 1 : activeKey}
        </label> /  {grantReceipentList.length}</p>
    </div>)
}

export default GrantReceipent;