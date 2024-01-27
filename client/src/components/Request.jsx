import {
  Button,
  Card,
  Col,
  Container,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { isMotionComponent, motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import Loading from "./Loading";
import randomcolor from "randomcolor";
import API from "../API";
import NoFileFound from "./NoFileFound";
import { Check2, XLg, People } from "react-bootstrap-icons";
import { useMediaQuery } from "react-responsive";
import MessageContext from "../messageCtx";
import Cv from "./Cv";

function RequestsPage(props) {
  const [requestList, setRequestList] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1000 });
  const { handleToast } = useContext(MessageContext);
  const [showCv, setShowCv] = useState(false);
  const [studentID, setStudentID] = useState("");

  useEffect(() => {
    async function getRequests() {
      props.setLoading(true);
      try {
        if (props.user && props.user.user_type === "PROF") {
          let result = await API.getRequestsForProfessor();
          setRequestList(result);
        }
        if (props.user && props.user.user_type === "SECR") {
          let result = await API.getRequestsForSecretary();
          setRequestList(result);
        }
      } catch (err) {
        handleToast("Error while fetching requests", "error");
        console.log(err);
      }
    }
    getRequests();
    props.setLoading(false);
  }, [props.user]);

  const handleDecision = async (request, decision) => {
    //console.log(request, decision);
    let error = false;
    try {
      if (decision) {
        //console.log(decision);
        await API.updateRequest(
          request.id,
          props.user.user_type === "PROF" ? 3 : 1
        );
        handleToast("Request accepted", "success");
      } else {
        await API.updateRequest(
          request.id,
          props.user.user_type === "PROF" ? 5 : 4
        );
        handleToast("Request rejected", "success");
      }
    } catch (err) {
      error = true;
      handleToast("Error while updating the request", "error");
    } finally {
      if (!error) {
        setRequestList((prev) => {
          let req = [...prev];
          //console.log(req);
          req = req.filter((r) => r.id != request.id);
          //console.log(req);
          return req;
        });
      }
    }
  };

  function handleClose() {
    setShowCv(false);
  }

  return props.loading ? (
    <Loading />
  ) : (
    <>
      <Container className="p-4">
        <Row className="fs-2 mb-2">Requests</Row>
        <Row>
          {requestList.length > 0 ? (
            requestList?.map((req, index) => {
              return (
                <RequestCard
                  key={index}
                  request={req}
                  isMobile={isMobile}
                  isTablet={isTablet}
                  isSecretary={props.user.user_type === "SECR" ? true : false}
                  handleDecision={handleDecision}
                  setShowCv={setShowCv}
                  setStudentID={setStudentID}
                />
              );
            })
          ) : (
            <NoFileFound message={"No request found"} />
          )}
        </Row>
      </Container>

      {showCv && (
        <Cv show={showCv} onHide={handleClose} studentID={studentID}></Cv>
      )}
    </>
  );
}

