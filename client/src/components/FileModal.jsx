import React, { useContext, useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import {
  Trash,
  FileEarmarkPdf,
  FileEarmarkPlus,
  TrashFill,
} from "react-bootstrap-icons";
import { HoverIconButton } from "./HoverIconButton";
import MessageContext from "../messageCtx";
import { ToastContainer } from "react-toastify";

function FileDropModal({
  showModal,
  closeModal,
  closeModalOnCancel,
  handleSave,
  setSelectedFiles,
  selectedFiles,
  exceed,
  setExceed
}) {
  const [wrongInput, setWrongInput] = useState(false);

  const { handleToast } = useContext(MessageContext);

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setExceed(false)
    console.log("Exceed state:", exceed);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const checkAndAdd = (files) => {
    let oldFiles = [...selectedFiles];
    files.forEach((newFile) => {
      const existingFile = oldFiles.find(
        (oldFile) => oldFile.name === newFile.name
      );
      if (!existingFile && oldFiles.length < 10) {
        oldFiles.push(newFile);
      }
      else if (oldFiles.length >= 10) {
        console.log("Exceeded file limit!");
        setExceed(true)
      }
    });

    console.log("Exceed state:", exceed);
    setSelectedFiles(oldFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setWrongInput(false);
    const droppedFiles = Array.from(e.dataTransfer.files);

    const pdfFiles = droppedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    const nonPdfFilesExist = droppedFiles.some(
      (file) => file.type !== "application/pdf"
    );

    if (nonPdfFilesExist) setWrongInput(true);
    checkAndAdd(pdfFiles);
    console.log("Exceed state after drop:", exceed);
    if (exceed) {
      handleToast('You exceed the maximum file number', 'error')
    }
  };

  const handleLabelClick = (e) => {
    e.preventDefault();
    document.getElementById("fileInput").click();
  };

  const handleFileInputChange = (e) => {
    setWrongInput(false);
    const newFiles = Array.from(e.target.files);
    const pdfFiles = newFiles.filter((file) => file.type === "application/pdf");

    const nonPdfFilesExist = newFiles.some(
      (file) => file.type !== "application/pdf"
    );

    if (nonPdfFilesExist) setWrongInput(true);
    checkAndAdd(pdfFiles);
  };

  return (
    <Modal contentClassName='custom-rounded-upload' show={showModal} onHide={closeModal} style={{flex:1}}>
      <Modal.Header>
        <Modal.Title>Are you sure to apply to this thesis?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>Upload all the files that the professor could need (10 maximum)</div>
        <br></br>
        <div
          className={(wrongInput || exceed) ? "drop-area-wrong" : "drop-area"}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleLabelClick}
        >
          <label htmlFor="fileInput">
            <FileEarmarkPlus size={60} style={{ marginBottom: "8px" }} />
            {!wrongInput && !exceed && <div>Drag & Drop or Click to Select PDF Files</div>}
            {wrongInput && !exceed && (
              <div>
                {" "}
                <span className="text-wrong">Only </span>
                <span className="text-wrong-underlined">PDF</span>
                <span className="text-wrong"> files are allowed</span>{" "}
              </div>
            )}
            {!wrongInput && exceed && (
              <div>
                {" "}
                <span className="text-wrong">Only </span>
                <span className="text-wrong-underlined">10 PDF</span>
                <span className="text-wrong"> files are allowed</span>{" "}
              </div>
            )}
          </label>
        </div>
        {!exceed && <input
          type="file"
          id="fileInput"
          accept=".pdf"
          onChange={handleFileInputChange}
          multiple
          style={{ display: "none" }}
        />}
        {exceed &&
          <input
            id="fileInput"
            onClick={()=>{handleToast('You exceed the maximum file number', 'error')}}
           
            style={{ display: "none" }}
          />
        }
        <div style={{ marginTop: 5 }}>
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <FileEarmarkPdf style={{ marginRight: "0.5em" }} /> {file.name}
              <HoverIconButton
                defaultIcon={Trash}
                hoverIcon={TrashFill}
                className={"button-style-trash"}
                onClick={() => handleRemoveFile(index)}
              ></HoverIconButton>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Form>
          <Button
            className="button-style-cancel"
            variant="light"
            onClick={closeModalOnCancel}
          >
            Cancel
          </Button>
          <Button
            className="button-style"
            onClick={() => {
              handleSave();
              closeModal();
            }}
          >
            Save
          </Button>
        </Form>
      </Modal.Footer>

    </Modal>

  );
}

export default FileDropModal;
