import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import API from "../API";
import MessageContext from "../messageCtx";
import { useContext } from "react";
import { ToastContainer, toast } from 'react-toastify';
function NewExternalCoSupervisorForm(props) {
  const { handleToast } = useContext(MessageContext)
  const [coSupervisor, setCoSupervisor] = useState({
    email: "",
    name: "",
    surname: "",
  });

  const [errors, setErrors] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCoSupervisor({
      ...coSupervisor,
      [name]: value,
    });
  };

  const handleAddCoSupervisor = async () => {
    await API.newExternalCosupervisor(coSupervisor)
      .then((response) => {
        setErrors(null);
        handleToast("External co-supervisor created correctly", "success");
        props.fetchData();
      }
      )
      .catch((error) => {
        console.log(error)
        setErrors(error?.errors?.errors)
        Object.values(error.errors.errors).forEach((error, index) => {
          let msg = 'Insert a value'
          if (error.path === 'email' && coSupervisor.email != "") {
            msg = error.msg
          }
          let errorMessage = error.path + ': ' + msg
          toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 10000, // Adjust as needed
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

        })
      });
  };

  return (
    <Form>
  <Form.Group controlId="email">
    <Form.Label style={{ marginTop: '0.5rem', marginBottom: 0  }}>Email</Form.Label>
    <Form.Control
      type="email"
      placeholder="Enter email"
      name="email"
      value={coSupervisor.email}
      onChange={handleChange}
      style={
        errors &&
        errors.some(error => error?.path?.includes('email')) ?
        { borderColor: 'red' } :
        {}
      }
    />
  </Form.Group>

  <Form.Group controlId="surName">
    <Form.Label style={{ marginTop: '0.5rem', marginBottom: 0 }}>Surname</Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter surname"
      name="surname"
      value={coSupervisor.surname}
      onChange={handleChange}
      style={
        errors &&
        errors.some(error => error?.path?.includes('surname')) ?
        { borderColor: 'red'} :
        {}
      }
    />
  </Form.Group>

  <Form.Group controlId="name">
    <Form.Label style={{ marginTop: '0.5rem', marginBottom: 0  }}>Name</Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter name"
      name="name"
      value={coSupervisor.name}
      onChange={handleChange}
      style={
        errors &&
        errors.some(error => error?.path?.includes('name')) ?
        { borderColor: 'red' } :
        {}
      }
    />
  </Form.Group>

  <div className="d-flex justify-content-end mt-3"> {/* Flex container */}
    <Button className="button-style" onClick={() => {handleAddCoSupervisor(); props.onClose()}}>
      Add
    </Button>
  </div>
</Form>
  );
}

export default NewExternalCoSupervisorForm;
