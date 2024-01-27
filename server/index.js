"use strict";

const dotenv = require("dotenv");
dotenv.config();

const {
  isStudent,
  isProfessor,
  isLoggedIn,
  isSecretary,
  isSecretaryOrProfessor,
} = require("./controllers/middleware");
const {
  getProposals,
  getProposal,
  getProposalsProfessor,
} = require("./controllers/showThesis");
const {
  newApplication,
  getApplicationStudent,
  updateApplicationStatus,
  getApplications,
  isApplied,
  hasAlreadyRequest,
} = require("./controllers/manageApplication");
const {
  addFiles,
  getAllFiles,
  getStudentFilesList,
  getFile,
} = require("./controllers/manageFiles");
const {
  newThesis,
  updateThesesArchivationManual,
  getThesisForProfessorById,
  updateThesis,
  deleteProposal,
  newRequest,
} = require("./controllers/manageThesis");
const {
  listExternalCosupervisors,
  createExternalCosupervisor,
  getTeachersList,
  listGroups,
  listDegrees,
} = require("./controllers/others");
const {
  setVirtualClock,
  uninstallVirtualClock,
  create_schedule,
  getServerDateTime,
} = require("./controllers/virtualClock");
const {
  getRequestsForProfessor,
  getRequestsForSecretary,
  updateThesisRequest,
} = require("./controllers/thesisRequest");
const { getStudentCV, getStudent } = require("./controllers/student");

const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const { check, validationResult, body } = require("express-validator");
const dao = require("./dao");
const cors = require("cors");
const multer = require("multer");
//const LocalStrategy = require("passport-local").Strategy;
const SamlStrategy = require("@node-saml/passport-saml").Strategy;
const session = require("express-session");
const fs = require("fs");
const zipdir = require("zip-dir");
const bodyParser = require("body-parser");
const cron = require("node-cron");
let FakeTimers = require("@sinonjs/fake-timers");
const CronJob = require("cron");
const nodemailer = require("nodemailer");

const app = express();
const port = 3001;

app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
  origin: `http://localhost:5173`,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.static("public"));

app.use(
  session({
    secret: "hjsojsdjndhirheish",
    resave: false,
    saveUninitialized: false,
  })
);

passport.serializeUser((expressUser, done) => {
  done(null, expressUser);
});

