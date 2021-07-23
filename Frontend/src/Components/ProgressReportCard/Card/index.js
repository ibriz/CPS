import React, { useState, useEffect } from "react";
import { Row, Card, Col } from "react-bootstrap";
import styles from "./ProposalCard.module.scss";
import TabBar from "Components/Card/TabBar";
import ProgressReportList from "Components/Card/ProgressReportList";
import progressReportStates from "../progressReportStates";
import wallet from "Redux/ICON/FrontEndWallet";
import Pagination from "Components/Card/Pagination";
import { withRouter } from "react-router-dom";
import DetailsModal from "Components/Card/DetailsModalProgressReport";

const ProgressReportCard = ({
  progressReportList,
  fetchProgressReport,
  walletAddress,
  totalPages,
  history,
  fetchDraftsRequest,
  fetchProposalByAddressRequest,
  proposalByAddress,
}) => {
  const [selectedTab, setSelectedTab] = useState("Voting");
  const [filteredProgressReportList, setFilteredProgressReportList] = useState(
    progressReportList
  );
  let [searchText, setSearchText] = useState("");
  const [pageNumber, setPageNumber] = useState();
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedProgressReport, setSelectedProgressReport] = React.useState();

  const onClickProgressReport = (porgressReport) => {
    setModalShow(true);
    setSelectedProgressReport(porgressReport);
  };

  const onClickProgressReportDraft = (progressReport) => {
    setSelectedProgressReport(
      progressReportList[selectedTab][progressReport.index]
    );
    history.push({
      pathname: "/newProgressReport",
      draftProgressReport:
        progressReportList[selectedTab][progressReport.index],
      isDraft: true,
    });
  };

  useEffect(() => {
    if (selectedTab !== "Draft") {
      fetchProgressReport({
        status: selectedTab,
        walletAddress: walletAddress || wallet.getAddress(),
        pageNumber: pageNumber?.[selectedTab] ?? 1,
      });
    } else {
      fetchDraftsRequest({
        walletAddress,
      });
    }
  }, [selectedTab, pageNumber]);

  const setCurrentPages = (status, pageNumber) => {
    setPageNumber((prevState) => ({
      ...prevState,
      [status]: pageNumber,
    }));
  };

  useEffect(() => {
    progressReportStates.map((state) => {
      setCurrentPages(state, 1);
    });

    fetchProposalByAddressRequest({
      walletAddress,
    });
  }, []);

  useEffect(() => {
    let filteredProgressReports;
    if (selectedTab !== "Draft") {
      filteredProgressReports = (
        progressReportList[selectedTab][pageNumber?.[selectedTab] - 1 || 0] ||
        []
      ).filter((proposal) => proposal.progressReportTitle.includes(searchText));
    } else {
      filteredProgressReports = progressReportList[selectedTab].map(
        (progressReport, index) => ({
          ...progressReport,
        })
      );
    }

    setFilteredProgressReportList(filteredProgressReports);
  }, [selectedTab, progressReportList, searchText]);

  return (
    <Row className={styles.proposalCard}>
      <Col>
        <Card>
          <Card.Body className={styles.cardBody}>
            <TabBar
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              searchText={searchText}
              setSearchText={setSearchText}
              tabs={progressReportStates}
              placeholder="Search Progress Report"
            />

            <hr style={{ marginTop: "-9px" }} />

            <ProgressReportList
              projectReports={filteredProgressReportList}
              selectedTab={selectedTab}
              onClickProgressReport={
                selectedTab === "Draft"
                  ? onClickProgressReportDraft
                  : onClickProgressReport
              }
            />

            <Pagination
              currentPage={pageNumber?.[selectedTab]}
              setCurrentPage={(pageNumber) =>
                setCurrentPages(selectedTab, pageNumber)
              }
              totalPages={totalPages?.[selectedTab]}
            />

            <DetailsModal
              show={modalShow}
              onHide={() => setModalShow(false)}
              progressReport={selectedProgressReport}
              status={selectedTab}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default withRouter(ProgressReportCard);
