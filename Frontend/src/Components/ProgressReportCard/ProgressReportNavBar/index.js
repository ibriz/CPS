import React from "react";
import styles from "./ProposalNavBar.module.scss";
import progressReportStates from "../progressReportStates";
import NavBarTitle from "../../UI/LowerCardNavBar/NavBarTitle";
import NavBarInputGroup from "../../UI/LowerCardNavBar/NavBarInputGroup";
import { Nav } from "react-bootstrap";

const ProgressReportNavBar = ({
  selectedTab,
  setSelectedTab,
  searchText,
  setSearchText,
}) => {
  return (
    <div className={styles.proposalNavBar}>
      {/* {
                progressReportStates.map(
                    (proposalState) =>
                       
                        <NavBarTitle
                        onClick = {() => setSelectedTab(proposalState)}
                        activeCondition = {selectedTab === proposalState}>
                            {proposalState}  
                        </NavBarTitle>
                )

            }

            

                        <NavBarInputGroup /> */}
      <Nav
        activeKey="/home"
        onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          width: "100%",
        }}
      >
        {progressReportStates.map((proposalState) => (
          <Nav.Item>
            <NavBarTitle
              onClick={() => setSelectedTab(proposalState)}
              activeCondition={selectedTab === proposalState}
            >
              {proposalState}
            </NavBarTitle>
          </Nav.Item>
        ))}
        <NavBarInputGroup
          placeholder="Search Progress Report"
          value={searchText}
          setValue={setSearchText}
        />
      </Nav>
    </div>
  );
};

export default ProgressReportNavBar;
