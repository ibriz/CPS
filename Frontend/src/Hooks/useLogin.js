import React, { useState, useEffect } from 'react';
import {
    customRequestHasAccount,
    customRequestAddress,
} from '../Redux/ICON/CustomEvents';
import { loginRequest, loginPrepRequest } from 'Redux/Reducers/accountSlice';
import { NotificationManager } from 'react-notifications';
import { setLoginButtonClicked } from 'Redux/Reducers/accountSlice';
import { Modal } from 'react-bootstrap';

export const useLogin = () => {
    const [walletModal, setWalletModal] = useState(false);
    const handleLogin = () => {
        const isChromium = window.chrome;
        const winNav = window.navigator;
        const vendorName = winNav.vendor;
        const isOpera = typeof window.opr !== 'undefined';
        const isIEedge = winNav.userAgent.indexOf('Edge') > -1;
        const isIOSChrome = winNav.userAgent.match('CriOS');
        if (isIOSChrome) {
            // is Google Chrome on IOS
        } else if (
            isChromium !== null &&
            typeof isChromium !== 'undefined' &&
            vendorName === 'Google Inc.' &&
            isOpera === false &&
            isIEedge === false
        ) {
            // is Google Chrome
            window.dispatchEvent(customRequestHasAccount);
            window.dispatchEvent(customRequestAddress);
            setLoginButtonClicked({
                click: true,
            });
            loginRequest();
            setTimeout(() => {
                if (!window.icon) {
                    setWalletModal(true);
                }
                else {
                    setWalletModal(false);
                }
            }, 1000)
        } else {
            NotificationManager.warning(
                'Please Use Google Chrome or any other Chromium Browser',
            );
        }
    }
    return { walletModal, handleLogin, setWalletModal };
}