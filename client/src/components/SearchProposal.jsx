import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import MessageContext from "../messageCtx";
import {
  Calendar,
  Funnel,
  FunnelFill,
  PersonFill,
} from "react-bootstrap-icons";
import dayjs from "dayjs";

import API from "../API";
import { motion } from "framer-motion";
import { FilterCard } from "./FilterCard";
import Loading from "./Loading";
import NoFileFound from "./NoFileFound";
import randomColor from "randomcolor";
import ViewProposalMotion from "./ViewProposalMotion";
import FileDropModal from "./FileModal";

function SearchProposalRoute(props) {
  const [thesisProposals, setThesisProposals] = useState([]);
  const { handleToast } = useContext(MessageContext);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1025 });
  const isTabletHorizonthal = useMediaQuery({ minWidth: 1026, maxWidth: 1367 });

  useEffect(() => {
    if (props.user && props.user.user_type !== "STUD") {
      return API.redirectToLogin();
    }
  }, [props.user]);

  useEffect(() => {
    props.setLoading(true);
    API.getThesisProposals(props.virtualClock)
      .then((list) => {
        setThesisProposals(list);
        props.setLoading(false);
      })
      .catch((err) => handleToast(err, "error"));
  }, []);

  return (
    <>
      {props.loading ? (
        <Loading />
      ) : (
        <SearchProposalComponent
          thesisProposals={thesisProposals}
          isMobile={isMobile}
          isTablet={isTablet}
          isTabletHorizonthal={isTabletHorizonthal}
          setLoading={props.setLoading}
          loadind={props.loading}
          virtualClock={props.virtualClock}
          user={props.user}
          setThesisProposals={setThesisProposals}
          isAlreadyApplied={props.isAlreadyApplied}
          setIsAlreadyApplied={props.setIsAlreadyApplied}
        />
      )}
    </>
  );
}

