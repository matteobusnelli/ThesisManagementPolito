/* import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Container, Toast, ToastContainer } from "react-bootstrap";
import 'react-toastify/dist/ReactToastify.css';

const Toasts = (props) => {
  
  useEffect(() => {
    debugger;
    if (type === "success") {
      toast.success(message, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: onClose,
      });
    } else if (type === "error") {
      toast.error(message, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: onClose,
      });
    }
  }, [message, type]); */
 /*  return(
  <>
  <ToastContainer className='below-nav' position='top-center'>
            <Toast  show={message !== '' && type==='error'} onClose={() => {setMessage(''); setType('')}} delay={4000} autohide={true} bg='danger'>
              <Toast.Body >{message}</Toast.Body>
            </Toast>
            <Toast  show={message !== '' && type==='success'} onClose={() => {setMessage(''); setType('')}} delay={4000} autohide={true} bg='success'>
              <Toast.Body >{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    </>
  )
};

export default Toasts;
 */ 