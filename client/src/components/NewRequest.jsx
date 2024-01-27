import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import API from "../API";
import Loading from "./Loading";
import { Chips2 } from "./ChipsInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MessageContext from "../messageCtx";
import { useNavigate } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";

function NewRequest(props) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "Next-Gen Embedded Systems Design",
    description:
      "This research will explore innovative strategies at the intersection of computer science and electronic engineering, with a focus on optimizing hardware-software integration, real-time processing, and energy efficiency. I believe this project presents a unique opportunity to contribute to advancements in embedded systems, and I'm enthusiastic about the prospect of delving into contemporary challenges and contributing to technological innovation in engineering.",
    supervisor_id: "",
    cosupervisors_internal: [],
  });

  const [errors, setErrors] = useState(null);

  const [supervisors, setSupervisors] = useState([]);
  const [cosupervisors_internal, setCoSupervisorInternal] = useState([]);
  const [cosupervisors_internal_obj, setCoSupervisorInternal_obj] = useState(
    []
  );

  const { handleToast } = useContext(MessageContext);

  const titleRef = useRef(null);
  const supervisorRef = useRef(null);

  const fetchData = async () => {
    try {
      let in_cosup = await API.getTeachers();
      setCoSupervisorInternal_obj(in_cosup);
      const formatted_in_cosup = in_cosup.map(
        ({ name, surname }) => `${name} ${surname}`
      );
      setCoSupervisorInternal(formatted_in_cosup);
      setSupervisors(formatted_in_cosup);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!props.loggedIn || props.user.user_type !== "STUD") {
      return API.redirectToLogin();
    }

    props.setLoading(true);
    fetchData();
    props.setLoading(false);
  }, [props.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    setCoSupervisorInternal(
      supervisors.filter((teacher) => teacher !== formData.supervisor_id)
    );
    setFormData({
      ...formData,
      cosupervisors_internal: formData.cosupervisors_internal.filter(
        (teacher) => teacher !== formData.supervisor_id
      ),
    });
  }, [formData.supervisor_id]);

  const updateChips = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  function createMessage(path, msg) {
    let errorMessage;
    let id = 0;
    if (path.includes("supervisor")) {
      path = "Supervisor ID";
      msg = "Invalid value";
      errorMessage = path + ": " + msg;
      id = 2;
    } else if (path.includes("title")) {
      path = "Thesis title";
      msg = "Insert a value";
      errorMessage = path + ": " + msg;
      if (!id) id = 1;
    } else {
      errorMessage = `${path ? path + ":" : ""} ${msg}`;
    }
    return { errorMessage, id };
  }

  const scrollToRef = (ref) => {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleRef = (id) => {
    switch (id) {
      case 1:
        scrollToRef(titleRef);
        break;
      case 2:
        scrollToRef(supervisorRef);
        break;
      default:
        break;
    }
    return;
  };

  function findIDs(externalNames, objList) {
    const ids = [];
    externalNames &&
      externalNames.forEach((name) => {
        let separatedStrings = name.split(" ");
        let firstName = separatedStrings.slice(0, -1).join(" ");
        let lastName = separatedStrings[separatedStrings.length - 1];

        const foundObj = objList.find(
          (obj) => obj.name === firstName && obj.surname === lastName
        );
        if (foundObj) {
          ids.push(foundObj.id);
        } else {
          ids.push(null);
        }
      });
    return ids;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cosupervisorInternalIDs = findIDs(
      formData.cosupervisors_internal,
      cosupervisors_internal_obj
    );

    const supervisor = findIDs(
      [formData.supervisor_id],
      cosupervisors_internal_obj
    )[0];
    console.log("supervisor", supervisor);
    const newProp = {
      ...formData,
      supervisor_id: supervisor,
      cosupervisors_internal: cosupervisorInternalIDs,
    };
    debugger;
    try {
      const response = await API.newRequest(newProp);
      console.log(newProp);
      handleToast("New request created", "success");
      props.setHasAlreadyRequests(true);
      navigate("/studproposals");
    } catch (error) {
      console.log(error);
      if (error.error) {
        const parts = error.error?.split(":");
        if (parts[0] && parts[1]) {
          let { message, id } = createMessage(parts[0], parts[1]);
          message = parts[0] + ": " + parts[1];
          setErrors([
            {
              type: "field",
              value: "",
              msg: parts[1],
              path: parts[0],
              location: "body",
            },
          ]);
          handleToast(message, "error");
          handleRef(id);
        }
      } else if (error.errors) {
        console.log(error.errors.errors);
        let id_min = 10;
        setErrors(error.errors.errors);
        Object.values(error.errors.errors).forEach((error, index) => {
          let { errorMessage, id } = createMessage(error.path, error.msg);
          if (id < id_min) {
            id_min = id;
          }
          toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });
        handleRef(id_min);
      } else handleToast(error.msg ? error.msg : "Unexpected error", "error");
    }
  };

  return (
    <>
      {props.loading ? <Loading /> : ""}
      <Container>
        <Row>
          <Col
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card
              className="my-3"
              style={{ maxWidth: "1000px", margin: "0 auto" }}
            >
              <Card.Header className="fs-4">
                Create a new thesis request
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3" ref={titleRef}>
                    <Form.Label htmlFor="title">Title</Form.Label>
                    <Form.Control
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      placeholder="Title"
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) => error?.path?.includes("title"))
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="description">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      id="description"
                      name="description"
                      value={formData.description}
                      placeholder="Description"
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) =>
                          error?.path?.includes("description")
                        )
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Label htmlFor="supervisor">Supervisor</Form.Label>
                  <Form.Group className="mb-3">
                    <Form.Select
                      id="supervisor_id"
                      name="supervisor_id"
                      value={formData.supervisor_id}
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) =>
                          error?.path?.includes("supervisor")
                        )
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    >
                      <option>Select a thesis supervisor</option>
                      {supervisors.map((teacher, index) => (
                        <option key={index} value={teacher}>
                          {teacher}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="cosupervisors_internal">
                      Internal Co-supervisors
                    </Form.Label>
                    <Chips2
                      items={cosupervisors_internal}
                      selectedItems={formData.cosupervisors_internal}
                      setItems={setCoSupervisorInternal}
                      setSelectedItems={(value) =>
                        updateChips("cosupervisors_internal", value)
                      }
                    />
                    <SearchDropdown
                      placeholder={""}
                      items={cosupervisors_internal}
                      setItems={setCoSupervisorInternal}
                      selectedItems={formData.cosupervisors_internal}
                      setSelectedItems={(value) =>
                        updateChips("cosupervisors_internal", value)
                      }
                    />
                  </Form.Group>
                  <ToastContainer />
                  <Row className="justify-content-end">
                    <Col xs="auto">
                      <Button
                        className="button-style"
                        type="button"
                        onClick={handleSubmit}
                      >
                        Create
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewRequest;
