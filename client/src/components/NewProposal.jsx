import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Modal,
} from "react-bootstrap";
import API from "../API";
import Loading from "./Loading";
import { Chips2 } from "./ChipsInput";
import NewExternalCoSupervisor from "./NewExternalCosupervisor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToggleComponent from "./Toggle";
import dayjs from "dayjs";
import MessageContext from "../messageCtx";
import { useNavigate, useParams } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";
import { PersonAdd, PersonFillAdd } from "react-bootstrap-icons";
import { HoverIconButton } from "./HoverIconButton";

function NewProposal(props) {
  const navigate = useNavigate();
  const { idCopy, idUpd } = useParams();

  const [formData, setFormData] = useState({
    title: "Data Analysis of Rector Elections",
    description:
      "The thesis aims to investigate and analyze the patterns, trends, and influential factors surrounding the process of electing university rectors. This study employs advanced data analysis techniques to examine voting behaviors, candidate profiles, and electoral outcomes. By delving into historical election data, the research seeks to identify any correlations between candidate characteristics, campaign strategies, and electoral success. Additionally, the study explores the impact of external factors, such as socio-economic conditions and institutional dynamics, on the election results. The findings of this research endeavor to provide valuable insights for university administrations, policymakers, and stakeholders, contributing to a deeper understanding of the complexities inherent in rector elections and potentially informing strategies for enhancing the democratic processes within academic institutions.",
    supervisor_id: "",
    cosupervisors_internal: [],
    cosupervisors_external: [],
    thesis_level: "Master",
    keywords: ["DATA ANALYSIS", "ELECTIONS"],
    type_name: "Sperimental",
    cod_group: "",
    required_knowledge:
      "The ideal candidate should possess a strong foundation in statistical analysis and data science, proficiency in programming languages like Python or R, and a deep understanding of election dynamics. Familiarity with database management, survey methodologies, and academic governance structures is crucial.",
    notes:
      "Candidates with prior experience in analyzing electoral data, especially in the context of academic institutions, will be prioritized. Strong communication skills and the ability to present complex findings in a comprehensible manner are essential. The research may involve collaboration with election committees, requiring a diplomatic and cooperative approach.",
    expiration: "",
    cod_degree: "DEGR01",
    is_archived: 0,
  });

  const [keywords_input, setKeywordsInput] = useState("");

  const [errors, setErrors] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [cosupervisors_internal, setCoSupervisorInternal] = useState([]);
  const [cosupervisors_internal_obj, setCoSupervisorInternal_obj] = useState(
    []
  );
  const [cosupervisors_external, setCoSupervisorExternal] = useState([]);
  const [cosupervisors_external_obj, setCoSupervisorExternal_obj] = useState(
    []
  );

  const [groups_obj, setGroups_obj] = useState([]);

  const [keywords, setKeywords] = useState([]);
  const [teacher, setTeacher] = useState({});
  const [degrees, setDegrees] = useState([]);

  const { handleToast } = useContext(MessageContext);

  const titleRef = useRef(null);
  const supervisorRef = useRef(null);
  const levelRef = useRef(null);
  const groupRef = useRef(null);
  const typeRef = useRef(null);
  const expirationRef = useRef(null);
  const degreeRef = useRef(null);

  const fetchData = async () => {
    try {
      let sup_email = props.user.username;

      let ex_cosup = await API.getListExternalCosupervisors();
      let in_cosup = await API.getTeachers();

      let degrees = await API.getDegrees();
      let groups = await API.getGroups();
      let sup = in_cosup.filter((item) => item.email === sup_email);
      in_cosup = in_cosup.filter((item) => item.email !== sup_email);
      setCoSupervisorExternal_obj(ex_cosup);
      setCoSupervisorInternal_obj(in_cosup);

      setTeacher(sup[0]);
      setDegrees(degrees);
      setGroups_obj(groups);
      /* if ((!idUpd && !idCopy)) { */
      const formatted_ex_cosup = ex_cosup.map(
        ({ name, surname }) => `${name} ${surname}`
      );
      const formatted_in_cosup = in_cosup.map(
        ({ name, surname }) => `${name} ${surname}`
      );

      setCoSupervisorExternal(formatted_ex_cosup);
      setCoSupervisorInternal(formatted_in_cosup);
      /* } */
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchThesis = async (thesisId) => {
    try {
      let response = await API.getThesisForProfessorById(thesisId);
      console.log(response);

      let in_cosup = await API.getTeachers();
      in_cosup = in_cosup.filter(
        (teacher) => teacher.id !== response.supervisor_id
      );
      let ex_cosup = await API.getListExternalCosupervisors();

      const formatted_ex_cosup = ex_cosup.map(
        ({ name, surname }) => `${name} ${surname}`
      );
      const formatted_in_cosup = in_cosup.map(
        ({ name, surname }) => `${name} ${surname}`
      );

      in_cosup = in_cosup.filter((item) => {
        return response.cosupervisors_internal.some((ci) => ci === item.id);
      });

      in_cosup = in_cosup.map(({ name, surname }) => `${name} ${surname}`);

      ex_cosup = ex_cosup.filter((item) => {
        return response.cosupervisors_external.some((ci) => ci === item.email);
      });

      ex_cosup = ex_cosup.map(({ name, surname }) => `${name} ${surname}`);

      if (formatted_in_cosup.length > 0) {
        let c_in = [...formatted_in_cosup];
        c_in = c_in.filter((c) => !in_cosup.includes(c));
        setCoSupervisorInternal(c_in);
      } else {
        setCoSupervisorInternal([]);
      }

      if (formatted_ex_cosup.length) {
        let c_out = [...formatted_ex_cosup];
        c_out = c_out.filter((c) => !ex_cosup.includes(c));
        setCoSupervisorExternal(c_out);
      } else {
        setCoSupervisorExternal([]);
      }

      response = {
        ...response,
        cosupervisors_internal: in_cosup,
        cosupervisors_external: ex_cosup,
      };

      setFormData(response);
    } catch (err) {
      handleToast("Error while fetching Thesis", "error");
    }
  };

  useEffect(() => {
    if (!props.loggedIn || props.user.user_type !== "PROF") {
      return API.redirectToLogin();
    }
    const fetchDataAndThesis = async () => {
      props.setLoading(true);
      await fetchData();
      if (idCopy || idUpd) {
        await fetchThesis(idCopy || idUpd);
      }
      props.setLoading(false);
    };

    fetchDataAndThesis();
  }, [idCopy, idUpd]);

  const handleChange = (e) => {
    const { id, name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: id === "is_archived" ? checked : value,
    });
  };

  function handleChangeDate(event) {
    const { name, value } = event.target;
    const today = props.virtualClock;
    const selectedDate = dayjs(value);
    if (selectedDate.isBefore(dayjs(today))) {
      handleToast("Please select a date in the future", "error");
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const addChip = (field, value) => {
    if (!formData[field].includes(value)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value],
      });
    }
    setKeywordsInput("");
  };

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
      path = "Thesis level";
      msg = "Insert a value";
      errorMessage = path + ": " + msg;
      if (!id) id = 1;
    } else if (path.includes("level")) {
      path = "Thesis level";
      msg = "Insert a value";
      errorMessage = path + ": " + msg;
      if (!id) id = 3;
    } else if (path.includes("type")) {
      path = "Type";
      msg = "Insert a value";
      errorMessage = path + ": " + msg;
      if (!id) id = 4;
    } else if (path.includes("group")) {
      path = "Group";
      msg = "Insert a valid value";
      errorMessage = path + ": " + msg;
      if (!id) id = 4;
    } else if (path.includes("expiration")) {
      path = "Expiration date";
      msg = "The date is required";
      errorMessage = path + ": " + msg;
      if (!id) id = 5;
    } else if (path.includes("degree")) {
      path = "degree";
      msg = "Insert a value";
      errorMessage = path + ": " + msg;
      if (!id) id = 6;
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
      case 3:
        scrollToRef(levelRef);
        break;
      case 4:
        scrollToRef(typeRef);
        break;
      case 5:
        scrollToRef(expirationRef);
        break;
      case 6:
        scrollToRef(degreeRef);
        break;
      default:
        break;
    }
    return;
  };

  function findEmails(externalNames, objList) {
    const emails = [];
    externalNames &&
      externalNames.forEach((name) => {
        const [firstName, lastName] = name.split(" ");
        const foundObj = objList.find(
          (obj) => obj.name === firstName && obj.surname === lastName
        );
        if (foundObj) {
          emails.push(foundObj.email);
        } else {
          emails.push(null);
        }
      });
    return emails;
  }

  function findIDs(externalNames, objList) {
    const ids = [];
    externalNames &&
      externalNames.forEach((name) => {
        const [firstName, lastName] = name.split(" ");
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

    const cosupervisorExternalEmails = findEmails(
      formData.cosupervisors_external,
      cosupervisors_external_obj
    );
    const cosupervisorInternalIDs = findIDs(
      formData.cosupervisors_internal,
      cosupervisors_internal_obj
    );

    const newProp = {
      ...formData,
      supervisor_id: teacher.id,
      cosupervisors_internal: cosupervisorInternalIDs,
      cosupervisors_external: cosupervisorExternalEmails,
      keywords: formData.keywords.join(", "),
      cod_group: teacher.cod_group,
    };

    try {
      if (!idUpd) {
        const response = await API.newProposal(newProp);
        handleToast("New proposal created", "success");
      } else {
        //API UPDATE
        console.log("newProp", newProp);
        const response = await API.updateProposal(newProp, idUpd);
        handleToast("Proposal updated", "success");
      }

      navigate("/profproposals");
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
                {idUpd ? "Update proposal" : "Create a new thesis proposal"}
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
                  <Form.Label htmlFor="description">Supervisor</Form.Label>
                  <Form.Group className="mb-3">
                    <Form.Control
                      id="supervisor"
                      type="text"
                      style={{ marginTop: "0.5em" }}
                      value={teacher && `${teacher.name} ${teacher.surname}`}
                      disabled
                    />
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
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="cosupervisors_external">
                      External Co-supervisors
                    </Form.Label>
                    <Chips2
                      items={cosupervisors_external}
                      selectedItems={formData.cosupervisors_external}
                      setItems={setCoSupervisorExternal}
                      setSelectedItems={(value) =>
                        updateChips("cosupervisors_external", value)
                      }
                    />
                    <Row className="d-flex align-items-center">
                      <Col xs={10}>
                        <SearchDropdown
                          placeholder={""}
                          items={cosupervisors_external}
                          setItems={setCoSupervisorExternal}
                          selectedItems={formData.cosupervisors_external}
                          setSelectedItems={(value) =>
                            updateChips("cosupervisors_external", value)
                          }
                        />
                      </Col>
                      <Col xs={2}>
                        <HoverIconButton
                          defaultIcon={PersonAdd}
                          hoverIcon={PersonFillAdd}
                          className={"button-style-person"}
                          onClick={() => setShowForm(true)}
                        />
                      </Col>
                    </Row>
                    <Modal show={showForm} onHide={() => setShowForm(false)}>
                      <Modal.Header closeButton>
                        <Modal.Title>
                          Add a new external co-supervisor
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body style={{ paddingTop: 0 }}>
                        <NewExternalCoSupervisor
                          fetchData={fetchData}
                          onClose={() => setShowForm(false)}
                        />
                      </Modal.Body>
                    </Modal>
                  </Form.Group>
                  <Form.Group className="mb-3" ref={levelRef}>
                    <Form.Label htmlFor="thesis_level">Thesis level</Form.Label>
                    <Form.Select
                      id="thesis_level"
                      name="thesis_level"
                      value={formData.thesis_level}
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) => error?.path?.includes("level"))
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    >
                      <option>Select a thesis level</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="keywords">Keywords</Form.Label>
                    <Chips2
                      items={keywords}
                      selectedItems={formData.keywords}
                      setItems={setKeywords}
                      setSelectedItems={(value) =>
                        updateChips("keywords", value)
                      }
                    />
                    <Form.Control
                      id="keywords"
                      type="text"
                      style={{ marginTop: "0.5em" }}
                      placeholder="Enter a keyword and press enter"
                      autoComplete="off"
                      value={keywords_input}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent the default form submission behavior
                          addChip("keywords", e.target.value);
                        }
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" ref={typeRef}>
                    <Form.Label htmlFor="type_name">Type</Form.Label>
                    <Form.Control
                      type="text"
                      id="type_name"
                      name="type_name"
                      value={formData.type_name}
                      placeholder="Type"
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) => error?.path?.includes("type"))
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" ref={groupRef}>
                    <Form.Label htmlFor="cod_group">Group</Form.Label>
                    <Form.Control
                      id="cod_group"
                      type="text"
                      style={{ marginTop: "0.5em" }}
                      value={
                        teacher &&
                        (groups_obj.find((obj) => obj.cod === teacher.cod_group)
                          ? groups_obj.find(
                              (obj) => obj.cod === teacher.cod_group
                            ).name
                          : "")
                      }
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="required_knowledge">
                      Required knowledge
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="required_knowledge"
                      name="required_knowledge"
                      value={formData.required_knowledge}
                      placeholder="Required knowledge"
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) =>
                          error?.path?.includes("required_knowledge")
                        )
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="notes">Notes</Form.Label>
                    <Form.Control
                      type="text"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      placeholder="Notes"
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) => error?.path?.includes("notes"))
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" ref={expirationRef}>
                    <Form.Label htmlFor="expiration">Expiration</Form.Label>
                    <Form.Control
                      type="date"
                      id="expiration"
                      name="expiration"
                      value={
                        formData.expiration
                          ? dayjs(formData.expiration).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={handleChangeDate}
                      style={
                        errors &&
                        errors.some((error) =>
                          error?.path?.includes("expiration")
                        )
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" ref={degreeRef}>
                    <Form.Label htmlFor="cod_degree">Degree</Form.Label>
                    <Form.Select
                      id="cod_degree"
                      name="cod_degree"
                      value={formData.cod_degree}
                      onChange={handleChange}
                      style={
                        errors &&
                        errors.some((error) => error?.path?.includes("degree"))
                          ? { borderColor: "red" }
                          : {}
                      }
                      required
                    >
                      <option>Select a degree</option>
                      {degrees.map((degree, index) => (
                        <option
                          key={index}
                          value={degree.cod}
                          className="list-group-item"
                        >
                          {degree.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <span style={{ fontSize: 18 }}>
                          Insert this thesis as archived
                        </span>
                      </Col>
                      <Col xs="auto" className="d-flex align-items-center">
                        {/* Add d-flex and align-items-center to vertically align the Toggle */}
                        <ToggleComponent
                          formData={formData}
                          handleChange={handleChange}
                        />
                      </Col>
                    </Row>
                  </Form.Group>
                  <ToastContainer />
                  <Row className="justify-content-end">
                    <Col xs="auto">
                      <Button
                        className="button-style"
                        type="button"
                        onClick={handleSubmit}
                      >
                        {idUpd ? "Confirm Update" : "Create"}
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

export default NewProposal;
