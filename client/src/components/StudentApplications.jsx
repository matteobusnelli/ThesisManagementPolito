import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Table, Accordion, Badge } from "react-bootstrap";
import Loading from "./Loading";
import { useMediaQuery } from "react-responsive";
import MessageContext from "../messageCtx";
import API from "../API";
import dayjs from "dayjs";
import NoFileFound from "./NoFileFound";
import { motion } from "framer-motion";
import ViewProposalMotion from "./ViewProposalMotion";

function StudentApplications(props) {
  const [applications, setApplications] = useState(undefined);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { handleToast } = useContext(MessageContext);
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1025 });
  const isTabletHorizonthal = useMediaQuery({ minWidth: 1026, maxWidth: 1367 });
  useEffect(() => {
    if (!props.loggedIn || props.user.user_type !== "STUD") {
      return API.redirectToLogin();
    }
    props.setLoading(true);
    try {
      const getApplications = async () => {
        const result = await API.getStudentApplications();
        setApplications(result);
        props.setLoading(false);
      };
      getApplications();
    } catch (err) {
      handleToast(err, "error");
    }
  }, []);

  return (
    <div className="d-flex justify-content-center">
      {props.loading && <Loading />}
      <Container className="width-80 margin-custom">
        <Row className="align-items-center">
          <Col
            xs={12}
            className="d-flex justify-content-between align-items-center"
          >
            <h1
              className={`margin-titles-custom ${
                props.isMobile ? "smaller-heading" : ""
              }`}
            >
              My applications
            </h1>
          </Col>
        </Row>
        {!applications || applications.length === 0 ? (
          <NoFileFound message={"No application found"} />
        ) : !isMobile ? (
          <Container>
            <Row
              style={{
                fontWeight: "400",
                fontSize: "20px",
                background: "rgb(238, 238, 238)",
                borderRadius: "5px",
                padding: "0.2rem",
              }}
            >
              <Col className="col-4">Thesis</Col>
              <Col className="col-3">Supervisor</Col>
              <Col className="col-3">Application Date</Col>
              <Col className="col-2">Status</Col>
            </Row>
            {applications.map((element, index) => {
              return (
                <ApplicationRow
                  element={element}
                  key={index}
                  isMobile={isMobile}
                  isTablet={isTablet}
                  isTabletHorizonthal={isTabletHorizonthal}
                  user={props.user}
                  isAlreadyApplied={props.isAlreadyApplied}
                  setIsAlreadyApplied={props.setIsAlreadyApplied}
                />
              );
            })}
          </Container>
        ) : (
          <Row>
            <Col>
              <Row
                className="mb-2"
                style={{
                  fontWeight: "400",
                  fontSize: "20px",
                  background: "rgb(238, 238, 238)",
                  borderRadius: "5px",
                  padding: "0.2rem",
                }}
              >
                <Col className="col-8">Thesis</Col>
                <Col className="col-4">Status</Col>
              </Row>
              <Accordion>
                {applications.map((element, index) => {
                  return (
                    <MobileApplication
                      element={element}
                      index={index}
                      key={index}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      isTabletHorizonthal={isTabletHorizonthal}
                      user={props.user}
                      isAlreadyApplied={props.isAlreadyApplied}
                      setIsAlreadyApplied={props.setIsAlreadyApplied}
                    />
                  );
                })}
              </Accordion>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

function ApplicationRow(props) {
  const [isClicked, setIsClicked] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const handleModalClick = (e) => {
    /*  console.log("e.target", e.target);
    console.log("e.currentTarget", e.currentTarget); */

    // If the click occurs outside the expanded card, close it
    if (!e || e.target === e.currentTarget) {
      /* props. */ setIsClicked(false);
    }
  };
  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
          borderBottom: "2px solid rgb(238, 238, 238)",
          padding: "0.2rem",
        }}
        className="mt-3"
        /*  key={props.key} */
      >
        <Row>
          <Col className="col-4">
            <span
              className="title-custom-proposals"
              style={{
                fontSize: 18,
                cursor: "pointer",
              }}
              onClick={() => {
                /* props. */ setIsClicked(true);
              }}
            >
              {props.element.title}
            </span>
          </Col>
          <Col className="col-3">
            {props.element.name + " " + props.element.surname}
          </Col>
          <Col className="col-3">
            {dayjs(props.element.application_date).format("MM/DD/YYYY")}
          </Col>
          <Col className="col-2">
            <ApplicationStatus status={props.element.status} />
          </Col>
        </Row>
      </motion.div>
      {
        /* props. */ isClicked && (
          <ViewProposalMotion
            proposal={{
              ...props.element,
              keywords:
                props.element.keywords && props.element.keywords.join(","),
              supervisor: props.element.name + " " + props.element.surname,
            }}
            isMobile={props.isMobile}
            setIsClicked={/* props. */ setIsClicked}
            cardPosition={/* props. */ cardPosition}
            isTablet={props.isTablet}
            isTabletHorizonthal={props.isTabletHorizonthal}
            user={props.user}
            handleModalClick={handleModalClick}
            handleUploadInterface={() => console.err("Non stampare")}
            isAlreadyApplied={props.isAlreadyApplied}
            setIsAlreadyApplied={props.setIsAlreadyApplied}
            fromApplications={true}
          />
        )
      }
    </>
  );
}

