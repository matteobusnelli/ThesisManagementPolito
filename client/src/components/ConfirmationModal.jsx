import { Button, Modal } from "react-bootstrap";

function ConfirmationModal(props) {
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.body}</Modal.Body>
      <Modal.Footer>
        <Button className="button-style-cancel" onClick={props.handleClose}>
          Cancel
        </Button>
        <Button
          className="button-style"
          onClick={() => {
            props.handleAction();
            props.handleClose();
          }}
        >
          {/*props.action*/}Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;
