import { useEffect } from "react";
import { Container } from "react-bootstrap";
import API from "../API";

const Home = () => {
  useEffect(() => {
    API.redirectToLogin();
  }, []);

  return <Container />;
};
export default Home;