function MobileApplication(props) {
  const [isClicked, setIsClicked] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const handleModalClick = (e) => {
    /*  console.log("e.target", e.target);
    console.log("e.currentTarget", e.currentTarget); */

    // If the click occurs outside the expanded card, close it
    if (!e || e.target === e.currentTarget) {
      setIsClicked(false);
    }
  };
  return (
    <>
      <Accordion.Item eventKey={props.index} className="custom-accordion-item">
        <Accordion.Header>
          <Row>
            <Col className="col-8">
              <span
                style={{
                  fontSize: 18,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setIsClicked(true);
                }}
              >
                {props.element.title}
              </span>
            </Col>
            <Col className="col-4">
              <ApplicationStatus status={props.element.status} />
            </Col>
          </Row>
        </Accordion.Header>
        <Accordion.Body style={{ position: "relative" }}>
          <p>
            Application date:{" "}
            <b>{dayjs(props.element.application_date).format("MM/DD/YYYY")}</b>
          </p>
          <p>
            Supervisor:{" "}
            <b>{props.element.name + " " + props.element.surname}</b>
          </p>
          <p>
            Expiration date:{" "}
            <b>{dayjs(props.element.expiration).format("MM/DD/YYYY")}</b>
          </p>
        </Accordion.Body>
      </Accordion.Item>
      {isClicked && (
        <ViewProposalMotion
          proposal={{
            ...props.element,
            keywords:
              props.element.keywords && props.element.keywords.join(","),
            supervisor: props.element.name + " " + props.element.surname,
          }}
          isMobile={props.isMobile}
          setIsClicked={setIsClicked}
          cardPosition={cardPosition}
          isTablet={props.isTablet}
          isTabletHorizonthal={props.isTabletHorizonthal}
          user={props.user}
          handleModalClick={handleModalClick}
          handleUploadInterface={() => console.err("Non stampare")}
          isAlreadyApplied={props.isAlreadyApplied}
          setIsAlreadyApplied={props.setIsAlreadyApplied}
          fromApplications={true}
        />
      )}
    </>
  );
}

function ApplicationStatus(props) {
  return props.status === "Rejected" || props.status === "Cancelled" ? (
    <Badge bg="danger" style={{ maxWidth: "100px" }}>
      {props.status}
    </Badge>
  ) : props.status === "pending" ? (
    <Badge bg="warning" style={{ maxWidth: "100px" }}>
      Pending
    </Badge>
  ) : (
    <Badge bg="success" style={{ maxWidth: "100px" }}>
      Accepted
    </Badge>
  );
}

export default StudentApplications;
