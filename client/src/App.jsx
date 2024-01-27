import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NewProposal from "./components/NewProposal";
import ThesisPage from "./components/ThesisPage";
import { toast } from "react-toastify";
import "./style.css";
import { Button, Container } from "react-bootstrap";
import Header from "./components/Header";
import API from "./API";
import VirtualClock from "./components/VirtualClock";
import MessageContext from "./messageCtx";
import Applications from "./components/Applications";
import SearchProposalRoute from "./components/SearchProposal";
import ProfessorActiveProposals from "./components/ProfessorActiveProposals";
import StudentApplications from "./components/StudentApplications";
import ViewProposal from "./components/ViewProposal";
import Home from "./components/Home";
import RequestsPage from "./components/Request";
import StudentRequests from "./components/StudentRequests";
import NewRequest from "./components/NewRequest";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [virtualClock, setVirtualClock] = useState(
    JSON.parse(localStorage.getItem("virtualclock"))
      ? new Date(JSON.parse(localStorage.getItem("virtualclock")))
      : new Date()
  );
  const [error, setError] = useState("");
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [hasAlreadyRequests, setHasAlreadyRequests] = useState(false);

  // If an error occurs, the error message will be shown in a toast.
  const handleToast = (err, type) => {
    console.log(err);
    let msg = "";
    if (err.error) msg = err.error;
    else if (typeof err === "string") msg = String(err);
    else msg = "Unknown Error";

    if (type === "success") {
      toast.success(msg, {
        //position: toast.POSITION.RIGHT,
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (type === "error") {
      toast.error(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (type === "warning") {
      toast.warning(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();
        setLoading(false);
        setLoggedIn(true);
        setUser(user);
        if (user && user.user_type === "STUD") {
          let alreadyApply = await API.isApplied();
          setIsAlreadyApplied(alreadyApply);

          let alreadyRequest = await API.hasAlreadyReuests();
          setHasAlreadyRequests(alreadyRequest);
        }
      } catch (err) {
        if (error.response && error.response.status !== 401) {
          console.log(err);
          setError(true);
        }
      }
    };
    checkAuth();
  }, []);

  const logOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
  };

  return (
    <BrowserRouter>
      <MessageContext.Provider value={{ handleToast }}>
        <div className="wrapper">
          <Header
            user={user}
            logout={logOut}
            hasAlreadyRequests={hasAlreadyRequests}
          />
          <ToastContainer />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route
              path="/virtualclock"
              element={
                <VirtualClock
                  virtualClock={virtualClock}
                  setVirtualClock={setVirtualClock}
                />
              }
            />
            <Route
              path="/profproposals"
              element={
                <ProfessorActiveProposals
                  loading={loading}
                  setLoading={setLoading}
                  error={error}
                  setError={setError}
                  virtualClock={virtualClock}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/studproposals"
              element={
                <SearchProposalRoute
                  loading={loading}
                  setLoading={setLoading}
                  error={error}
                  setError={setError}
                  virtualClock={virtualClock}
                  loggedIn={loggedIn}
                  user={user}
                  isAlreadyApplied={isAlreadyApplied}
                  setIsAlreadyApplied={setIsAlreadyApplied}
                />
              }
            />
            <Route
              path="/newproposal"
              element={
                <NewProposal
                  loading={loading}
                  virtualClock={virtualClock}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/copyproposal/:idCopy"
              element={
                <NewProposal
                  loading={loading}
                  virtualClock={virtualClock}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/updateproposal/:idUpd"
              element={
                <NewProposal
                  loading={loading}
                  virtualClock={virtualClock}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/viewproposal/:idView"
              element={
                <ViewProposal
                  loading={loading}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/applications"
              element={
                <Applications
                  loading={loading}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/proposals/:id"
              element={
                <ThesisPage
                  loading={loading}
                  virtualClock={virtualClock}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/studentapplications"
              element={
                <StudentApplications
                  loading={loading}
                  setLoading={setLoading}
                  virtualClock={virtualClock}
                  loggedIn={loggedIn}
                  user={user}
                  isAlreadyApplied={isAlreadyApplied}
                  setIsAlreadyApplied={setIsAlreadyApplied}
                />
              }
            />
            <Route
              path="/requests"
              element={
                <RequestsPage
                  loading={loading}
                  setLoading={setLoading}
                  virtualClock={virtualClock}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/secrrequests"
              element={
                <RequestsPage
                  loading={loading}
                  setLoading={setLoading}
                  virtualClock={virtualClock}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            />
            <Route
              path="/studentrequests"
              element={
                <StudentRequests
                  loading={loading}
                  setLoading={setLoading}
                  virtualClock={virtualClock}
                  loggedIn={loggedIn}
                  user={user}
                />
              }
            ></Route>
            <Route
              path="/newrequest"
              element={
                <NewRequest
                  loading={loading}
                  virtualClock={virtualClock}
                  setLoading={setLoading}
                  loggedIn={loggedIn}
                  user={user}
                  setHasAlreadyRequests={setHasAlreadyRequests}
                />
              }
            />
            {/*Leave DefaultRoute as last route */}
            <Route path="/*" element={<DefaultRoute />} />
          </Routes>
        </div>
      </MessageContext.Provider>
    </BrowserRouter>
  );
}

function DefaultRoute() {
  return (
    <Container className="App">
      <h1>Page not found...</h1>
      <Link to="/">
        <Button variant="light" className="button-style fs-5">
          Please go back to home page
        </Button>
      </Link>
    </Container>
  );
}

export default App;
