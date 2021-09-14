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
}) => {
  return (
    <div className={styles.proposalNavBar}>
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
          display: 'inline-flex',
          flexWrap: 'wrap',
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
              {tab}
            </NavBarTitle>
          </Nav.Item>
        ))}

        <div style={{ flexGrow: 1 }}></div>
        <NavBarInputGroup
          placeholder={placeholder}
          value={searchText}
          setValue={setSearchText}
          maxWidth={maxWidth}
        />
      </Nav>
    </div>
  );
};

export default TabBar;
