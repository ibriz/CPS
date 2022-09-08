import './darkMode.css';

import React, { useState, useEffect } from 'react';
import { ChangeEventHandler } from 'react';

const DarkMode = () => {
  const setDark = () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  };
  const setLight = () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  };

  const storedTheme = localStorage.getItem('theme');
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const defaultDark =
    storedTheme === 'dark' || (storedTheme === null && prefersDark);

  if (defaultDark) {
    setDark();
  }
  function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
  }

  const toggleTheme = e => {
    if (e.target.checked) {
      setDark();
    } else {
      setLight();
    }
    forceUpdate();
  };
  const forceUpdate = useForceUpdate();
  return (
    // <div className='toggle-theme-wrapper'>
    //   <label className='toggle-theme' htmlFor='checkbox'>
    //     <input
    //       type='checkbox'
    //       id='checkbox'
    //       onChange={toggleTheme}
    //       defaultChecked={defaultDark}
    //     />
    //     {/* <div className='slider round'></div> */}
    //   </label>
    //   {/* <div className='test'>Testing</div> */}
    // </div>

    <div className='themeContainer'>
      <input
        type='checkbox'
        id='checkbox'
        onChange={toggleTheme}
        defaultChecked={defaultDark}
      />
      <div className='themeText'>Dark mode</div>
    </div>
  );
};

export default DarkMode;
