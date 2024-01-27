import { Alert } from "react-bootstrap";

function ErrorAlert() {
  return (
    <Alert variant="danger" className="m-5">
      <Alert.Heading>Error!</Alert.Heading>
      <p>An unexpected error occurred, please try again.</p>
    </Alert>
  );
}

export default ErrorAlert;
