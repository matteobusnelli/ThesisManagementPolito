import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  PlusLg,
} from "react-bootstrap-icons";
import Loading from "./Loading";
import { useMediaQuery } from "react-responsive";
import MessageContext from "../messageCtx";
import API from "../API";

function StudentRequests(props) {
  const { handleToast } = useContext(MessageContext);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();

  useEffect(() => {
    if (props.user && props.user.user_type !== "STUD") {
      return API.redirectToLogin();
    }
  }, [props.user]);

  const renderTooltipNew = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      New request
    </Tooltip>
  );
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
            My requests
          </h1>
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltipNew}
          >
            <Button variant="light" onClick={() => navigate("/newrequest/")}>
              <PlusLg style={{ fontSize: "xx-large" }} />
            </Button>
          </OverlayTrigger>
        </Col>
      </Row>
    </Container>
    </div>
)}

export default StudentRequests;
