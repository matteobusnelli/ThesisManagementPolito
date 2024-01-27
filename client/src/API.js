"use strict";
const URL = "http://localhost:3001/api";
const URL_LOGIN = "http://localhost:3001";

function getJson(httpResponsePromise) {
  //debugger;
  // server API always return JSON, in case of error the format is the following { error: <message> }
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
          // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
          response
            .json()
            .then((json) => resolve(json))
            .catch((err) => reject({ error: "Cannot parse server response" }));
        } else {
          // analyzing the cause of error
          response
            .json()
            .then((obj) => reject(obj)) // error msg in the response body
            .catch((err) => reject({ error: "Cannot parse server response" })); // something else
        }
      })
      .catch((err) => reject({ error: "Cannot communicate" })); // connection error
  });
}

async function logOut() {
  await fetch(URL_LOGIN + "/logout", {
    method: "POST",
    credentials: "include",
  });
}

const redirectToLogin = () => {
  window.location.replace(URL_LOGIN + "/login");
};

async function getUserInfo() {
  const response = await fetch(URL_LOGIN + "/whoami", {
    credentials: "include",
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;
  }
}

async function newProposal(thesis) {
  return getJson(
    fetch(URL + "/newThesis", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(thesis),
    })
  );
}

async function newRequest(request) {
  return getJson(
    fetch(URL + "/newRequest", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })
  );
}

async function getListExternalCosupervisors() {
  return getJson(
    fetch(URL + `/listExternalCosupervisors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  );
}

async function getTeachers() {
  return getJson(
    fetch(URL + `/teachersList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  );
}

async function getDegrees() {
  return getJson(
    fetch(URL + `/degrees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  );
}

async function getGroups() {
  return getJson(
    fetch(URL + `/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  );
}

async function newExternalCosupervisor(external_cosupervisor) {
  return getJson(
    fetch(URL + `/newExternalCosupervisor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(external_cosupervisor),
      credentials: "include",
    })
  );
}

async function applicationThesis(thesis_id, date) {
  return getJson(
    fetch(URL + `/newApplication/${thesis_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: date,
      }),
      credentials: "include",
    })
  );
}

function sendFiles(formData, thesis_id) {
  try {
    const uploadURL = `${URL}/newFiles/${thesis_id}`;
    console.log(formData);
    const response = fetch(uploadURL, {
      method: "POST",
      body: formData, // FormData object containing the files
      credentials: "include",
    });

    return getJson(response);
  } catch (error) {
    return { error: "Cannot communicate" };
  }
}

async function getThesisProposals(date) {
  const response = await fetch(URL + `/proposals?date=${date}`, {
    credentials: "include",
  });
  const proposals = await response.json();
  if (response.ok && proposals.length > 0) {
    return proposals.map((element) => ({
      id: element.id,
      title: element.title,
      description: element.description,
      supervisor: element.surname.concat(" ", element.name),
      level: element.thesis_level,
      type: element.thesis_type,
      required_knowledge: element.required_knowledge,
      notes: element.notes,
      expiration: element.expiration,
      keywords: element.keywords,
      groups: element.group_name,
      department: element.department_name,
      cosupervisors: element.cosupervisors,
    }));
  } else {
    return [];
  }
}

async function getThesisProposalsById(thesisId) {
  const response = await fetch(URL + `/proposal/${thesisId}`, {
    credentials: "include",
  });
  const proposal = await response.json();
  if (response.ok) {
    return proposal;
  } else {
    throw proposal;
  }
}
//--------------------VIRTUAL CLOCK----------------------------------------------

async function setVirtualTime(virtualTime) {
  const response = await fetch(URL + "/setVirtualDateTime", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datetime: virtualTime,
    }),
  });
  if (response.ok) {
    const msg = await response.json();
    return msg;
  } else if (response.status == "422") {
    const errors = await response.json();
    return errors.errors;
  } else {
    const error = await response.json();
    throw Error(error.error);
  }
}

async function setRealTime() {
  const response = await fetch(URL + "/setRealDateTime", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    const msg = await response.json();
    return msg;
  } else if (response.status == "422") {
    const errors = await response.json();
    return errors.errors;
  } else {
    const error = await response.json();
    throw Error(error.error);
  }
}
//-----------END VIRTUAL CLOCK---------------------------------------------------

