import React from 'react';
import styles from './ProposalNavBar.module.scss';
import NavBarTitle from '../../UI/LowerCardNavBar/NavBarTitle';
import NavBarInputGroup from '../../UI/LowerCardNavBar/NavBarInputGroup';
import { Nav } from 'react-bootstrap';


const TabBar = ({ selectedTab, setSelectedTab, searchText, setSearchText, tabs, placeholder }) => {

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
                activeKey="/home"
                onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
                style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', width: '100%' }}
            >
                {
                    tabs.map((tab) =>
                        <Nav.Item>
                            <NavBarTitle
                        onClick = {() => setSelectedTab(tab)}
                        activeCondition = {selectedTab === tab}>
                            {tab}  
                        </NavBarTitle>
                        </Nav.Item>
                    )
                }
                <NavBarInputGroup 
                    placeholder = {placeholder}
                    value = {searchText}
                    setValue = {setSearchText}/>

            </Nav>



        </div>



    )
}

export default TabBar;