function SearchProposalComponent(props) {
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(false);
  const [titleFilters, setTitleFilters] = useState(false);
  const [filteredThesisProposals, setFilteredThesisProposals] = useState([
    ...props.thesisProposals,
  ]);
  const [filteredByTitle, setFilteredByTitle] = useState([]);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedType, setSelectedType] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCosupervisor, setSelectedCosupervisor] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState([]);
  const [selectedNotesWords, setSelectedNotesWords] = useState([]);
  const [selectedTitlesWords, setSelectedTitlesWords] = useState([]);
  const [selectedDescriptionsWords, setSelectedDescriptionsWords] = useState(
    []
  );
  const [selectedKnowledgeWords, setSelectedKnowledgeWords] = useState([]);

  useEffect(() => {
    setFilteredThesisProposals([...props.thesisProposals]);
  }, [props.thesisProposals]);

  const handleCancel = () => {
    setFilter("");
    setFilteredThesisProposals([...props.thesisProposals]);
  };
  const handleChangeFilter = () => {
    const f = !showFilters;
    setShowFilters(f);
  };

  const handleFilterTitle = (event) => {
    const value = event.target.value;
    setFilter(value);

    let filtered = [];

    filtered = [...props.thesisProposals];

    if (value.trim() !== "") {
      const lowercaseFilter = value.toLowerCase();

      filtered = filtered.filter((thesis) =>
        thesis.title.toLowerCase().includes(lowercaseFilter)
      );
      setFilteredByTitle(filtered);
    } else {
      setFilteredByTitle([]);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center">
        <Container className="width-100 margin-custom">
          <Row className="d-flex align-items-center">
            <Col
              xs={4}
              className="d-flex justify-content-between align-items-center"
            >
              <h1
                className={`margin-titles-custom ${
                  props.isMobile ? "smaller-heading" : ""
                }`}
                style={{ paddingLeft: props.isMobile ? "0.5em" : "0" }}
              >
                Thesis Proposals
              </h1>
            </Col>
            <Col xs={8} className="d-flex justify-content-end">
              <Col
                xs={6}
                className="d-flex justify-content-end align-items-end"
              >
                {!advancedFilters && (
                  <Form.Group className="d-flex align-items-center position-relative">
                    <Form.Control
                      type="text"
                      placeholder={
                        props.isMobile ? "Search.." : "Search by name"
                      }
                      value={filter}
                      onChange={(e) => {
                        handleFilterTitle(e);
                      }}
                      className="custom-input"
                    />
                    {filter && (
                      <button
                        className="clear-btn"
                        onClick={handleCancel}
                        disabled={showFilters}
                      >
                        <span>&times;</span>
                      </button>
                    )}
                  </Form.Group>
                )}
              </Col>

              <Col
                xs={2}
                className="d-flex px-2 justify-content-start align-items-center"
              >
                <Form.Group>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    {!showFilters && !advancedFilters && (
                      <Funnel
                        className={"button-style-filter"}
                        onClick={handleChangeFilter}
                      />
                    )}
                    {showFilters && !advancedFilters && (
                      <FunnelFill
                        className={"button-style-filter"}
                        onClick={handleChangeFilter}
                      />
                    )}
                    {advancedFilters && (
                      <>
                        <FunnelFill
                          className={"button-style-filter"}
                          onClick={handleChangeFilter}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-4px",
                            borderRadius: "50%",
                            width: "10px",
                            height: "10px",
                            backgroundColor: "orange",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <span></span>
                        </div>
                      </>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Col>
          </Row>
          {showFilters && (
            <Container>
              <Row>
                <Col xs={12} style={{ marginBottom: "0.5em" }}>
                  <FilterCard
                    virtualClock={props.virtualClock}
                    thesisList={props.thesisProposals}
                    loading={props.loading}
                    setLoading={props.setLoading}
                    setProposals={setFilteredThesisProposals}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={setSelectedGroups}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedCosupervisor={selectedCosupervisor}
                    setSelectedCosupervisor={setSelectedCosupervisor}
                    selectedKeywords={selectedKeywords}
                    setSelectedKeywords={setSelectedKeywords}
                    selectedSupervisor={selectedSupervisor}
                    setSelectedSupervisor={setSelectedSupervisor}
                    selectedTitlesWords={selectedTitlesWords}
                    setSelectedTitlesWords={setSelectedTitlesWords}
                    selectedDescriptionsWords={selectedDescriptionsWords}
                    setSelectedDescriptionsWords={setSelectedDescriptionsWords}
                    setAdvancedFilters={setAdvancedFilters}
                    setShowFilters={setShowFilters}
                    selectedNotesWords={selectedNotesWords}
                    setSelectedNotesWords={setSelectedNotesWords}
                    selectedKnowledgeWords={selectedKnowledgeWords}
                    setSelectedKnowledgeWords={setSelectedKnowledgeWords}
                  />
                </Col>
              </Row>
            </Container>
          )}
          <Row>
            <Col>
              {filteredThesisProposals.length == 0 ? (
                advancedFilters ? (
                  <NoFileFound
                    message={"No proposal found with these parameters"}
                  />
                ) : (
                  <NoFileFound message={"No proposal found"} />
                )
              ) : (
                <>
                  <Row>
                    <Col>
                      <Row>
                        {filteredByTitle.length <= 0 &&
                          filter === "" &&
                          [...filteredThesisProposals].map((element) => (
                            <Proposal
                              key={element.id}
                              proposal={element}
                              isMobile={props.isMobile}
                              isTablet={props.isTablet}
                              isTabletHorizonthal={props.isTabletHorizonthal}
                              user={props.user}
                              thesisProposals={props.thesisProposals}
                              setThesisProposals={props.setThesisProposals}
                              isAlreadyApplied={props.isAlreadyApplied}
                              setIsAlreadyApplied={props.setIsAlreadyApplied}
                            />
                          ))}
                        {filteredByTitle.length <= 0 && filter !== "" && (
                          <NoFileFound message={"No proposals found"} />
                        )}
                        {filteredByTitle.length > 0 &&
                          [...filteredByTitle].map((element) => (
                            <Proposal
                              key={element.id}
                              proposal={element}
                              isMobile={props.isMobile}
                              isTablet={props.isTablet}
                              isTabletHorizonthal={props.isTabletHorizonthal}
                              user={props.user}
                              thesisProposals={props.thesisProposals}
                              setThesisProposals={props.setThesisProposals}
                              isAlreadyApplied={props.isAlreadyApplied}
                              setIsAlreadyApplied={props.setIsAlreadyApplied}
                            />
                          ))}
                      </Row>
                    </Col>
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

function Proposal(props) {
  const [isClicked, setIsClicked] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [exceed, setExceed] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);

  const { handleToast } = useContext(MessageContext);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setIsClicked(true);
    setCardPosition({ x: rect.left, y: rect.top });
  };

  const handleApplication = () => {
    if (selectedFiles.length) handleUpload(props.proposal.id);
    submitApplication(props.proposal.id, props.virtualClock); //virtualClocK??
  };

  const handleUpload = (thesis_id) => {
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append(`file`, selectedFiles[i]);
    }
    API.sendFiles(formData, thesis_id)
      .then(() => {})
      .catch((err) => {
        handleToast(err, "error");
      });
  };

  const handleUploadInterface = () => {
    setIsClicked(false);
    setOpenPanel(true);
  };

  const closeModal = () => {
    setOpenPanel(false);
    setSelectedFiles([]);
    setExceed(false);
  };

  const closeModalOnCancel = () => {
    setOpenPanel(false);
    setSelectedFiles([]);
    setExceed(false);
    setIsClicked(true);
  };

  const submitApplication = (idThesis, date) => {
    API.applicationThesis(idThesis, date)
      .then(() => {
        handleToast("Application submitted correctly", "success");
        props.setIsAlreadyApplied(true);
        props.setThesisProposals((prev) => {
          return prev.filter((p) => p.id != props.proposal.id);
        });
      })
      .catch((err) => {
        handleToast(err, "error");
      });
  };

  const handleModalClick = (e) => {
    /*  console.log("e.target", e.target);
    console.log("e.currentTarget", e.currentTarget); */

    // If the click occurs outside the expanded card, close it
    if (!e || e.target === e.currentTarget) {
      setIsClicked(false);
    }
  };
  return (
    <Col xs={12} md={12} lg={12} xl={12} xxl={12} className="mt-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <Card
          style={{ padding: 20, minHeight: props.isMobile ? "400px" : "350px" }}
          className="custom-card-proposals"
        >
          <Row>
            <Col style={{ minWidth: "300px" }}>
              <div
                className="title-custom-proposals"
                style={{
                  fontWeight: "medium",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                {props.proposal.title}
              </div>
            </Col>
            <Col className={!props.isMobile ? "text-end mx-2" : "my-2"}>
              <PersonFill size={25} />
              <span>
                {props.proposal.supervisor.split(" ")[1] +
                  " " +
                  props.proposal.supervisor.split(" ")[0]}
              </span>
            </Col>
          </Row>
          <div
            className="hide-scrollbar"
            style={{
              fontWeight: "semi-bold",
              fontSize: 14,
              height: !props.isMobile ? 25 : 40,
              marginTop: 5,
            }}
          >
            {props.proposal.keywords &&
              props.proposal.keywords.map((key, index) => (
                <span
                  key={index}
                  className="badge"
                  style={{
                    backgroundColor: randomColor({
                      seed: key,
                      luminosity: "bright",
                      format: "rgba",
                      alpha: 1,
                    }).replace(/1(?=\))/, "0.1"),
                    color: randomColor({
                      seed: key,
                      luminosity: "bright",
                      format: "rgba",
                      alpha: 1,
                    }),
                    padding: "0.5em 1.2em",
                    borderRadius: "0.25rem",
                    marginRight: 10,
                  }}
                >
                  {key}
                </span>
              ))}
          </div>
          <div
            style={{
              fontSize: 16,
              marginTop: 16,
              minHeight: 50,
            }}
          >
            {props.proposal.description.length > (props.isMobile ? 80 : 400) ? (
              <>
                <Row>
                  <Col>
                    <span>
                      {props.proposal.description.substring(
                        0,
                        props.isMobile ? 80 : 400
                      ) + "..... "}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-end text-muted">
                    <span className="description-read-more">Read more</span>
                  </Col>
                </Row>
              </>
            ) : (
              props.proposal.description
            )}
          </div>
          <Row
            style={{
              fontSize: 16,
              marginTop: "2em",
            }}
          >
            <Col
              className={
                props.isMobile ? "col-5" : props.isTablet ? "col-3" : "col-2"
              }
            >
              <span>Thesis Level</span>
            </Col>
            <Col>
              <span
                style={{
                  color: "black",
                }}
                className="badge"
              >
                {props.proposal.level && props.proposal.level.toUpperCase()}
              </span>
            </Col>
          </Row>
          <Row
            style={{
              fontSize: 16,
              marginTop: 16,
            }}
          >
            <Col
              className={
                props.isMobile ? "col-5" : props.isTablet ? "col-3" : "col-2"
              }
            >
              <span>Thesis Type</span>
            </Col>
            <Col>
              <span
                style={{
                  color: "black",
                }}
                className="badge"
              >
                {props.proposal.type && props.proposal.type.toUpperCase()}
              </span>
            </Col>
          </Row>
          <Row
            style={{
              fontSize: 16,
              marginTop: 16,
            }}
          >
            <Col
              className={
                props.isMobile ? "col-5" : props.isTablet ? "col-3" : "col-2"
              }
            >
              <span>Expire at</span>
            </Col>
            <Col>
              <span className="badge" style={{ color: "black" }}>
                {dayjs(props.proposal.expiration).format("DD/MM/YYYY")}
              </span>
              <Calendar />
            </Col>
          </Row>
        </Card>
      </motion.div>
      {isClicked && (
        <ViewProposalMotion
          proposal={{
            ...props.proposal,
            keywords:
              props.proposal.keywords && props.proposal.keywords.join(","),
            thesis_level: props.proposal.level,
            thesis_type: props.proposal.type,
          }}
          isMobile={props.isMobile}
          setIsClicked={setIsClicked}
          cardPosition={cardPosition}
          isTablet={props.isTablet}
          isTabletHorizonthal={props.isTabletHorizonthal}
          user={props.user}
          handleModalClick={handleModalClick}
          handleUploadInterface={handleUploadInterface}
          isAlreadyApplied={props.isAlreadyApplied}
          setIsAlreadyApplied={props.setIsAlreadyApplied}
        />
      )}
      <FileDropModal
        showModal={openPanel}
        closeModal={closeModal}
        closeModalOnCancel={closeModalOnCancel}
        handleSave={() => {
          handleApplication();
        }}
        setSelectedFiles={setSelectedFiles}
        selectedFiles={selectedFiles}
        exceed={exceed}
        setExceed={setExceed}
      />
    </Col>
  );
}

export default SearchProposalRoute;
