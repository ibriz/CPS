import './darkMode.css';

import React, { useState, useEffect } from 'react';
import { ChangeEventHandler } from 'react';
import { setThemeRequest } from 'Redux/Reducers/userSlice';
import { connect } from 'react-redux';

const DarkMode = ({ theme, setTheme }) => {
  const setDark = () => {
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  };
  const setLight = () => {
    setTheme('light');
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
    <></>
    // <div className='themeContainer'>
    //   <input
    //     type='checkbox'
    //     id='checkbox'
    //     onChange={toggleTheme}
    //     defaultChecked={defaultDark}
    //   />
    //   <div className='themeText'>Dark mode</div>
    // </div>
  );
};

const mapStateToProps = state => ({
  theme: state.user.theme,
});

const mapDispatchToProps = dispatch => ({
  setTheme: payload => dispatch(setThemeRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DarkMode);
