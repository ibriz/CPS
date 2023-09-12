import React from 'react';
import styles from './ProposalNavBar.module.scss';
import NavBarTitle from '../../UI/LowerCardNavBar/NavBarTitle';
import NavBarInputGroup from '../../UI/LowerCardNavBar/NavBarInputGroup';
import { Nav } from 'react-bootstrap';

const TabBar = ({
  selectedTab,
  setSelectedTab,
  searchText,
  setSearchText,
  tabs,
  placeholder,
  maxWidth,
  newIndexList = [],
  hideSearch = false,
}) => {
  return (
    <div
      className={styles.proposalNavBar}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {/* {
                proposalStates.map(
                    (proposalState) =>
                       
                        <NavBarTitle
                        onClick = {() => setSelectedTab(proposalState)}
                        activeCondition = {selectedTab === proposalState}>
                            {proposalState}  
                        </NavBarTitle>
                )

            } */}
      <Nav
        activeKey='/home'
        onSelect={selectedKey => alert(`selected ${selectedKey}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          width: '100%',
        }}
      >
        {tabs.map((tab, index) => (
          <Nav.Item key={index} className={styles.navItem}>
            <NavBarTitle
              onClick={() => setSelectedTab(tab)}
              activeCondition={selectedTab === tab}
            >
              {tab}{' '}
              {newIndexList.includes(index) && (
                <sup style={{ color: 'red', fontWeight: 'normal' }}>New</sup>
              )}
            </NavBarTitle>
          </Nav.Item>
        ))}
      </Nav>
      <div>
        {!hideSearch && (
          <NavBarInputGroup
            placeholder={placeholder}
            value={searchText}
            setValue={setSearchText}
            maxWidth={maxWidth}
          />
        )}
      </div>
    </div>
  );
};

export default TabBar;
