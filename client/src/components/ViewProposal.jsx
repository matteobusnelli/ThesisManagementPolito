import { useContext, useEffect, useState } from "react";
import { Accordion, Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import API from "../API";
import MessageContext from "../messageCtx";
import { useMediaQuery } from "react-responsive";
import Loading from "./Loading";
import dayjs from "dayjs";
import { Pencil, Trash3, Archive } from "react-bootstrap-icons";
import randomColor from "randomcolor";
import ConfirmationModal from "./ConfirmationModal";

function ViewProposal(props) {
  const navigate = useNavigate();
  const { idView } = useParams();

  const [proposal, setProposal] = useState(undefined);
  const { handleToast } = useContext(MessageContext);
  const [showArchive, setShowArchive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  

  const fetchThesis = async (thesisId) => {
    try {
      const response = await API.getThesisForProfessorById(thesisId);
      const groups = await API.getGroups()
      let gr = groups.filter((g) => {
        return response.cod_group.some(
          group => group === g.cod
        )
      }
    )
    gr = gr.map(
      ({ name }) => `${name}`
    );

      const proposal = {
        ...response,
        cod_group:gr
      }
      console.log(proposal)
      setProposal(proposal);
    } catch (err) {
      handleToast("Error while fetching Thesis", "error");
    }
  };

  useEffect(() => {
    if (!props.loggedIn || props.user.user_type !== "PROF"){
      return API.redirectToLogin();
    }
    props.setLoading(true);
    if (idView) fetchThesis(idView);
    props.setLoading(false);
  }, []);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const archiveProposal = async (id) => {
    try {
      await API.updateThesisArchivation(id);
      navigate("/profproposals");
      handleToast("Proposal archived correctly", "success");
    } catch (err) {
      handleToast("Error while archiving a proposal", "error");
    }
  };

  const deleteProposal = async (id) => {
    try {
      await API.deleteProposal(id);
      navigate("/profproposals");
      handleToast("Proposal deleted correctly", "success");
    } catch (err) {
      handleToast("Error while deleting a proposal", "error");
    }
  };


  
  return props.loading || !proposal ? (
    <Loading />
  ) : (
  <>  <Container className="navbarMargin">
      <Table className="table-rounded">
        <thead>
          <tr>
            <th className="empty-col-mediumScreen"></th>
            <th colSpan="6" className="empty-col-mediumScreen title-mediumScreen">
              {proposal.title}
            </th>
          </tr>
        </thead>
        <tbody>
          {proposal.supervisor_name && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Supervisor
              </td>
              <td className="rightText">{proposal.supervisor_name}</td>
            </tr>
          )}
          {proposal.list_cosupervisors.length > 0 && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Co-Supervisors
              </td>
              <td className="rightText">
                {proposal.list_cosupervisors.join(", ")}
              </td>
            </tr>
          )}
          {/*proposal.keywords && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Keywords
              </td>
              <td className="rightText">
                {proposal.keywords.map((element, index) => (
                  <React.Fragment key={index}>
                    {index !== 0 && <span>, </span>}
                    <u>{element}</u>
                  </React.Fragment>
                ))}
              </td>
            </tr>
                )*/}
          <tr>
            <td colSpan="2" className="leftText customLeftColumn">
              Keywords
            </td>
            <td className="rightText">
              {proposal.keywords &&
                proposal.keywords.map((key, index) => (
                  <span
                    key={index}
                    className="mx-1 badge"
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
                    }}
                  >
                    {key}
                  </span>
                ))}
            </td>
          </tr>

          <tr>
            <td colSpan="2" className="leftText customLeftColumn">
              Type
            </td>
            <td className="rightText">{proposal.type_name}</td>
          </tr>
          {proposal.cod_group && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Group
              </td>
              {/* <td className="rightText">{proposal.cod_group.join(", ")}</td> */}
              <td className="rightText">{proposal.cod_group}</td>
            </tr>
          )}
          {!isMobile && proposal.description && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Description
              </td>
              <td className="rightText">{proposal.description}</td>
            </tr>
          )}
          {isMobile && proposal.description && (
            <tr>
              <td colSpan="3" className="custom-accordion-td">
                <Accordion defaultActiveKey="1">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Description</Accordion.Header>
                    <Accordion.Body>{proposal.description}</Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </td>
            </tr>
          )}
          {proposal.required_knowledge && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Required Knowledge
              </td>
              <td className="rightText">{proposal.required_knowledge}</td>
            </tr>
          )}
          {!isMobile && proposal.notes && (
            <tr>
              <td colSpan="2" className="leftText customLeftColumn">
                Notes
              </td>
              <td className="rightText">{proposal.notes}</td>
            </tr>
          )}
          {isMobile && proposal.notes && (
            <tr>
              <td colSpan="3" className="custom-accordion-td">
                <Accordion defaultActiveKey="1">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Notes</Accordion.Header>
                    <Accordion.Body>{proposal.notes}</Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="text-center table-footer">
              <Row className="justify-content-between">
                <Col>
                  <div className="table-footer">
                    <span className="bold">{proposal.thesis_level}</span>
                    <span> thesis</span>
                  </div>
                  <div className="table-footer">
                    <span>Valid until</span>
                    <span className="bold mx-1">
                      {dayjs(proposal.expiration).format("MM/DD/YYYY")}
                    </span>
                  </div>
                </Col>
                <Col
                  style={{ display: "flex", justifyContent: "right" }}
                >
                  <Button
                    variant="light"
                    className="mx-2"
                    onClick={() => {
                      navigate("/updateproposal/" + proposal.id);
                    }}
                  >
                    <span className="mx-2">Edit</span>
                    <Pencil />
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => {
                      navigate("/copyproposal/" + proposal.id);
                    }}
                  >
                    <span className="mx-2">Copy</span>
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
                  <Button
                    variant="light"
                    className="mx-2"
                    onClick={() => setShowDelete(true)}
                  >
                    <span style={{ marginRight: "5px" }}>Delete</span>
                    <Trash3 cursor="pointer"></Trash3>
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => setShowArchive(true)}
                    className="mx-2"
                  >
                    <span style={{ marginRight: "5px" }}>Archive</span>
                    <Archive cursor="pointer"></Archive>
                  </Button>
                </Col>
              </Row>
            </td>
          </tr>
        </tfoot>
      </Table>
    </Container>
  <ConfirmationModal
    show={showArchive}
    handleClose={() => setShowArchive(false)}
    body={"Are you sure you want to archive this proposal ?"}
    action={"Archive"}
    handleAction={() => archiveProposal(proposal.id)}
  />
  <ConfirmationModal
    show={showDelete}
    handleClose={() => setShowDelete(false)}
    body={"Are you sure you want to delete this proposal ?"}
    action={"Delete"}
    handleAction={() => deleteProposal(proposal.id)}
  /></>
  );
}

export default ViewProposal;
