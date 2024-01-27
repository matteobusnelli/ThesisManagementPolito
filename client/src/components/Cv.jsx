import { useContext, useEffect, useState } from "react";
import MessageContext from "../messageCtx";
import API from "../API";
import Loading from "./Loading";
import { Col, Modal, Row } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import dayjs from "dayjs";
import PerfectScrollbar from "react-perfect-scrollbar";

function Cv(props) {
  const { show, onHide, studentID } = props;
  const { handleToast } = useContext(MessageContext);
  const [student, setStudent] = useState({});
  const [cv, setCv] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1000 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCV = async (studentID) => {
      try {
        let cv = await API.getStudentCv(studentID);
        let student = await API.getStudent(studentID);
        setCv(cv);
        setStudent(student[0]);
        setIsLoading(false);
        console.log("cv", JSON.stringify(cv));
        console.log("student", JSON.stringify(student));
      } catch (error) {
        handleToast("Error fetching CV");
      }
    };
    getCV(studentID);
  }, [studentID]);

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Modal
        size="lg"
        show={show}
        onHide={onHide}
        contentClassName="modal-custom-student-cv"
      >
        <Modal.Body className="p-3">
          <Row>
            <Col xs={6}>
              <h4
                style={{
                  marginRight: "0.3em",
                  fontWeight: 600,
                  padding: 0,
                  width: "fit-content",
                }}
              >
                {student.name + " " + student.surname}
              </h4>
              <h4 style={{ fontWeight: 400, width: "fit-content" }}>
                {studentID}
              </h4>
            </Col>
            <Col xs={6} style={{ fontSize: isMobile ? 15 : 18 }}>
              <Row className="d-flex" style={{ justifyContent: "flex-end" }}>
                <span style={{ width: "fit-content" }}>{"degree: "}</span>
                <span style={{ fontWeight: 500, width: "fit-content" }}>
                  {student.cod_degree}
                </span>
              </Row>
              <Row className="d-flex" style={{ justifyContent: "flex-end" }}>
                <span style={{ width: "fit-content" }}>
                  {"enrolled from : "}
                </span>
                <span style={{ fontWeight: 500, width: "fit-content" }}>
                  {student.enrollment_year}
                </span>
              </Row>
            </Col>
          </Row>
          <Row
            style={{ fontWeight: 500, marginBottom: "0.5em", marginTop: "2em" }}
          >
            <Col xs={2}>Code</Col>
            <Col xs={6} md={6} lg={4} xl={4} xxl={4}>
              Title
            </Col>
            <Col xs={2}>CFU</Col>
            <Col xs={2}>Grade</Col>
            {!isMobile && !isTablet && <Col xs={2}>Date</Col>}
          </Row>
          <PerfectScrollbar
            options={{ wheelPropagation: false, suppressScrollX: true }}
            style={{ maxHeight: isMobile ? 450 : 580, overflowY: "auto" }}
          >
            {cv.map((line, index) => {
              return (
                <>
                  <Row
                    className="my-2"
                    key={index}
                    style={{
                      backgroundColor: index % 2 == 0 ? "#f5f3f4" : "#ffffff",
                      borderRadius: "20px",
                    }}
                  >
                    <Col xs={2}>{line.cod_course}</Col>
                    <Col xs={6} md={6} lg={4} xl={4} xxl={4}>
                      {line.title_course}
                    </Col>
                    <Col xs={2}>{line.cfu}</Col>
                    <Col xs={2}>{line.grade}</Col>
                    {!isMobile && !isTablet && (
                      <Col xs={2}>
                        {dayjs(new Date(line.date)).format("DD-MM-YYYY")}
                      </Col>
                    )}
                  </Row>
                </>
              );
            })}
          </PerfectScrollbar>
        </Modal.Body>
      </Modal>
    </>
  );
}
export default Cv;
