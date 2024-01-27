import { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Modal,
  OverlayTrigger,
  Row,
  Table,
  Tooltip,
} from "react-bootstrap";
import Loading from "./Loading";
import { useMediaQuery } from "react-responsive";
import API from "../API";
import MessageContext from "../messageCtx";
import {
  Download,
  FileEarmarkPdf,
  FileEarmarkPdfFill,
  FolderFill,
  Check,
  X,
} from "react-bootstrap-icons";
import ConfirmationModal from "./ConfirmationModal";
import NoFileFound from "./NoFileFound";
import randomColor from "randomcolor";
import Cv from "./Cv";

function Applications(props) {
  const [applications, setApplications] = useState([]);
  const [thesisTitles, setThesisTitles] = useState([]);
  const { handleToast } = useContext(MessageContext);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    if (!props.loggedIn || props.user.user_type !== "PROF") {
      return API.redirectToLogin();
    }
    props.setLoading(true);
    //API CALL
    const getApplication = async () => {
      const result = await API.getPendingApplications();
      const promises = result.map(async (element) => {
        const files = await API.listApplicationFiles(
          element.student_id,
          element.thesis_id
        );
        return Object.assign({}, element, { files: files });
      });
      const updatedResult = await Promise.all(promises);
      const uniqueThesisTitles = [
        ...new Set(updatedResult.map((entry) => entry.thesis_title)),
      ];
      setApplications(updatedResult);
      setThesisTitles(uniqueThesisTitles);
      props.setLoading(false);
    };
    getApplication();
  }, []);

  const handleApplication = async (student_id, thesis_id, status) => {
    props.setLoading(true);
    try {
      await API.updateApplictionStatus(thesis_id, student_id, status);
      handleToast(
        "Student application " +
          (status === "Accepted" ? " accepted " : " rejected ") +
          "correctly",
        "success"
      );
      const result = await API.getPendingApplications();
      const promises = result.map(async (element) => {
        const files = await API.listApplicationFiles(
          element.student_id,
          element.thesis_id
        );
        return Object.assign({}, element, { files: files });
      });
      const updatedResult = await Promise.all(promises);
      const uniqueThesisTitles = [
        ...new Set(updatedResult.map((entry) => entry.thesis_title)),
      ];
      setApplications(updatedResult);
      setThesisTitles(uniqueThesisTitles);
      props.setLoading(false);
    } catch (err) {
      handleToast(err, "error");
    }
  };

  const handleDownloadZip = async (student_id, thesis_id) => {
    try {
      await API.downloadStudentApplicationAllFiles(student_id, thesis_id);
    } catch (err) {
      handleToast(err, "error");
    }
  };

  const handleDownloadPDF = async (student_id, thesis_id, file_name) => {
    try {
      await API.downloadStudentApplicationFile(
        student_id,
        thesis_id,
        file_name
      );
    } catch (err) {
      handleToast(err, "error");
    }
  };

  return props.loading ? (
    <Loading />
  ) : (
    <div className="d-flex justify-content-center">
      <Container className="width-80 margin-custom">
        <Row className="d-flex align-items-center">
          <Col
            xs={4}
            className="d-flex justify-content-between align-items-center"
          >
            <h1
              className={`margin-titles-custom ${
                props.isMobile ? "smaller-heading" : ""
              }`}
            >
              Applications
            </h1>
          </Col>
        </Row>

        {!applications || applications.length === 0 ? (
          <NoFileFound message={"No Applications found"} />
        ) : (
          <Row>
            {thesisTitles.map((title, i) => {
              return (
                <ApplicationCard
                  key={i}
                  title={title}
                  isMobile={isMobile}
                  applications={applications}
                  handleApplication={handleApplication}
                  handleDownloadZip={handleDownloadZip}
                  handleDownloadPDF={handleDownloadPDF}
                />
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
}

function ApplicationCard(props) {
  const [showStudentApplyed, setShowStudentApplyed] = useState(false);

  const studentApplyed = props.applications.filter(
    (appl) => props.title === appl.thesis_title
  ).length;

  const redPalette = ["#FF0000", "#CC0000", "#990000", "#660000", "#330000"];

  return (
    <>
      <Col xs={12} md={6} lg={4} className="mt-4">
        <Card
          style={{
            padding: 20,
            height: props.isMobile ? "fit-content" : "125px",
          }}
          className="custom-card-applications"
          onClick={() => setShowStudentApplyed(true)}
        >
          <Row>
            <Col
              className="col-8"
              style={{
                fontWeight: "400",
                fontSize: 20,
              }}
            >
              {props.title}
            </Col>
            <Col className="text-end">
              <div
                className="student-number-applyed"
                style={{
                  backgroundColor: randomColor({
                    seed: studentApplyed,
                    luminosity: "bright",
                    format: "rgba",
                    alpha: 1,
                    hue: "red",
                    palette: redPalette,
                  }).replace(/1(?=\))/, "0.1"),
                  color: randomColor({
                    seed: studentApplyed,
                    luminosity: "bright",
                    format: "rgba",
                    alpha: 1,
                    hue: "red",
                    palette: redPalette,
                  }),
                }}
              >
                {studentApplyed}
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
      <ModalStudentsApplyedForThesis
        show={showStudentApplyed}
        onHide={() => setShowStudentApplyed(false)}
        title={props.title}
        isMobile={props.isMobile}
        applications={props.applications}
        handleApplication={props.handleApplication}
        handleDownloadZip={props.handleDownloadZip}
        handleDownloadPDF={props.handleDownloadPDF}
        setShowStudentApplyed={setShowStudentApplyed}
      />
    </>
  );
}

function ModalStudentsApplyedForThesis(props) {
  const applicationsFiltered = props.applications.filter(
    (appl) => props.title === appl.thesis_title
  );
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      contentClassName="modal-custom-student-apply"
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          <span
            style={{
              fontWeight: "400",
              fontSize: 25,
            }}
          >
            {props.title}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Row>
          <Col xs={12} md={12} lg={12} xl={12}>
            {applicationsFiltered.map((application, i) => {
              return (
                <StudentApplicationThesis
                  key={i}
                  application={application}
                  isMobile={props.isMobile}
                  handleApplication={props.handleApplication}
                  handleDownloadZip={props.handleDownloadZip}
                  handleDownloadPDF={props.handleDownloadPDF}
                  setShowStudentApplyed={props.setShowStudentApplyed}
                  applicationsFiltered={applicationsFiltered}
                />
              );
            })}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

function StudentApplicationThesis(props) {
  const [show, setShow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState("");
  const [studentId, setStudentId] = useState("");
  const [thesisId, setThesisId] = useState("");
  const [hoveredRow, setHoveredRow] = useState(undefined);
  const [showCv, setShowCv] = useState(false);

  function formatDate(dateString) {
    let date = new Date(dateString);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return `${month}/${day}/${year} ${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;
  }
  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };

  const handleRowHover = (index) => {
    setHoveredRow(index);
  };

  function handleConfirmation(studentId, thesisId, action) {
    setStudentId(studentId);
    setThesisId(thesisId);
    setAction(action);
    setShowConfirmation(true);
  }

  function confirmAction() {
    props.handleApplication(studentId, thesisId, action);
    setShowConfirmation(false);
    if (props.applicationsFiltered.length === 0)
      props.setShowStudentApplyed(false);
  }

  return (
    <>
      <Row
        className="m-2 p-2"
        style={{ borderRadius: "20px", background: "#f3f3f3" }}
      >
        <Col style={{ fontWeight: "600" }}>
          <span
            className="title-custom-proposals"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowCv(true);
            }}
          >
            {props.application.student_name}
          </span>
        </Col>
        {!props.isMobile && <Col>{props.application.student_id}</Col>}
        {!props.isMobile && (
          <Col>{formatDate(props.application.application_date)}</Col>
        )}
        <Col className="text-end">
          {props.application.files && props.application.files.length > 0 && (
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-top">See application files</Tooltip>
              }
            >
              <Button
                variant="light"
                onClick={handleShow}
                className="file-button-appl"
                color="black"
              >
                <FolderFill size={30} />
              </Button>
            </OverlayTrigger>
          )}
        </Col>
        <Col className="text-end">
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-top">Accept application</Tooltip>}
          >
            <Button
              variant="light"
              className="accept-button-appl"
              onClick={() =>
                handleConfirmation(
                  props.application.student_id,
                  props.application.thesis_id,
                  "Accepted"
                )
              }
            >
              <Check size={25} />
            </Button>
          </OverlayTrigger>
        </Col>
        <Col className="text-end">
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-top">Reject application</Tooltip>}
          >
            <Button
              variant="light"
              className="reject-button-appl"
              onClick={() =>
                handleConfirmation(
                  props.application.student_id,
                  props.application.thesis_id,
                  "Rejected"
                )
              }
            >
              <X size={25} />
            </Button>
          </OverlayTrigger>
        </Col>
      </Row>
      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Application files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <div style={{ marginRight: "1rem" }}>
              <Table hover>
                <tbody>
                  {props.application.files.map((element, index) => {
                    return (
                      <tr
                        key={index}
                        onMouseEnter={() => handleRowHover(index)}
                        onMouseLeave={() => handleRowHover(undefined)}
                      >
                        <td>
                          {hoveredRow === index ? (
                            <FileEarmarkPdfFill />
                          ) : (
                            <FileEarmarkPdf />
                          )}{" "}
                          {element}
                        </td>
                        <td>
                          <Button
                            className="button-style"
                            onClick={() =>
                              props.handleDownloadPDF(
                                props.application.student_id,
                                props.application.thesis_id,
                                element
                              )
                            }
                          >
                            <Download size={20} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="button-style-cancel" onClick={handleClose}>
            Close
          </Button>
          <OverlayTrigger
            overlay={<Tooltip id="tooltip-top">Download zip folder</Tooltip>}
          >
            <Button
              className="button-style"
              onClick={() =>
                props.handleDownloadZip(
                  props.application.student_id,
                  props.application.thesis_id
                )
              }
            >
              Download all
            </Button>
          </OverlayTrigger>
        </Modal.Footer>
      </Modal>
      <ConfirmationModal
        show={showConfirmation}
        handleClose={() => setShowConfirmation(false)}
        handleAction={confirmAction}
        action={action}
        body={`Are you sure you want to ${
          action === "Accepted" ? "accept" : "reject"
        } this application?`}
      />
      <Cv
        show={showCv}
        onHide={() => setShowCv(false)}
        studentID={props.application.student_id}
      />
    </>
  );
}

export default Applications;
