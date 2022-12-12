import React from 'react';
import { Row, Col, Container, Button } from 'react-bootstrap';
import styles from './Footer.module.scss';
import ClassNames from 'classnames';
import {
  AiFillMediumCircle,
  AiFillTwitterCircle,
  AiFillGithub,
  AiFillFacebook,
  AiFillRedditCircle,
} from 'react-icons/ai';
import { FaDiscord } from 'react-icons/fa';
import { SiFacebook } from 'react-icons/si';
import iconCPSImg from '../../Assets/Images/iconCPSlogo-light.svg';
import iconCPSImgBlack from '../../Assets/Images/iconCPSlogo.svg';

import '../../Theme/variables.css';

const socialLinks = [
  {
    name: 'medium',
    link: 'https://medium.com/helloiconworld',
    icon: AiFillMediumCircle,
  },
  {
    name: 'twitter',
    link: 'https://twitter.com/helloiconworld',
    icon: AiFillTwitterCircle,
  },
  {
    name: 'discord',
    link: 'https://discord.gg/4vpFeYams4',
    icon: FaDiscord,
    fontSize: '30px',
  },
  {
    name: 'github',
    link: 'https://github.com/icon-community/CPS',
    icon: AiFillGithub,
  },

  {
    name: 'facebook',
    link: 'https://www.facebook.com/helloicon/',
    icon: SiFacebook,
    fontSize: '30px',
  },

  {
    name: 'reddit',
    link: 'https://www.reddit.com/r/helloicon/',
    icon: AiFillRedditCircle,
    // fontSize: '30px'
  },
];

const resourcesLinks = [
  {
    title: 'Getting Started',
    link: 'https://medium.com/@ibriz.ai/1efe714c9182',
  },

  {
    title: 'ICON Forum',
    link: 'https://forum.icon.community/c/contribution-proposals/45',
  },

  {
    title: 'CPS Yellow Paper',
    link: 'https://docs.google.com/document/d/1yPwgsXx4ow5NVnG1ktMKYp5JvjQvWEfuSkq6Iy-OIXA/',
  },
  { title: 'Github', link: 'https://github.com/icon-community/CPS' },
];

const ecosystemLinks = [
  {
    title: 'Hana Wallet',
    link: 'https://hanawallet.io/',
  },

  {
    title: 'Tracker',
    link: 'https://tracker.icon.foundation/',
  },

  {
    title: 'ICON Foundation',
    link: 'https://www.icon.foundation/',
  },
  { title: 'ICON Community', link: 'https://icon.community/' },
];

const communityLinks = [
  {
    title: 'Twitter',
    link: 'https://twitter.com/helloiconworld',
  },

  {
    title: 'Discord',
    link: 'https://discord.gg/4vpFeYams4',
  },

  {
    title: 'Telegram',
    link: 'https://t.me/hello_iconworld',
  },
  { title: 'Medium', link: 'https://medium.com/helloiconworld' },
];