function RequestCard(props) {
  const {
    request,
    isMobile,
    isTablet,
    isSecretary,
    handleDecision,
    setShowCv,
    setStudentID,
  } = props;

  const [student, setStudent] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    async function studentDetails() {
      try {
        setIsLoading(true);
        let student = await API.getStudent(request.student_id);
        //console.log(student[0]);
        setStudent(student[0]);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
    studentDetails();
  }, []);

  const renderTooltipAccept = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Accept
    </Tooltip>
  );

  const renderTooltipReject = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Reject
    </Tooltip>
  );

  const toggleExpanded = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const getDescriptionDisplay = () => {
    const maxLength = isMobile ? 100 : 150;

    if (request.description.length > maxLength) {
      return expanded
        ? request.description
        : `${request.description.substring(0, maxLength)}... `;
    }

    return request.description;
  };

  //console.log(request);
  return isLoading ? (
    <Loading />
  ) : (
    <Col xs={12} md={12} lg={6} xl={6} xxl={4} className="mt-4">
      <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: "pointer" }}>
        <Card
          style={{ padding: 20, paddingTop: 15 }}
          className="custom-card-request"
        >
          <Card.Header
            style={{
              padding: 0,
              backgroundColor: "white",
              borderBottom: "none",
            }}
          >
            <Col className="text-end">
              <span
                className="badge"
                style={{
                  backgroundColor: randomcolor({
                    seed:
                      request.student_id +
                      (Number(request.student_id.slice(1)) / 3) * 7,
                    luminosity: "bright",
                    format: "rgba",
                    alpha: 1,
                  }).replace(/1(?=\))/, "0.1"),
                  color: randomcolor({
                    seed:
                      request.student_id +
                      (Number(request.student_id.slice(1)) / 3) * 7,
                    luminosity: "bright",
                    format: "rgba",
                    alpha: 1,
                  }),
                  padding: "0.5em 1.2em",
                  borderRadius: "0.25rem",
                  marginRight: 10,
                }}
              >
                {request.student_id}
              </span>

              {isSecretary && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: randomcolor({
                      seed:
                        request.supervisor_id +
                        (Number(request.supervisor_id.slice(1)) / 3) * 7,
                      luminosity: "bright",
                      format: "rgba",
                      alpha: 1,
                    }).replace(/1(?=\))/, "0.1"),
                    color: randomcolor({
                      seed:
                        request.supervisor_id +
                        (Number(request.supervisor_id.slice(1)) / 3) * 7,
                      luminosity: "bright",
                      format: "rgba",
                      alpha: 1,
                    }),
                    padding: "0.5em 1.2em",
                    borderRadius: "0.25rem",
                    marginRight: 10,
                  }}
                >
                  {request.supervisor_id}
                </span>
              )}
            </Col>
          </Card.Header>
          <Row>
            <Col
              xs={8}
              md={8}
              lg={8}
              xl={8}
              xxl={8}
              style={{ paddingLeft: 20, paddingRight: 0 }}
            >
              <Row>
                <div
                  style={{
                    fontWeight: "medium",
                    fontSize: 20,
                    padding: 0,
                  }}
                >
                  {request.title}
                </div>
              </Row>
              <Row>
                <Col style={{ padding: 0 }} xs={12} md={12} lg={12}>
                  <div
                    className="title-custom-proposals"
                    style={{
                      fontWeight: "medium",
                      fontSize: 15,
                      cursor: "pointer",
                      padding: 0,
                      marginBottom:
                        request.cosup_fullname.length > 0
                          ? 0
                          : !isSecretary
                          ? "1.5em"
                          : 0,
                    }}
                  >
                    <span>{"by "}</span>
                    <span
                      style={{ fontWeight: 500 }}
                      onClick={() => {
                        setShowCv(true);
                        setStudentID(request.student_id);
                      }}
                    >
                      {request.student_fullname}
                    </span>
                  </div>
                </Col>
              </Row>
              {isSecretary && (
                <Row>
                  <Col style={{ padding: 0 }} xs={12} md={12} lg={12}>
                    <div
                      style={{
                        marginBottom:
                          request.cosup_fullname.length > 0 ? 0 : "1.5em",
                        fontWeight: "medium",
                        fontSize: 15,
                        padding: 0,
                      }}
                    >
                      <span>{"for "}</span>
                      <span style={{ fontWeight: 500 }}>
                        {request.professor_fullname}
                      </span>
                    </div>
                  </Col>
                </Row>
              )}

              {request.cosup_fullname.length > 0 && (
                <Row>
                  <Col style={{ padding: 0 }} xs={12} md={12} lg={12}>
                    <div
                      style={{
                        fontWeight: "medium",
                        fontSize: 15,
                        padding: 0,
                      }}
                    >
                      <People style={{ marginRight: "0.5rem" }} />
                      <span style={{ fontWeight: 500 }}>
                        {request.cosup_fullname.join(", ")}
                      </span>
                    </div>
                  </Col>
                </Row>
              )}
            </Col>
            <Col xs={4} className="text-end px-4">
              <Row
                className={isMobile ? "d-flex justify-content-end" : ""}
                style={{ marginTop: "1em", marginRight: "1em" }}
              >
                <Col className="mx-2 p-0" xs={2} md={4} lg={4} xl={4} xxl={4}>
                  {isMobile ? (
                    <Check2 style={{ fontSize: 20 }} />
                  ) : (
                    <>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={renderTooltipAccept}
                      >
                        <Button
                          variant="light"
                          className="accept-button-appl"
                          onClick={() => {
                            handleDecision(request, true);
                          }}
                        >
                          <Check2 />
                        </Button>
                      </OverlayTrigger>
                    </>
                  )}
                </Col>
                <Col xs={2} md={4} lg={4} xl={4}>
                  {isMobile ? (
                    <XLg style={{ fontSize: 15 }} />
                  ) : (
                    <>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={renderTooltipReject}
                      >
                        <Button
                          variant="light"
                          className="reject-button-appl"
                          onClick={() => {
                            handleDecision(request, false);
                          }}
                        >
                          <XLg />
                        </Button>
                      </OverlayTrigger>
                    </>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <div
            style={{
              fontSize: 16,
              marginTop: 16,
              minHeight: isMobile || isTablet ? 50 : "",
              maxHeight: isMobile || isTablet ? 250 : "",
              height:
                isMobile || isTablet
                  ? "fit-content"
                  : /* expanded
                  ? "fit-content" 
                  :*/ "95px",
              /* WebkitLineClamp: isMobile ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflowX: "hidden",*/
              overflowY: expanded ? "scroll" : "hidden",
              marginBottom:
                !expanded && request.description.length < (isMobile ? 100 : 150)
                  ? "1.5em"
                  : 0,
            }}
          >
            {getDescriptionDisplay()}
            {/* request.description.length > (isMobile ? 100 : 150) && (
              <span
                style={{ width: "fit-content" }}
                className="description-read-more"
                onClick={toggleExpanded}
              >
                {!expanded && "Read more"}
              </span>
            ) */}
          </div>
          <Row className="text-end">
            <Col>
              <span
                onClick={
                  request.description.length > (isMobile ? 100 : 150) &&
                  toggleExpanded
                }
                className={"description-read-more text-muted"}
              >
                {request.description.length > (isMobile ? 100 : 150)
                  ? expanded
                    ? "Reduce"
                    : "Read More"
                  : ""}
              </span>
            </Col>
          </Row>
          <Row
            style={{
              fontSize: 16,
            }}
          >
            <Col xs={5} md={3} lg={4} xl={4}>
              <span>Code Degree</span>
            </Col>
            <Col>
              <span className="badge" style={{ color: "black" }}>
                {student.cod_degree}
              </span>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </Col>
  );
}
export default RequestsPage;