async function getPendingApplications() {
  return getJson(
    fetch(`${URL}/getApplications`, {
      credentials: "include",
    })
  );
}

async function updateApplictionStatus(thesis_id, student_id, status) {
  return getJson(
    fetch(URL + `/updateApplicationStatus`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        thesis_id,
        student_id,
        status,
      }),
    })
  );
}
async function getStudentApplications() {
  return getJson(
    fetch(`${URL}/student/applications`, {
      credentials: "include",
    })
  );
}

async function isApplied() {
  return getJson(
    fetch(`${URL}/isApplied`, {
      credentials: "include",
    })
  );
}

async function downloadStudentApplicationAllFiles(student_id, thesis_id) {
  const response = await fetch(
    URL + `/getAllFiles/${student_id}/${thesis_id}`,
    {
      credentials: "include",
      headers: {
        Accept: "application/zip",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to download zip folder. Status: ${response.status}`
    );
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `${student_id}_${thesis_id}.zip`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
}

async function downloadStudentApplicationFile(
  student_id,
  thesis_id,
  file_name
) {
  const response = await fetch(
    URL + `/getFile/${student_id}/${thesis_id}/${file_name}`,
    {
      credentials: "include",
      headers: {
        Accept: "application/pdf",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to download PDF file. Status: ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `${file_name}.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
}

async function listApplicationFiles(student_id, thesis_id) {
  return getJson(
    fetch(`${URL}/getStudentFilesList/${student_id}/${thesis_id}`, {
      credentials: "include",
    })
  );
}

async function getProposalsProfessor() {
  return getJson(
    fetch(`${URL}/getProposalsProfessor`, {
      credentials: "include",
    })
  );
}

async function updateThesisArchivation(thesis_id) {
  return getJson(
    fetch(URL + `/archiveProposalManual`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        thesis_id,
      }),
    })
  );
}

async function deleteProposal(thesisID) {
  const response = await fetch(URL + "/deleteproposal", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ thesis_id: thesisID }),
  });

  const result = await response.json();
  return result;
}

async function getThesisForProfessorById(id) {
  return getJson(
    fetch(`${URL}/getThesisForProfessorById/${id}`, {
      credentials: "include",
    })
  );
}

async function updateProposal(thesis, id) {
  return getJson(
    fetch(URL + `/updateThesis/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(thesis),
    })
  );
}

async function updateRequest(id, newValue) {
  return getJson(
    fetch(URL + `/updateRequest/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ change: newValue }),
    })
  );
}

async function getServerDateTime() {
  return getJson(
    fetch(`${URL}/getServerDateTime`, {
      credentials: "include",
    })
  );
}

async function getRequestsForProfessor() {
  return getJson(
    fetch(`${URL}/getrequestsforprof`, {
      credentials: "include",
    })
  );
}

async function getRequestsForSecretary() {
  return getJson(
    fetch(`${URL}/getrequestsforsecr`, {
      credentials: "include",
    })
  );
}

async function getStudentCv(id) {
  return getJson(
    fetch(`${URL}/getStudentCv/${id}`, {
      credentials: "include",
    })
  );
}

async function getStudent(id) {
  return getJson(
    fetch(`${URL}/getStudent/${id}`, {
      credentials: "include",
    })
  );
}

async function hasAlreadyReuests() {
  return getJson(
    fetch(`${URL}/hasAlreadyReuests`, {
      credentials: "include",
    })
  );
}

const API = {
  logOut,
  getUserInfo,
  getThesisProposals,
  applicationThesis,
  getThesisProposalsById,
  sendFiles,
  newProposal,
  newRequest,
  getListExternalCosupervisors,
  newExternalCosupervisor,
  getPendingApplications,
  updateApplictionStatus,
  redirectToLogin,
  getStudentApplications,
  isApplied,
  downloadStudentApplicationAllFiles,
  downloadStudentApplicationFile,
  listApplicationFiles,
  setRealTime,
  setVirtualTime,
  getProposalsProfessor,
  updateThesisArchivation,
  getTeachers,
  getGroups,
  getDegrees,
  deleteProposal,
  getThesisForProfessorById,
  updateProposal,
  getServerDateTime,
  getRequestsForProfessor,
  getRequestsForSecretary,
  updateRequest,
  getStudentCv,
  getStudent,
  hasAlreadyReuests,
};
export default API;