const Footer = ({ console = false, width = undefined, footerRef }) => {
  const linksStyle = console ? styles.linksConsole : styles.link;
  const firstRowStyle = console ? styles.firstRowConsole : styles.firstRow;
  const footerColumnStyles = console
    ? styles.footerColumnConsole
    : styles.footerColumn;

  const consoleColor = 'var(--console-color)';
  const storedTheme = localStorage.getItem('theme');
  const cpsLogo = console
    ? storedTheme === 'light'
      ? iconCPSImgBlack
      : iconCPSImg
    : iconCPSImg;

  return (
    <Container
      fluid
      // className={ClassNames({ 'bg-info': !console, footer: true })}
      style={{
        color: console ? consoleColor : '#FFFFFF',
        marginTop: console ? '40px' : '0px',
        backgroundColor: console ? 'var(--console-bg-color)' : 'black',
      }}
      id='footer'
      ref={footerRef}
    >
      <Row className={ClassNames(firstRowStyle)}>
        {/* <Col md="1"> </Col> */}

        <Col
          lg={'3'}
          className={ClassNames(footerColumnStyles, linksStyle)}
          style={{
            paddingRight: 0,
            textAlign: width && width <= 767 ? 'left' : 'left',
          }}
        >
          <p style={{ fontWeight: '700' }}>Ecosystem</p>
          {resourcesLinks.map(link => (
            <div style={{ marginTop: '10px' }}>
              <a
                href={link.link}
                target='_blank'
                style={{
                  color: console ? consoleColor : 'white',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                <div>{link.title}</div>
              </a>
            </div>
          ))}
        </Col>

        <Col
          lg={'3'}
          className={ClassNames(footerColumnStyles, linksStyle)}
          style={{
            paddingRight: 0,
            textAlign: width && width <= 767 ? 'left' : 'left',
          }}
        >
          <p style={{ fontWeight: '700' }}>Community</p>
          {ecosystemLinks.map(link => (
            <div style={{ marginTop: '10px' }}>
              <a
                href={link.link}
                target='_blank'
                style={{
                  color: console ? consoleColor : 'white',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                <div>{link.title}</div>
              </a>
            </div>
          ))}
        </Col>
        <Col
          lg={'3'}
          className={ClassNames(footerColumnStyles, linksStyle)}
          style={{
            paddingRight: 0,
            textAlign: width && width <= 767 ? 'left' : 'left',
          }}
        >
          <p style={{ fontWeight: '700' }}>Resources</p>
          {communityLinks.map(link => (
            <div style={{ marginTop: '10px' }}>
              <a
                href={link.link}
                target='_blank'
                style={{
                  color: console ? consoleColor : 'white',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                <div>{link.title}</div>
              </a>
            </div>
          ))}
        </Col>

        <Col
          lg='3'
          xs='12'
          className={ClassNames(footerColumnStyles)}
          style={{ textAlign: 'right', paddingRight: '52px' }}
        >
          <img src={cpsLogo} style={{ width: '45%' }} />
          <div
            style={{ marginTop: '20px', fontSize: '14px', fontWeight: '600' }}
          >
            Built by:{' '}
            <a
              href='https://iconosphere.io/'
              style={console ? { color: consoleColor } : { color: 'white' }}
              target='_blank'
            >
              ICONOsphere P-Rep
            </a>
          </div>
          <div
            style={{ marginTop: '5px', fontSize: '14px', fontWeight: '600' }}
          >
            <a
              href='https://tracker.icon.foundation/address/hx231a795d1c719b9edf35c46b9daa4e0b5a1e83aa'
              style={console ? { color: consoleColor } : { color: 'white' }}
              target='_blank'
            >
              Support us with your votes
              {/* <Button
                variant={
                  console
                    ? storedTheme === 'dark'
                      ? 'outline-light'
                      : 'outline-dark'
                    : 'outline-light'
                }
                style={{
                  marginLeft: '0px',
                  paddingTop: '3px',
                  paddingBottom: '3px',
                }}
              >
                {' '}
                Support us with your votes
              </Button>{' '} */}
            </a>
          </div>
          {/* <div style={{ marginTop: '5px' }}>
            <a
              href='mailto:hello@icon.foundation'
              target='_blank'
              style={{ color: console ? consoleColor : 'white' }}
            >
              <Button
                variant={
                  console
                    ? storedTheme === 'dark'
                      ? 'outline-light'
                      : 'outline-dark'
                    : 'outline-light'
                }
                style={{
                  marginLeft: '0px',
                  paddingTop: '3px',
                  paddingBottom: '3px',
                }}
              >
                {' '}
                Contact
              </Button>{' '}
            </a>
          </div> */}

          <div
            style={{
              marginTop: '42px',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: '-20px',
            }}
          >
            Copyright © {new Date().getFullYear()}.{' '}
            <u>
              <a
                href='https://icon.foundation/'
                target='_blank'
                style={console ? { color: consoleColor } : { color: 'white' }}
              >
                ICON Foundation
              </a>
            </u>
          </div>
        </Col>

        <Col lg='1'> </Col>

        {/* {console && (
          <Col
            lg='3'
            xs='12'
            className={ClassNames(footerColumnStyles, styles.socialColumn)}
            style={{ paddingLeft: '45px !important' }}
          >
            <div style={{ marginTop: '15px' }}>Find us on:</div>
            <div
              style={{
                display: 'flex',
                marginTop: '15px',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {socialLinks.map(socialLink => (
                <a
                  href={socialLink.link}
                  key={socialLink.name}
                  target='_blank'
                  style={{ zIndex: 1000 }}
                >
                  <socialLink.icon
                    style={{
                      fontSize: socialLink.fontSize
                        ? socialLink.fontSize
                        : '35px',
                      color: console ? consoleColor : 'white',
                    }}
                  />
                </a>
              ))}
            </div>
          </Col>
        )}
        {!console && <Col lg='1'> </Col>} */}
      </Row>

      <Row style={{ marginBottom: '10px' }}>
        <Col lg='12' className={footerColumnStyles}></Col>
      </Row>
    </Container>
  );
};

export default Footer;