passport.deserializeUser((expressUser, done) => {
  done(null, expressUser);
});
passport.use(
  new SamlStrategy(
    {
      path: "/login/callback",
      entryPoint:
        "https://dev-alc65i0s4u7pc5m2.us.auth0.com/samlp/NIBQ40Cep9RJAwUIviRdgPCAPMhY7iG8",
      issuer: "http:localhost:3001",
      cert: fs.readFileSync("./SAML2.0/dev-alc65i0s4u7pc5m2.pem", "utf-8"),
      logoutUrl:
        "https://dev-alc65i0s4u7pc5m2.us.auth0.com/samlp/NIBQ40Cep9RJAwUIviRdgPCAPMhY7iG8/logout",
      wantAssertionsSigned: false,
      wantAuthnResponseSigned: false,
      acceptedClockSkewMs: -1,
    },
    function (profile, done) {
      profile.user_type = profile["http://schemas.auth0.com/user_type"];
      profile.username =
        profile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ];
      profile.name =
        profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

//const txt = uninstallVirtualClock();

/***USER - API***/
//Session user info
app.get(
  "/login",
  passport.authenticate("saml", { failureRedirect: "/", failureFlash: true }),
  (req, res) => {
    res.redirect("http://localhost:5173");
  }
);

// login
app.post(
  "/login/callback",
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate("saml", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res) {
    if (req.user && req.user.user_type === "PROF")
      res.redirect("http://localhost:5173/profproposals");
    else if (req.user && req.user.user_type === "STUD")
      res.redirect("http://localhost:5173/studproposals");
    else if (req.user && req.user.user_type === "SECR")
      res.redirect("http://localhost:5173/secrrequests");
  }
);

app.get("/whoami", (req, res) => {
  try {
    if (req.isAuthenticated()) {
      res.status(200).json(req.user);
    } else res.status(401).json({ error: "Unauthenticated user!" });
  } catch (error) {
    console.log(error);
  }
});

// logout
app.post("/logout", (req, res, next) => {
  res.clearCookie("connect.sid");
  req.logout(function (err) {
    console.log(err);
    req.session.destroy(function (err) {
      res.send();
    });
  });
});

/***API***/
app.get("/api/student/applications", isStudent, getApplicationStudent);
//GET PROPOSALS
app.get("/api/proposals", isLoggedIn, getProposals);
//GET PROPOSAL BY ID
app.get("/api/proposal/:id", isLoggedIn, getProposal);
//DO AN APPLICATION FOR A PROPOSAL
app.post("/api/newApplication/:thesis_id", isStudent, newApplication);
//ADD FILES
app.post("/api/newFiles/:thesis_id", isStudent, addFiles);

app.get("/api/getAllFiles/:student_id/:thesis_id", isProfessor, getAllFiles);

//GET TEACHERS
app.get("/api/teachersList", isLoggedIn, getTeachersList);

//GET STUDENT CV
app.get("/api/getStudent/:student_id", isSecretaryOrProfessor, getStudent);

//GET STUDENT CV
app.get("/api/getStudentCv/:student_id", isSecretaryOrProfessor, getStudentCV);

app.get(
  "/api/getStudentFilesList/:student_id/:thesis_id",
  isProfessor,
  getStudentFilesList
);

app.get("/api/getFile/:student_id/:thesis_id/:file_name", isProfessor, getFile);

//CREATES NEW THESIS AND RELATED INT/EXTERNAL COSUPERVISORS
app.post(
  "/api/newThesis",
  isProfessor,
  [
    // Various checks of syntax of given data
    check("title").isString().isLength({ min: 1, max: 100 }),
    check("supervisor_id").isString().isLength({ min: 1, max: 7 }), //Maybe we can try to check if the string is in the format Pxxxxxx
    check("thesis_level").isIn(["Bachelor", "Master", "bachelor", "master"]),
    check("type_name").isString().isLength({ min: 1, max: 50 }),
    check("required_knowledge").isString(),
    check("notes").isString(),
    check("expiration")
      .isISO8601()
      .toDate()
      .isAfter()
      .withMessage(
        "Date time must be in format YYYY-MM-DD HH:MM:SS and in the future"
      ),
    check("cod_degree").isString().isLength({ min: 1, max: 10 }),
    check("is_archived").isBoolean(),
    check("keywords").isString(),
    check("cosupervisors_internal").isArray(),
    check("cosupervisors_internal.*").isString(),
    check("cosupervisors_external").isArray(),
    check("cosupervisors_external.*").isString(),
    check("cod_group").isString().isLength({ min: 1, max: 6 }),
  ],
  newThesis
);

//RETURNS LIST OF EVERY EXTERNAL COSUPERVISORS

app.get(
  "/api/listExternalCosupervisors",
  isProfessor,
  listExternalCosupervisors
);

//ACCEPT/REJECT APPLICATION
app.put(
  "/api/updateApplicationStatus",
  isProfessor,
  [check("status").isIn(["Accepted", "Rejected"])],
  updateApplicationStatus
);

//this is for getting all the ACTIVE applications related to all the proposals of a specific professor (which makes this request)
app.get("/api/getApplications", isProfessor, getApplications);

// Activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

//CREATES NEW EXTERNAL COSUPERVISOR
app.post(
  "/api/newExternalCosupervisor",
  isProfessor,
  [
    // Various checks of syntax of given data
    check("email").isEmail(),
    check("surname").isLength({ min: 1, max: 50 }),
    check("name").isLength({ min: 1, max: 50 }),
  ],
  createExternalCosupervisor
);

app.get("/api/getProposalsProfessor", isProfessor, getProposalsProfessor);

app.put(
  "/api/archiveProposalManual",
  isProfessor,
  updateThesesArchivationManual
);

app.get("/api/groups", isProfessor, listGroups);

app.get("/api/degrees", isProfessor, listDegrees);

app.delete("/api/deleteProposal", isProfessor, deleteProposal);

app.get(
  "/api/getThesisForProfessorById/:id",
  isProfessor,
  getThesisForProfessorById
);

//UPDATES AN EXISTING THESIS
app.put(
  "/api/updateThesis/:id",
  isProfessor,
  [
    // Various checks of syntax of given data
    check("title").isString().isLength({ min: 1, max: 100 }),
    check("supervisor_id").isString().isLength({ min: 1, max: 7 }), //Maybe we can try to check if the string is in the format Pxxxxxx
    check("thesis_level").isIn(["Bachelor", "Master", "bachelor", "master"]),
    check("type_name").isString().isLength({ min: 1, max: 50 }),
    check("required_knowledge").isString(),
    check("notes").isString(),
    check("expiration")
      .isISO8601()
      .toDate()
      .isAfter()
      .withMessage(
        "Date time must be in format YYYY-MM-DD HH:MM:SS and in the future"
      ),
    check("cod_degree").isString().isLength({ min: 1, max: 10 }),
    check("is_archived").isBoolean(),
    check("keywords").isString(),
    check("cosupervisors_internal").isArray(),
    check("cosupervisors_internal.*").isString(),
    check("cosupervisors_external").isArray(),
    check("cosupervisors_external.*").isString(),
    check("cod_group").isString().isLength({ min: 1, max: 6 }),
  ],
  updateThesis
);

app.get("/api/isApplied", isStudent, isApplied);

app.get("/api/hasAlreadyReuests", isStudent, hasAlreadyRequest);

//THESIS REQUESTS
app.get("/api/getrequestsforsecr", isSecretary, getRequestsForSecretary);

app.get("/api/getrequestsforprof", isProfessor, getRequestsForProfessor);

app.put("/api/updateRequest/:id", isSecretaryOrProfessor, updateThesisRequest);

//RETURN TO REAL DATETIME
app.put("/api/setRealDateTime", uninstallVirtualClock);

//SET VC DATETIME
app.put(
  "/api/setVirtualDateTime",
  [check("datetime").isISO8601().toDate()],
  setVirtualClock
);

app.get("/api/getServerDateTime", getServerDateTime);

app.get("/api/getServerDateTime", getServerDateTime);

//CREATES NEW THESIS REQUEST
app.post(
  "/api/newRequest",
  isStudent,
  [
    // Various checks of syntax of given data
    check("title").isString().isLength({ min: 1, max: 100 }),
    check("supervisor_id").isString().isLength({ min: 1, max: 7 }), //Maybe we can try to check if the string is in the format Pxxxxxx
    check("cosupervisors_internal").isArray(),
    check("cosupervisors_internal.*").isString(),
  ],
  newRequest
);

const now = new Date().toString();
console.log("Date-time:", now);
create_schedule();
