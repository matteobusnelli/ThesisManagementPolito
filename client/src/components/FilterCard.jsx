import React, { useContext, useEffect, useState, useRef } from "react";
import API from "../API";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import MessageContext from "../messageCtx";
import { ToastContainer } from "react-toastify";
import {
  ArrowReturnLeft,
} from "react-bootstrap-icons";
import Loading from "./Loading";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import SearchDropdown from "./SearchDropdown";
import { Chips2 } from "./ChipsInput";

const FilterCard = ({
  virtualClock,
  thesisList,
  loading,
  setLoading,
  setProposals,
  selectedGroups,
  setSelectedGroups,
  selectedType,
  setSelectedType,
  selectedDate,
  setSelectedDate,
  selectedCosupervisor,
  setSelectedCosupervisor,
  selectedKeywords,
  setSelectedKeywords,
  selectedSupervisor,
  setSelectedSupervisor,
  selectedTitlesWords,
  setSelectedTitlesWords,
  selectedDescriptionsWords,
  setSelectedDescriptionsWords,
  setAdvancedFilters,
  selectedKnowledgeWords,
  setSelectedKnowledgeWords,
  setSelectedNotesWords,
  selectedNotesWords,
  setShowFilters,
}) => {
  const { handleToast } = useContext(MessageContext);
  const [reset, setReset] = useState(true);
  const [titles, setTitles] = useState([]);
  const [titleFilter, setTitleFilters] = useState("");
  const [descriptions, setDescriptions] = useState([])
  const [descriptionFilter, setDescriptionFilter] = useState("");

  const [notes, setNotes] = useState([])
  const [notesFilter, setNotesFilters] = useState("");

  const [knowledge, setKnowledge] = useState([])
  const [knowledgeFilter, setKnowledgeFilter] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [cosupervisors, setCosupervisors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [type, setType] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const scrollbarRef = useRef(null);

  useEffect(() => {
    const setFilters = async () => {
      let keywords_theses = [];
      let group_theses = [];
      let type_theses = [];
      let supervisors_theses = [];
      let cosupervisors = [];

      try {
        if (thesisList) {
          thesisList.forEach((item) => {
            if (item.type) {
              const typeExist = type_theses.some((t) => t === item.type);
              if (!typeExist) type_theses.push(item.type);
            }

            if (item.keywords.length > 0) {
              item.keywords.forEach((i) => {
                if (i != "" && i != " ") keywords_theses.push(i);
              });
            }
            if (item.supervisor) {
              const name = item.supervisor;

              const supervisorExists = supervisors_theses.some(
                (sup) => sup === name
              );

              if (!supervisorExists) {
                supervisors_theses.push(name);
              }
            }

            if (item?.cosupervisors?.length > 0) {

              item?.cosupervisors.forEach((element) => {
                if (!cosupervisors.includes(element)) {
                  cosupervisors.push(element)
                }
              });
            }
            if (item.groups?.length > 0) {
              item.groups.forEach((i) => {
                let exist = group_theses.some((g) => g === i.group);
                if (!exist) group_theses.push(i.group);
              });
            }
          });

          setCosupervisors(cosupervisors);
          setType(type_theses);
          setKeywords(keywords_theses);
          setSupervisors(supervisors_theses);
          setGroups(group_theses);
        }
      } catch (error) {
        console.log(error);
        handleToast(error.error, "error");
      }
    };
    if (reset) {
      setLoading(true);
      setFilters();
      setReset(false);
    }
    setLoading(false);
  }, [reset, thesisList]);

  const handleReset = () => {
    setSelectedCosupervisor([]);
    setSelectedSupervisor([]);
    setSelectedGroups([]);
    setSelectedKeywords([]);
    setSelectedNotesWords([]);
    setSelectedKnowledgeWords([])
    setSelectedType([]);
    setSelectedDate(dayjs(virtualClock));
    setSelectedTitlesWords([]);
    setSelectedDescriptionsWords([])
    setReset(true);
    setProposals(thesisList);
    setAdvancedFilters(false);
  };

  const handleFilter = () => {
    let filtered = [...thesisList];

    if (selectedTitlesWords?.length > 0) {
      filtered = filtered.filter((thesis) => {
        const titleLowerCase = thesis.title.toLowerCase();
        return selectedTitlesWords.some((word) =>
          titleLowerCase.includes(word.toLowerCase())
        );
      });
    }

    if (selectedKnowledgeWords?.length > 0) {
      filtered = filtered.filter((thesis) => {
        const knowledgeLowerCase = thesis.required_knowledge?.toLowerCase();
        return selectedKnowledgeWords.some((word) =>
          knowledgeLowerCase.includes(word.toLowerCase())
        );
      });
    }

    if (selectedDescriptionsWords?.length > 0) {
      filtered = filtered.filter((thesis) => {
        const descriptionLowerCase = thesis.description?.toLowerCase();
        return selectedDescriptionsWords.some((word) =>
          descriptionLowerCase.includes(word.toLowerCase())
        );
      });
    }
    if (selectedNotesWords?.length > 0) {
      filtered = filtered.filter((thesis) => {
        const notesLowerCase = thesis.notes?.toLowerCase();
        return selectedNotesWords.some((word) =>
          notesLowerCase.includes(word.toLowerCase())
        );
      });
    }

    if (selectedSupervisor?.length > 0) {
      filtered = filtered.filter((thesis) =>
        selectedSupervisor.includes(thesis.supervisor)
      );
    }
    if (selectedDate != null) {
      filtered = filtered.filter((thesis) =>
        dayjs(thesis.expiration).isAfter(selectedDate)
      );
    }

    if (selectedCosupervisor?.length > 0) {
      filtered = filtered.filter((thesis) =>
        thesis.cosupervisors.some((cosup) =>
          selectedCosupervisor.includes(cosup)
        )
      );
    }

    if (selectedType?.length > 0) {
      filtered = filtered.filter((thesis) =>
        selectedType.includes(thesis.type)
      );
    }

    if (selectedKeywords?.length > 0) {
      filtered = filtered.filter((thesis) =>
        thesis.keywords.some((keyword) => selectedKeywords.includes(keyword))
      );
    }

    if (selectedGroups?.length > 0) {
      filtered = filtered.filter((thesis) =>
        thesis.groups.some((group) => selectedGroups.includes(group.group))
      );
    }

    setProposals(filtered);
    setAdvancedFilters(true);
    setShowFilters(false);
  };

  const addWord = (value, setValue, selectedItems, setSelectedItems) => {
    let words = [];
    if (selectedItems?.length > 0) words = [...selectedItems];
    let wordExists = words.some((w) => w === value);
    if (!wordExists && (value !== '' && value !== ' ')) words.push(value);
    setValue("");
    setSelectedItems(words);
  };

  useEffect(() => {
    if (scrollbarRef.current) {
      const ps = scrollbarRef.current;
      ps.scrollTo(ps.scrollWidth, 0);
    }
  }, [selectedTitlesWords, selectedKnowledgeWords, selectedDescriptionsWords, selectedKeywords, selectedGroups, selectedCosupervisor, selectedType, selectedNotesWords]);

  return (
    loading? <Loading/> : (<Card
      className="container mt-6 custom-rounded"
      style={{ marginBottom: "0.5em", paddingTop: "0.5em" }}
    >
      <Form>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gridGap: "1.1em",
          }}
        >
          {/* title */}
          <div
            className="mt-0 p-0"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Form.Label
                  className="chip-list"
                  style={{
                    maxWidth: "100%",
                    width: "100%",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    scrollBehavior: "smooth",
                    height: "2.5em",
                    overflowY: "auto"
                  }}
                >
                  {selectedTitlesWords && selectedTitlesWords.length > 0 && (
                    <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                      <Chips2
                        items={titles}
                        selectedItems={selectedTitlesWords}
                        setItems={setTitles}
                        setSelectedItems={setSelectedTitlesWords}
                      />
                    </PerfectScrollbar>
                  )}
                </Form.Label>
              </Form.Group>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Col
                xs={4}
                className="d-flex align-items-center justify-content-center"
              >
                <p style={{ margin: "0px" }}>Title: </p>
              </Col>

              <Col xs={8} className="position-relative">
                <div className="input-group" style={{ paddingLeft: '0.4em' }}>
                  <input
                    type="text"
                    className="form-control custom-input-text"
                    placeholder={"Search by title..."}
                    value={titleFilter}
                    onChange={(e) => {
                      setTitleFilters(e.target.value);
                    }}
                    style={{ borderRight: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addWord(titleFilter, setTitleFilters, selectedTitlesWords, setSelectedTitlesWords);
                      }
                    }}
                  />
                  <span className="input-group-text custom-input-text" style={{ background: 'white' }}>
                    <ArrowReturnLeft onClick={() => { addWord(titleFilter, setTitleFilters, selectedTitlesWords, setSelectedTitlesWords) }} />
                  </span>
                </div>
              </Col>
            </div>
          </div>

          {/* description */}
          <div
            className="mt-0 p-0"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Form.Label
                  className="chip-list"
                  style={{
                    maxWidth: "100%",
                    width: "100%",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    scrollBehavior: "smooth",
                    height: "2.5em",
                    overflowY: "auto"
                  }}
                >
                  {selectedDescriptionsWords && selectedDescriptionsWords.length > 0 && (
                    <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                      <Chips2
                        items={descriptions}
                        selectedItems={selectedDescriptionsWords}
                        setItems={setDescriptions}
                        setSelectedItems={setSelectedDescriptionsWords}
                      />
                    </PerfectScrollbar>
                  )}
                </Form.Label>
              </Form.Group>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Col
                xs={4}
                className="d-flex align-items-center justify-content-center"
              >
                <p style={{ margin: "0px" }}>Description: </p>
              </Col>

              <Col xs={8} className="position-relative">
                <div className="input-group" style={{ paddingLeft: '0.4em' }}>
                  <input
                    type="text"
                    className="form-control custom-input-text"
                    placeholder={"Search in description..."}
                    value={descriptionFilter}
                    onChange={(e) => {
                      setDescriptionFilter(e.target.value);
                    }}
                    style={{ borderRight: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addWord(descriptionFilter, setDescriptionFilter, selectedDescriptionsWords, setSelectedDescriptionsWords);
                      }
                    }}
                  />
                  <span className="input-group-text custom-input-text" style={{ background: 'white' }}>
                    <ArrowReturnLeft onClick={() => { addWord(descriptionFilter, setDescriptionFilter, selectedDescriptionsWords, setSelectedDescriptionsWords) }} />
                  </span>
                </div>
              </Col>
            </div>
          </div>

          {/* knowledge */}
          <div
            className="mt-0 p-0"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Form.Label
                  className="chip-list"
                  style={{
                    maxWidth: "100%",
                    width: "100%",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    scrollBehavior: "smooth",
                    height: "2.5em",
                    overflowY: "auto"
                  }}
                >
                  {selectedKnowledgeWords && selectedKnowledgeWords.length > 0 && (
                    <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                      <Chips2
                        items={knowledge}
                        selectedItems={selectedKnowledgeWords}
                        setItems={setKnowledge}
                        setSelectedItems={setSelectedKnowledgeWords}
                      />
                    </PerfectScrollbar>
                  )}
                </Form.Label>
              </Form.Group>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Col
                xs={4}
                className="d-flex align-items-center justify-content-center"
              >
                <p style={{ margin: "0px" }}>Knowledge: </p>
              </Col>

              <Col xs={8} className="position-relative">
                <div className="input-group" style={{ paddingLeft: '0.4em' }}>
                  <input
                    type="text"
                    className="form-control custom-input-text"
                    placeholder={"Search in knowledge..."}
                    value={knowledgeFilter}
                    onChange={(e) => {
                      setKnowledgeFilter(e.target.value);
                    }}
                    style={{ borderRight: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addWord(knowledgeFilter, setKnowledgeFilter, selectedKnowledgeWords, setSelectedKnowledgeWords);
                      }
                    }}
                  />
                  <span className="input-group-text custom-input-text" style={{ background: 'white' }}>
                    <ArrowReturnLeft onClick={() => { addWord(knowledgeFilter, setKnowledgeFilter, selectedKnowledgeWords, setSelectedKnowledgeWords) }} />
                  </span>
                </div>
              </Col>
            </div>
          </div>



          {/* notes */}
          <div
            className="mt-0 p-0"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Form.Label
                  className="chip-list"
                  style={{
                    maxWidth: "100%",
                    width: "100%",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    scrollBehavior: "smooth",
                    height: "2.5em",
                    overflowY: "auto"
                  }}
                >
                  {selectedNotesWords && selectedNotesWords.length > 0 && (
                    <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                      <Chips2
                        items={notes}
                        selectedItems={selectedNotesWords}
                        setItems={setNotes}
                        setSelectedItems={setSelectedNotesWords}
                      />
                    </PerfectScrollbar>
                  )}
                </Form.Label>
              </Form.Group>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Col
                xs={4}
                className="d-flex align-items-center justify-content-center"
              >
                <p style={{ margin: "0px" }}>Notes: </p>
              </Col>

              <Col xs={8} className="position-relative">
                <div className="input-group" style={{ paddingLeft: '0.4em' }}>
                  <input
                    type="text"
                    className="form-control custom-input-text"
                    placeholder={"Search in notes..."}
                    value={notesFilter}
                    onChange={(e) => {
                      setNotesFilters(e.target.value);
                    }}
                    style={{ borderRight: 'none' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addWord(notesFilter, setNotesFilters, selectedNotesWords, setSelectedNotesWords);
                      }
                    }}
                  />
                  <span className="input-group-text custom-input-text" style={{ background: 'white' }}>
                    <ArrowReturnLeft onClick={() => { addWord(notesFilter, setNotesFilters, selectedNotesWords, setSelectedNotesWords)}} />
                  </span>
                </div>
              </Col>
            </div>
          </div>



          {/* supervisor */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Form.Label
                  className="chip-list"
                  style={{
                    maxWidth: "100%",
                    width: "100%",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    scrollBehavior: "smooth",
                    height: "2.5em",
                    overflowY: "auto"
                  }}
                >
                  {selectedSupervisor && selectedSupervisor.length > 0 && (
                    <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                      <Chips2
                        items={supervisors}
                        selectedItems={selectedSupervisor}
                        setItems={setSupervisors}
                        setSelectedItems={setSelectedSupervisor}
                      />
                    </PerfectScrollbar>
                  )}
                </Form.Label>
              </Form.Group>
            </div>
            <SearchDropdown
              placeholder={"Supervisor"}
              position={"end"}
              items={supervisors}
              setItems={setSupervisors}
              selectedItems={selectedSupervisor}
              setSelectedItems={setSelectedSupervisor}
            />
          </div>
          {/* Co-Supervisor */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Row className="align-items-center">
                  <Col>
                    <Form.Label
                      className="chip-list"
                      style={{
                        maxWidth: "100%",
                        width: "100%",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        scrollBehavior: "smooth",
                        height: "2.5em",
                        overflowY: "auto"
                      }}
                      ref={(labelRef) => {
                        if (labelRef) {
                          labelRef.scrollLeft =
                            labelRef.scrollWidth - labelRef.clientWidth;
                        }
                      }}
                    >
                      {selectedCosupervisor &&
                        selectedCosupervisor.length > 0 && (
                          <Chips2
                            items={cosupervisors}
                            selectedItems={selectedCosupervisor}
                            setItems={setCosupervisors}
                            setSelectedItems={setSelectedCosupervisor}
                          />
                        )}
                    </Form.Label>
                  </Col>
                </Row>
              </Form.Group>
            </div>
            <SearchDropdown
              placeholder={"CoSupervisors"}
              position={"start"}
              items={cosupervisors}
              setItems={setCosupervisors}
              selectedItems={selectedCosupervisor}
              setSelectedItems={setSelectedCosupervisor}
            />
          </div>
          {/* Type */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Row className="align-items-center">
                  <Col>
                    <Form.Label
                      className="chip-list"
                      style={{
                        maxWidth: "100%",
                        width: "100%",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        scrollBehavior: "smooth",
                        height: "2.5em",
                        overflowY: "auto"
                      }}
                    >

                      {selectedType && selectedType.length > 0 && (
                        <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                          <Chips2
                            items={type}
                            selectedItems={selectedType}
                            setItems={setType}
                            setSelectedItems={setSelectedType}
                          />
                        </PerfectScrollbar>
                      )}
                    </Form.Label>
                  </Col>
                </Row>
              </Form.Group>
            </div>
            <SearchDropdown
              placeholder={"Type"}
              position={"end"}
              items={type}
              setItems={setType}
              selectedItems={selectedType}
              setSelectedItems={setSelectedType}
            />
          </div>
          {/* Keywords */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Row className="align-items-center">
                  <Col>
                    <Form.Label
                      className="chip-list"
                      style={{
                        maxWidth: "100%",
                        width: "100%",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        scrollBehavior: "smooth",
                        height: "2.5em",
                        overflowY: "auto"
                      }}

                    >
                      {selectedKeywords && selectedKeywords.length > 0 && (
                        <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                          <Chips2
                            items={keywords}
                            selectedItems={selectedKeywords}
                            setItems={setKeywords}
                            setSelectedItems={setSelectedKeywords}
                          />
                        </PerfectScrollbar>
                      )}
                    </Form.Label>
                  </Col>
                </Row>
              </Form.Group>
            </div>
            <SearchDropdown
              placeholder={"Keywords"}
              position={"end"}
              items={keywords}
              setItems={setKeywords}
              selectedItems={selectedKeywords}
              setSelectedItems={setSelectedKeywords}
            />
          </div>
          {/* Groups */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "100%" }}>
              <Form.Group>
                <Row className="align-items-center">
                  <Col>
                    <Form.Label
                      className="chip-list"
                      style={{
                        maxWidth: "100%",
                        width: "100%",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        scrollBehavior: "smooth",
                        height: "2.5em",
                        overflowY: "auto"
                      }}
                    >
                      {selectedGroups && selectedGroups.length > 0 && (
                        <PerfectScrollbar containerRef={(ref) => (scrollbarRef.current = ref)}>
                          <Chips2
                            items={groups}
                            selectedItems={selectedGroups}
                            setItems={setGroups}
                            setSelectedItems={setSelectedGroups}
                          />
                        </PerfectScrollbar>
                      )}
                    </Form.Label>
                  </Col>
                </Row>
              </Form.Group>
            </div>
            <SearchDropdown
              placeholder={"Groups"}
              position={"start"}
              items={groups}
              setItems={setGroups}
              selectedItems={selectedGroups}
              setSelectedItems={setSelectedGroups}
            />
          </div>
          {/* Date */}
          <div
            className="mt-0 py-2"
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "0.5em",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: "1.3em",
              }}
            >
              <Col
                xs={4}
                className="d-flex align-items-center justify-content-center"
              >
                <p style={{ margin: "0px", paddingTop: isMobile ? "0.5" : "1.3em" }}>Expirate after:</p>
              </Col>
              <Col xs={8} className="d-flex align-items-center justify-content-end">
                <Form.Group style={{ width: "97%", paddingTop: isMobile ? "0.5em" : "0.9em" }}>
                  <Form.Control
                    type="date"
                    id="expiration"
                    name="expiration"
                    value={selectedDate}
                    onChange={(e) => {
                      const selected = new Date(e.target.value);
                      if (selected > virtualClock) {
                        setSelectedDate(e.target.value);
                      } else {
                        handleToast("Date must be in the future", "error");
                      }
                    }}
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </div>
          </div>
        </div>

        <Row className="d-flex justify-content-end">
          <Col xs={8} className="d-flex justify-content-end">
            <Button className="button-style-cancel" onClick={handleReset}>
              Reset
            </Button>
            <Button
              className="button-style"
              onClick={() => {
                handleFilter();
              }}
            >
              Search
            </Button>
          </Col>
        </Row>

        <ToastContainer />
      </Form>
    </Card>
  ));
};

export { FilterCard };
