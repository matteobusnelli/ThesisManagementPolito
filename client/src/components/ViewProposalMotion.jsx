import { Button, Card, Col, OverlayTrigger, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import dayjs from "dayjs";
import {
  Calendar,
  Pencil,
  Trash3,
  Archive,
  People,
  Person,
} from "react-bootstrap-icons";
import MessageContext from "../messageCtx";
import randomcolor from "randomcolor";
import { motion } from "framer-motion";
import { useEffect, useState, useContext } from "react";
import API from "../API";
import Loading from "./Loading";

function ViewProposalMotion(props) {
  const type = props.user?.user_type;
  const [cosup, setCosup] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { handleToast } = useContext(MessageContext);
  //const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    console.log(props.proposal);
    setIsLoading(true);
    /* async function isApplied() {
      let alreadyApply = await API.isApplied();
      setIsAlreadyApplied(alreadyApply);
    } */
    if (type === "STUD" && props.proposal) {
      setCosup(props.proposal?.cosupervisors.join(", "));
      /* try {
        isApplied();
      } catch (err) {
        handleToast(err, "error");
      } */
    }
    if (type === "PROF" && props.proposal) {
      let ext = props.proposal?.external_cosupervisors?.map((ex) => {
        return ex.ext_supervisor_name;
      });
      let int = props.proposal?.internal_cosupervisors?.map((ex) => {
        return ex.int_supervisor_name;
      });
      let concatenatedCosup = [...int, ...ext];
      setCosup(concatenatedCosup.join(", "));
    }
    setIsLoading(false);
  }, [props.proposal, type]);

  return isLoading ? (
    <Loading />
  ) : (
    <motion.div
      initial={{
        opacity: 0,
        x: props.cardPosition.x - 100,
        y: props.cardPosition.y,
        width: "120%",
        height: "30%",
      }}
      animate={{ opacity: 1, x: 0, y: 0, width: "100%", height: "100%" }}
      exit={{
        opacity: 0,
        x: props.cardPosition.x,
        y: props.cardPosition.y,
        width: "100%",
        height: "100%",
      }}
      transition={{ opacity: { duration: 0 }, default: { duration: 0 } }}
      onClick={props.handleModalClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={props.handleModalClick}
        style={{
          width: "90%", // Adjust the width as per your requirement
          height: "90%", // Adjust the height as per your requirement
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            padding: 20,
            height: "fit-content",
            maxHeight: props.isMobile ? "800px" : "",
            overflowY: props.isMobile ? "auto" : "none",
          }}
          className="custom-card-proposals-big"
        >
          <Row>
            <Col xs={type === "STUD" ? 12 : 8} lg={6}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: props.isMobile ? 20 : 28,
                  marginBottom: props.isMobile && type === "PROF" ? "1rem" : "",
                }}
              >
                {props.proposal.title}
              </div>
              {type === "STUD" && (
                <div
                  style={{
                    fontSize: props.isMobile ? 15 : 18,
                    paddingLeft: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <Person
                    style={{ marginBottom: "0.3rem", marginRight: "1rem" }}
                  />
                  <span style={{ fontWeight: 500, fontSize: 18 }}>
                    {props.proposal.supervisor}
                  </span>
                </div>
              )}
              {type === "STUD" && cosup != "" && (
                <div
                  style={{
                    fontSize: 18,
                    paddingLeft: "1rem",
                  }}
                >
                  <People
                    style={{ marginBottom: "0.3rem", marginRight: "1rem" }}
                  />
                  <span style={{ fontWeight: 500, fontSize: 18 }}>{cosup}</span>
                </div>
              )}
            </Col>

            {type === "PROF" && (
              <Col className="text-end mx-2">
                <Row>
                  <Col xs={6} md={6} lg={3}>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={props.renderTooltipEdit}
                    >
                      <Button
                        variant="light"
                        onClick={() => {
                          navigate("/updateproposal/" + props.proposal.id);
                        }}
                      >
                        {!props.isMobile && <span className="mx-2">Edit</span>}
                        <Pencil />
                      </Button>
                    </OverlayTrigger>
                  </Col>
                  <Col xs={6} md={6} lg={3}>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={props.renderTooltipCopy}
                    >
                      <Button
                        variant="light"
                        onClick={() => {
                          navigate("/copyproposal/" + props.proposal.id);
                        }}
                      >
                        {!props.isMobile && <span className="mx-2">Copy</span>}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-copy"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                          />
                        </svg>
                      </Button>
                    </OverlayTrigger>
                  </Col>
                  <Col xs={6} md={6} lg={3}>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={props.renderTooltipDelete}
                    >
                      <Button
                        variant="light"
                        onClick={() => props.setShowDelete(true)}
                      >
                        {!props.isMobile && (
                          <span className="mx-2">Delete</span>
                        )}
                        <Trash3 />
                      </Button>
                    </OverlayTrigger>
                  </Col>
                  {!props.proposal.is_archived && (
                    <Col xs={6} md={6} lg={3}>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={props.renderTooltipArchive}
                      >
                        <Button
                          variant="light"
                          onClick={() => props.setShowArchive(true)}
                        >
                          {!props.isMobile && (
                            <span className="mx-2">Archive</span>
                          )}
                          <Archive />
                        </Button>
                      </OverlayTrigger>
                    </Col>
                  )}
                </Row>
              </Col>
            )}

            {props.proposal.keywords && type === "STUD" && (
              <Col
                xs={6}
                lg={6}
                className="hide-scrollbar"
                style={{
                  fontWeight: "semi-bold",
                  fontSize: props.isMobile || props.isTablet ? 14 : 20,
                  height: !props.isMobile ? 25 : 40,
                  marginTop: 5,
                }}
              >
                {props.proposal.keywords.split(", ").map((key, index) => (
                  <span
                    key={index}
                    className="badge"
                    style={{
                      backgroundColor: randomcolor({
                        seed: key,
                        luminosity: "bright",
                        format: "rgba",
                        alpha: 1,
                      }).replace(/1(?=\))/, "0.1"),
                      color: randomcolor({
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
              </Col>
            )}
          </Row>

          {type === "PROF" && cosup != "" && (
            <Col
              style={{
                fontSize: 18,
                paddingLeft: "1rem",
              }}
            >
              <People style={{ marginBottom: "0.3rem", marginRight: "1rem" }} />
              <span style={{ fontWeight: 500, fontSize: 18 }}>{cosup}</span>
            </Col>
          )}

          {props.proposal.keywords && type === "PROF" && (
            <div
              className="hide-scrollbar"
              style={{
                fontWeight: "semi-bold",
                fontSize: 14,
                height: !props.isMobile ? 25 : 40,
                marginTop: 5,
                paddingLeft: "0.5rem",
              }}
            >
              {props.proposal.keywords.split(", ").map((key, index) => (
                <span
                  key={index}
                  className="badge"
                  style={{
                    backgroundColor: randomcolor({
                      seed: key,
                      luminosity: "bright",
                      format: "rgba",
                      alpha: 1,
                    }).replace(/1(?=\))/, "0.1"),
                    color: randomcolor({
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
          )}

          <div
            style={{
              fontSize: 16,
              marginTop: "0.5rem",
              paddingLeft: "0.5rem",
            }}
          >
            <p
              style={{
                fontWeight: 500,
                margin: 0,
                marginTop: props.isMobile ? "0.5rem" : 0,
              }}
            >
              {" "}
              DESCRIPTION{" "}
            </p>
            <span
              style={{
                display: "block",
                paddingLeft: "1rem",
                maxHeight: props.isMobile ? "200px" : "500px",
                overflowY: "auto",
                minWidth: props.isMobile
                  ? 0
                  : props.isTablet
                  ? 500
                  : props.isTabletHorizonthal
                  ? 800
                  : "30em",
              }}
            >
              {props.proposal.description}
            </span>
          </div>

          <div
            style={{
              fontSize: 16,
              marginTop: 16,
              paddingLeft: "0.5rem",
            }}
          >
            <p style={{ fontWeight: 500, margin: 0 }}> REQUIRED KNOWLEDGE </p>
            <span
              style={{
                display: "block",
                paddingLeft: "1rem",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {props.proposal.required_knowledge}
            </span>
          </div>

          <div
            style={{
              fontSize: 16,
              marginTop: 16,
              paddingLeft: "0.5rem",
            }}
          >
            <p style={{ fontWeight: 500, margin: 0 }}> NOTES </p>
            <span
              style={{
                display: "block",
                paddingLeft: "1rem",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {props.proposal.notes}
            </span>
          </div>

          <Row className="d-flex">
            <Col xl={10}>
              <Row
                style={{
                  fontSize: 16,
                  marginTop: "2em",
                }}
              >
                <Col
                  className={
                    props.isMobile
                      ? "col-5"
                      : props.isTablet
                      ? "col-3"
                      : "col-2"
                  }
                >
                  <span style={{ color: "black", fontWeight: 500 }}>
                    Thesis Level
                  </span>
                </Col>
                <Col>
                  <span
                    style={{
                      color: "black",
                    }}
                  >
                    {props.proposal.thesis_level.toUpperCase()}
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
                    props.isMobile
                      ? "col-5"
                      : props.isTablet
                      ? "col-3"
                      : "col-2"
                  }
                >
                  <span style={{ color: "black", fontWeight: 500 }}>
                    Thesis Type
                  </span>
                </Col>
                <Col>
                  <span
                    style={{
                      color: "black",
                    }}
                  >
                    {props.proposal.thesis_type.toUpperCase()}
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
                    props.isMobile
                      ? "col-5"
                      : props.isTablet
                      ? "col-3"
                      : "col-2"
                  }
                >
                  <span style={{ color: "black", fontWeight: 500 }}>
                    Expire at
                  </span>
                </Col>
                <Col>
                  <span style={{ color: "black" }}>
                    {dayjs(props.proposal.expiration).format("DD/MM/YYYY")}
                  </span>
                  <Calendar
                    style={{ marginLeft: "0.4rem", marginBottom: "0.2rem" }}
                  />
                </Col>
              </Row>
            </Col>
            {type === "STUD" &&
              !props.isAlreadyApplied &&
              !props.fromApplications && (
                <Col
                  className="d-flex flex-column justify-content-end align-items-end"
                  xl={2}
                >
                  <div className="m-2">
                    <Button
                      className="button-style"
                      onClick={props.handleUploadInterface}
                    >
                      <span className="mx-2">Apply</span>
                    </Button>
                  </div>
                </Col>
              )}
          </Row>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default ViewProposalMotion;
