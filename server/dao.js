"use strict";

const dotenv = require("dotenv");
dotenv.config();

//const crypto = require("crypto");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { resolve } = require("path");
const { rejects } = require("assert");
const { request } = require("http");

dayjs.extend(utc);
dayjs.extend(timezone);

// open the database
const dbConfig = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "rootroot",
  database: "db_se_thesismanagement",
};

const pool = mysql.createPool(dbConfig);

exports.getUser = async (email, password) => {
  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await pool.execute(sql, [email]);

    if (results.length === 0) {
      return false;
    }

    const userRow = results[0];
    const user = {
      username: userRow.email,
      user_type: userRow.user_type_id,
    };

    const salt = userRow.salt;

    const hashedPassword = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const passwordHex = Buffer.from(userRow.password, "hex");

    if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) {
      return false;
    } else {
      return user;
    }
  } catch (error) {
    console.error("Error in getUser: ", error);
    throw error;
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await pool.execute(sql, [email]);

    if (results.length === 0) {
      throw { error: "User not found." };
    }

    const userRow = results[0];
    const user = {
      username: userRow.email,
      user_type: userRow.user_type_id,
    };

    return user;
  } catch (error) {
    console.error("Error in getUserByEmail: ", error);
    throw error;
  }
};

//retrive the UserID from teh username
exports.getUserID = async (username) => {
  try {
    if (!username) {
      throw { error: "parameter is missing" };
    }

    const sql = "SELECT * FROM student WHERE email = ?";
    const [results] = await pool.execute(sql, [username]);

    if (results.length === 0) {
      throw { error: "User not found." };
    }

    const userRow = results[0];
    return userRow.id;
  } catch (error) {
    console.error("Error in getUserIDByID: ", error);
    throw error;
  }
};

//retrive the ProfID from the username
exports.getProfID = async (username) => {
  try {
    if (!username) {
      throw { error: "parameter is missing" };
    }

    const sql = "SELECT * FROM teacher WHERE email = ?";
    const [results] = await pool.execute(sql, [username]);

    if (results.length === 0) {
      throw { error: "User not found." };
    }

    const userRow = results[0];
    return userRow.id;
  } catch (error) {
    console.error("Error in getUserIDByID: ", error);
    throw error;
  }
};

exports.getDataStudentApplicationEmail = async (thesisId, studentId) => {
  try {
    const sql =
      "SELECT  S.email, TS.title, S.name, S.surname FROM thesis TS, student S WHERE TS.id = ? AND S.id = ? ";
    const [result] = await pool.execute(sql, [thesisId, studentId]);
    return result[0];
  } catch (error) {
    console.error("Error in getDataStudentApplicationEmail: ", error);
    throw error;
  }
};

exports.getDataProfessorRequestEmail = async (requestID, professorID) => {
  try {
    const sql =
      "SELECT  email, title FROM thesis_request TR, teacher T WHERE TR.id = ? AND T.id = ?";
    const [result] = await pool.execute(sql, [requestID, professorID]);
    return result[0];
  } catch (error) {
    console.error("Error in getDataProfessorRequestEmail: ", error);
    throw error;
  }
};

//Get proposals
exports.getProposals = async (user_type, username, date) => {
  try {
    let studentTitleDegree;
    let studentApplicationid;
    let sql;
    if (user_type === "STUD") {
      sql =
        "SELECT title_degree FROM student s JOIN degree_table d ON s.cod_degree = d.cod_degree WHERE s.email = ?";
      const [degreeResult] = await pool.execute(sql, [username]);
      studentTitleDegree = degreeResult[0].title_degree;

      sql =
        "SELECT thesis_id FROM student s JOIN application a ON s.id = a.student_id WHERE s.email = ?";
      const [applicationResult] = await pool.execute(sql, [username]);
      studentApplicationid =
        applicationResult.length !== 0
          ? applicationResult.map((element) => element.thesis_id)
          : [];
    }
    let formattedDate = dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    sql =
      "SELECT t.id, title, description, tch.name ,tch.surname , thesis_level ,thesis_type , required_knowledge , notes, expiration, keywords , dg.title_degree , g.group_name, d.department_name  , is_archived FROM thesis t join teacher tch on t.supervisor_id = tch.id join degree_table dg on t.cod_degree = dg.cod_degree join group_table g on tch.cod_group = g.cod_group join department d on tch.cod_department = d.cod_department WHERE t.expiration > ? AND is_deleted = 0 AND is_archived=0";
    const [thesisResults] = await pool.execute(sql, [formattedDate]);

    if (thesisResults.length === 0) {
      return thesisResults;
    }
    let thesisFromSameDegreeOfStudent = thesisResults;

    if (user_type === "STUD") {
      thesisFromSameDegreeOfStudent = thesisResults.filter(
        (item) =>
          item.title_degree === studentTitleDegree &&
          !studentApplicationid.includes(item.id)
      );
    }

    //we have to modify results of query before sending them back to front end
    //2- we don't have cosupervisors field in query result. so we should add an array for cosupervisors for each row
    const addcosupervisorsArrayToResults = thesisFromSameDegreeOfStudent.map(
      (item) => {
        return { ...item, cosupervisors: [] };
      }
    );

    //3- in this stage of result, we have only the group related to supervisor
    //to make it possible to add cosupervisors' group & department, we need to change group field from a string to an array of objects (group & department)
    const changeGroupValueToArray = addcosupervisorsArrayToResults.map(
      (item) => {
        return {
          ...item,
          group_name: [
            { group: item.group_name, department: item.department_name },
          ],
        };
      }
    );

    //4- split keywords from a single string into an array
    const splitKeywordsToArray = changeGroupValueToArray.map((item) => {
      let keywordsArray = [];
      if (item.keywords !== null && item.keywords !== undefined) {
        keywordsArray = item.keywords.split(",");
      }
      return { ...item, keywords: keywordsArray };
    });

    let finalResult = splitKeywordsToArray;

    sql =
      "select t.id, csve.cosupevisor_id, es.name, es.surname  from thesis t join thesis_cosupervisor_external csve on t.id = csve.thesis_id join external_supervisor es on csve.cosupevisor_id  = es.email";
    const [result] = await pool.execute(sql);

    if (result.length === 0) {
    } else {
      result.forEach((item) => {
        const indexInsideFinalResult = finalResult.findIndex(
          (fR) => fR.id === item.id
        ); //find corresponding thesis index inside finalResult
        if (indexInsideFinalResult >= 0) {
          // we get minus values in case of no match
          finalResult[indexInsideFinalResult].cosupervisors = [
            ...finalResult[indexInsideFinalResult].cosupervisors,
            "" + item.name + " " + item.surname,
          ];
        }
      });
    }

    //check for cosupervisors which are university professor and add their name and department's name and group to finalresult
    sql =
      "select t.id, tch.name , tch.surname , g.group_name, d.department_name  from thesis t join thesis_cosupervisor_teacher csvt on t.id = csvt.thesis_id join teacher tch on csvt.cosupevisor_id = tch.id join group_table g on tch.cod_group = g.cod_group join department d on tch.cod_department = d.cod_department";
    const [results] = await pool.execute(sql);

    if (result.length === 0) {
    } else {
      results.forEach((item) => {
        const indexInsideFinalResult = finalResult.findIndex(
          (fR) => fR.id === item.id
        ); //find corresponding thesis index inside finalResult
        if (indexInsideFinalResult >= 0) {
          finalResult[indexInsideFinalResult].cosupervisors = [
            ...finalResult[indexInsideFinalResult].cosupervisors,
            "" + item.name + " " + item.surname,
          ];
          //check if we already has another supervisor from same group and department for the current thesis, so if we have, skip adding multiple record of the same group
          const repetitiveGroup = finalResult[
            indexInsideFinalResult
          ].group_name.some((obj) => {
            return (
              JSON.stringify(obj) ===
              JSON.stringify({
                group: item.group_name,
                department: item.department_name,
              })
            );
          });
          if (!repetitiveGroup) {
            finalResult[indexInsideFinalResult].group_name = [
              ...finalResult[indexInsideFinalResult].group_name,
              { group: item.group_name, department: item.department_name },
            ];
          }
        }
      });
    }
    return finalResult;
  } catch (error) {
    console.error("Error in getProposals: ", error);
    throw error;
  }
};

//Get proposal by id
exports.getProposalById = async (requested_thesis_id, user_type, username) => {
  try {
    let sql;

    //all loged-in users can retrieve all the proposals. students can only retrieve thesis proposals which are intended for their degree
    if (user_type === "STUD") {
      //check if the requested thesis degree is same to student's degree or not. if not, do not show anything to student
      sql = "select cod_degree from student where email = ?";
      const [result] = await pool.execute(sql, [username]);

      sql = "select cod_degree from thesis where id = ?";
      const [result2] = await pool.execute(sql, [requested_thesis_id]);

      if (result[0].cod_degree != result2[0].cod_degree) {
        return {
          error: "you are not allowed to see proposals from other degrees",
        };
      }
    }

    sql =
      "select t.id, title, description, tch.name ,tch.surname , thesis_level ,thesis_type , required_knowledge , notes, expiration, keywords , dg.title_degree , g.group_name, d.department_name  , is_archived from thesis t join teacher tch on t.supervisor_id = tch.id join degree_table dg on t.cod_degree = dg.cod_degree join group_table g on tch.cod_group = g.cod_group join department d on tch.cod_department = d.cod_department where t.id = ?";
    let [results] = await pool.execute(sql, [requested_thesis_id]);

    if (results.length === 0) {
      return {
        error: "you are not allowed to see proposals from other degrees",
      };
    }

    const addcosupervisorsArrayToResult = { ...results[0], cosupervisors: [] };

    const changeGroupValueToArray = {
      ...addcosupervisorsArrayToResult,
      group_name: [
        {
          group: addcosupervisorsArrayToResult.group_name,
          department: addcosupervisorsArrayToResult.department_name,
        },
      ],
    };

    let keywordsArray = [];
    if (
      changeGroupValueToArray.keywords !== null &&
      changeGroupValueToArray.keywords !== undefined
    ) {
      keywordsArray = changeGroupValueToArray.keywords.split(",");
    }
    const splitKeywordsToArray = {
      ...changeGroupValueToArray,
      keywords: keywordsArray,
    };

    let finalResult = splitKeywordsToArray;
    //check for EXTERNAL cosupervisors and add their name & surname to finalresult
    sql =
      "select t.id, csve.cosupevisor_id, es.name, es.surname  from thesis t join thesis_cosupervisor_external csve on t.id = csve.thesis_id join external_supervisor es on csve.cosupevisor_id  = es.email  where t.id = ?";
    [results] = await pool.execute(sql, [requested_thesis_id]);
    if (results.length === 0) {
    } else {
      results.forEach((item) => {
        finalResult.cosupervisors = [
          ...finalResult.cosupervisors,
          "" + item.name + " " + item.surname,
        ];
      });
    }
    //check for cosupervisors which are university professor and add their name and department's name and group to finalresult
    sql = `SELECT t.id, tch.name, tch.surname, g.group_name, d.department_name
      FROM thesis t
      JOIN thesis_cosupervisor_teacher csvt ON t.id = csvt.thesis_id
      JOIN teacher tch ON csvt.cosupevisor_id = tch.id
      JOIN group_table g ON tch.cod_group = g.cod_group
      JOIN department d ON tch.cod_department = d.cod_department
      WHERE t.id = ?`;

    results = await pool.execute(sql, [requested_thesis_id]);

    if (results.length === 0) {
    } else {
      for (const item of results[0]) {
        finalResult.cosupervisors = [
          ...finalResult.cosupervisors,
          "" + item.name + " " + item.surname,
        ];

        const repetitiveGroup = finalResult.group_name.some((obj) => {
          return (
            JSON.stringify(obj) ===
            JSON.stringify({
              group: item.group_name,
              department: item.department_name,
            })
          );
        });
        if (!repetitiveGroup) {
          finalResult.group_name = [
            ...finalResult.group_name,
            { group: item.group_name, department: item.department_name },
          ];
        }
      }
    }
    return finalResult;
  } catch (error) {
    console.error("Error in getProposalById: ", error);
    throw error;
  }
};

//returns true if the thesis is not expired or archived, otherwise true
exports.isThesisValid = async (thesisID, date) => {
  try {
    const formattedDate = dayjs(date).format("YYYY-MM-DD HH:mm:ss");

    const sql =
      "SELECT COUNT(*) as count FROM thesis WHERE id = ? AND expiration>?";
    const [countResult] = await pool.execute(sql, [thesisID, formattedDate]);

    if (countResult[0].count === 0) {
      return false;
    } else if (countResult[0].count === 1) {
      return true;
    } else {
      throw new Error("Database error");
    }
  } catch (error) {
    console.error("Error in isThesisValid: ", error);
    throw error;
  }
};

//returns false is the student is not already applied for a thesis,  otherwise true
exports.isAlreadyExisting = async (studentID) => {
  try {
    const sql =
      "SELECT COUNT(*) as count FROM application WHERE student_id = ? and (status ='Accepted' or status ='Pending')";
    const [countResult] = await pool.execute(sql, [studentID]);

    if (countResult[0].count === 1) {
      return true;
    } else if (countResult[0].count === 0) {
      return false;
    } else {
      throw new Error("Database error");
    }
  } catch (error) {
    console.error("Error in isAlreadyExisting: ", error);
    throw error;
  }
};

//Return the email of the teacher and the title of the thesis
exports.getDataTeacherApplicationEmail = async (thesisId) => {
  try {
    const sql =
      "SELECT  email, title FROM thesis TS, teacher TE WHERE TS.id = ? AND TS.supervisor_id = TE.id";

    const [result] = await pool.execute(sql, [thesisId]);

    return result[0];
  } catch (error) {
    console.error("Error in getDataApplicationEmail: ", error);
    throw error;
  }
};

// Function to create a new application
exports.newApply = async (studentID, ThesisID, date) => {
  try {
    const status = "pending";
    const formattedDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const sql =
      "INSERT INTO application (student_id, thesis_id, status, application_date) VALUES (?, ?, ?, ?)";
    await pool.execute(sql, [studentID, ThesisID, status, formattedDate]);

    return "Application successful.";
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw "You have already applied to this thesis.";
    } else {
      console.error("Errore nella query newApply:", error);
      throw error;
    }
  }
};

// Creates a new thesis row in thesis table, must receive every data of thesis, returns newly created row, including autoicremented id ( used to add new rows in successive tables)
exports.createThesis = async (thesis) => {
  try {
    const sql =
      "INSERT INTO thesis (title, description, supervisor_id, thesis_level, thesis_type, required_knowledge, notes, expiration, cod_degree, is_archived, keywords, is_expired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)";
    const [rows] = await pool.execute(sql, [
      thesis.title,
      thesis.description,
      thesis.supervisor_id,
      thesis.thesis_level,
      thesis.type_name,
      thesis.required_knowledge,
      thesis.notes,
      new Date(thesis.expiration.setHours(23, 59, 59)),
      thesis.cod_degree,
      thesis.is_archived,
      thesis.keywords,
    ]);

    const thesisrow = { id: rows.insertId, ...thesis };
    return thesisrow;
  } catch (error) {
    console.error("Error in createThesis: ", error);
    throw error;
  }
};

// Selects every teacher id from teacher table, return array of teachers codes
exports.getTeachers = async () => {
  try {
    const sql = `SELECT id FROM teacher`;
    const [rows] = await pool.execute(sql);

    const teachers = [];
    rows.map((e) => {
      teachers.push(e.id);
    });
    return teachers;
  } catch (error) {
    console.error("Error in getTeachers: ", error);
    throw error;
  }
};

exports.getTeachersList = async () => {
  try {
    const sql = `SELECT * FROM teacher`;
    const [rows] = await pool.execute(sql);

    const teachers = [];
    rows.map((e) => {
      teachers.push(e);
    });
    return teachers;
  } catch (error) {
    console.error("Error in getTeachersList: ", error);
    throw error;
  }
};

// Selects every code of degrees from degree_table, returns array of degrees codes
exports.getCodDegrees = async () => {
  try {
    const sql = `SELECT cod_degree FROM degree_table`;
    const [rows] = await pool.execute(sql);

    const degrees = [];
    rows.map((e) => {
      degrees.push(e.cod_degree);
    });
    return degrees;
  } catch (error) {
    console.error("Error in getCodDegrees: ", error);
    throw error;
  }
};

// Selects every degrees from degree_table, returns array of degrees
exports.getDegrees = async () => {
  try {
    const sql = `SELECT * FROM degree_table`;
    const [rows] = await pool.execute(sql);

    const degrees = [];
    rows.map((e) => {
      const degree = {
        name: e.title_degree,
        cod: e.cod_degree,
      };
      degrees.push(degree);
    });
    return degrees;
  } catch (error) {
    console.error("Error in getDegrees: ", error);
    throw error;
  }
};

// Selects every code of research groups from group_table, returns array of codes
exports.getCodes_group = async () => {
  try {
    const sql = `SELECT cod_group FROM group_table`;
    const [rows] = await pool.execute(sql);

    const codes_group = [];
    rows.map((e) => {
      codes_group.push(e.cod_group);
    });
    console.log("INSIDE FUNCTION", codes_group);
    return codes_group;
  } catch (error) {
    console.error("Error in getCodes_group: ", error);
    throw error;
  }
};

// Inserts new row in thesis_group table, must receive id of thesis and id of related group, returns new inserted row
exports.createThesis_group = async (thesis_id, group_id) => {
  try {
    const sql = "INSERT INTO thesis_group (thesis_id, group_id) VALUES (?,?)";
    await pool.execute(sql, [thesis_id, group_id]);

    const thesis_group = {
      thesis_id: thesis_id,
      group_id: group_id,
    };
    return thesis_group;
  } catch (error) {
    console.error("Error in createThesis_group: ", error);
    throw error;
  }
};

// Insert new row in thesis_cosupervisor table, must receive thesis id and cosupervisor id
exports.createThesis_cosupervisor_teacher = async (thesis_id, professor_id) => {
  try {
    const sql =
      "INSERT INTO thesis_cosupervisor_teacher (thesis_id, cosupevisor_id) VALUES (?,?)";
    await pool.execute(sql, [thesis_id, professor_id]);

    const thesis_cosupervisor = {
      thesis_id: thesis_id,
      thesis_cosupervisor: professor_id,
    };
    return thesis_cosupervisor;
  } catch (error) {
    console.error("Error in createThesis_cosupervisor_teacher: ", error);
    throw error;
  }
};
// Insert new row in thesis_cosupervisor table, must receive thesis id and cosupervisor id
exports.createRequest_cosupervisor_teacher = async (
  request_id,
  professor_id
) => {
  try {
    const sql =
      "INSERT INTO thesis_cosupervisor_teacher (thesisrequest_id, cosupevisor_id) VALUES (?,?)";
    await pool.execute(sql, [request_id, professor_id]);

    const thesis_cosupervisor = {
      request_id: request_id,
      thesis_cosupervisor: professor_id,
    };
    return thesis_cosupervisor;
  } catch (error) {
    console.error("Error in createRequest_cosupervisor_teacher: ", error);
    throw error;
  }
};

// Insert new row in thesis_cosupervisor_external table, must receive thesis id and email
exports.createThesis_cosupervisor_external = async (thesis_id, email) => {
  try {
    const sql =
      "INSERT INTO thesis_cosupervisor_external (thesis_id, cosupevisor_id) VALUES (?,?)";
    await pool.execute(sql, [thesis_id, email]);

    const thesis_cosupervisor = {
      thesis_id: thesis_id,
      thesis_cosupervisor: email,
    };
    return thesis_cosupervisor;
  } catch (error) {
    console.error("Error in createThesis_cosupervisor_external: ", error);
    throw error;
  }
};

// Selects every external supervisor from external_supervisor table, returns array of external cosupervisors
exports.getExternal_cosupervisors = async () => {
  try {
    const sql = `SELECT * FROM external_supervisor`;
    const [rows] = await pool.execute(sql);

    const external_supervisors = [];
    rows.map((e) => {
      const external_supervisor = {
        name: e.name,
        surname: e.surname,
        email: e.email,
      };
      external_supervisors.push(external_supervisor);
    });
    return external_supervisors;
  } catch (error) {
    console.error("Error in getExternal_cosupervisors: ", error);
    throw error;
  }
};

//return every email of external cosupervisors
exports.getExternal_cosupervisors_emails = async () => {
  try {
    const sql = `SELECT email FROM external_supervisor`;
    const [rows] = await pool.execute(sql);

    const external_cosupervisor_emails = [];
    rows.map((e) => {
      external_cosupervisor_emails.push(e.email);
    });
    return external_cosupervisor_emails;
  } catch (error) {
    console.error("Error in getExternal_cosupervisors_emails: ", error);
    throw error;
  }
};

// Selects every group from group_table, returns array of groups
exports.getGroups = async () => {
  try {
    const sql = `SELECT * FROM group_table`;
    const [rows] = await pool.execute(sql);

    const groups = [];
    rows.forEach((e) => {
      const group = {
        name: e.group_name,
        cod: e.cod_group,
      };
      groups.push(group);
    });
    return groups;
  } catch (error) {
    console.error("Error in getGroups: ", error);
    throw error;
  }
};

// updates is archived value to 1 if date has passed
exports.setExpired = async (virtualDateTime) => {
  try {
    const sql = ` 
                UPDATE thesis
                SET is_expired = CASE
                    WHEN expiration < ? THEN 1
                    ELSE 0
                END;
                `;
    const [rows] = await pool.execute(sql, [virtualDateTime]);
    return rows.info;
  } catch (err) {
    console.error("Error in setExpired: ", err);
    throw err;
  }
};

exports.updateThesesArchivationManual = async (thesis_id) => {
  try {
    const sql = ` 
                UPDATE thesis
                SET is_archived = 1
                WHERE id = ?
                `;
    const [rows] = await pool.execute(sql, [thesis_id]);
    return rows.info;
  } catch (err) {
    console.error("Error in updateThesesArchivationManual: ", err);
    throw err;
  }
};

// updates is archived value to 1 if date has passed
exports.updateApplicationStatus = async (decision) => {
  try {
    const sql = `UPDATE application
                 SET status = ?
                 WHERE student_id = ? AND thesis_id = ?;`;
    const [rows] = await pool.execute(sql, [
      decision.status,
      decision.student_id,
      decision.thesis_id,
    ]);
    return decision;
  } catch (err) {
    console.error("Error in updateApplicationStatus: ", err);
    throw err;
  }
};

//rejects every application for specific thesis except for the one of accepted student
exports.rejectApplicationsExcept = async (accepted) => {
  try {
    const sql = ` 
                  UPDATE application
                  SET status = "Rejected"
                  WHERE  thesis_id = ?
                  AND student_id <> ?
                `;
    const [rows] = await pool.execute(sql, [
      accepted.thesis_id,
      accepted.student_id,
    ]);
    return accepted;
  } catch (err) {
    console.error("Error in rejectApplicationsExcept: ", err);
    throw err;
  }
};

exports.getNamerejectApplicationsExcept = async (accepted) => {
  try {
    const sql = ` 
    SELECT s.name as name, s.surname as surname FROM application a INNER JOIN student s  ON s.id = a.student_id  WHERE  a.thesis_id = ? AND a.student_id <> ?
                `;
    const [rows] = await pool.execute(sql, [
      accepted.thesis_id,
      accepted.student_id,
    ]);
    return rows;
  } catch (err) {
    console.error("Error in getNamerejectApplicationsExcept: ", err);
    throw err;
  }
};

exports.cancelStudentApplications = async (accepted) => {
  try {
    const sql = ` 
                  DELETE FROM application
                  WHERE student_id = ?
                  AND thesis_id <> ?;
                `;
    const [rows] = await pool.execute(sql, [
      accepted.student_id,
      accepted.thesis_id,
    ]);
    return accepted;
  } catch (err) {
    console.error("Error in cancelStudentApplications: ", err);
    throw err;
  }
};

// Selects every application from application table, returns array of applications(only student_id and thesis_id)
exports.getApplications = async () => {
  try {
    const sql = `SELECT * FROM application`;
    const [rows] = await pool.execute(sql, []);
    const applications = [];
    rows.map((e) => {
      const application = {
        student_id: e.student_id,
        thesis_id: e.thesis_id,
        application_date: e.application_date,
        status: e.status,
      };
      applications.push(application);
    });
    return applications;
  } catch (err) {
    console.error("Error in getApplications: ", err);
    throw err;
  }
};

//this is for getting all the ACTIVE applications related to all the proposals of a specific professor (which makes this request)
exports.getApplicationsForProfessor = async (profId) => {
  try {
    const sql = `SELECT a.student_id ,s.name ,s.surname ,a.thesis_id ,t.title ,a.application_date
                 FROM application a join student s on s.id = a.student_id join thesis t on t.id = a.thesis_id join teacher tch on t.supervisor_id = tch.id 
                 WHERE a.status = 'Pending' and tch.email = ?  ORDER BY t.title`;
    const [rows] = await pool.execute(sql, [profId]);
    const applications = [];
    rows.map((e) => {
      const fullName = "" + e.name + " " + e.surname;
      const application = {
        student_id: e.student_id,
        student_name: fullName,
        thesis_id: e.thesis_id,
        thesis_title: e.title,
        application_date: e.application_date,
      };
      applications.push(application);
    });
    return applications;
  } catch (err) {
    console.error("Error in getApplicationsForProfessor: ", err);
    throw err;
  }
};

exports.create_external_cosupervisor = async (external_cosupervisor) => {
  try {
    const sql =
      "INSERT INTO external_supervisor (email, surname, name) VALUES (?,?,?)";
    await pool.execute(sql, [
      external_cosupervisor.email,
      external_cosupervisor.surname,
      external_cosupervisor.name,
    ]);

    return external_cosupervisor;
  } catch (error) {
    console.error("Error in create_external_cosupervisor: ", error);
    throw error;
  }
};

// get student application
exports.getStudentApplication = async (studentId) => {
  try {
    const sql = "SELECT * FROM application WHERE student_id = ?";
    const [rows] = await pool.execute(sql, [studentId]);
    return rows;
  } catch (error) {
    console.error("Error in getExternal_cosupervisors_emails: ", error);
    throw error;
  }
};

// Updates an existing thesis row in thesis table, must receive every data of thesis INCLUDING irs id, returns the number of rows modified
exports.updateThesis = async (thesis) => {
  try {
    const sql = `UPDATE thesis
      SET title = ?, description = ?, supervisor_id = ?, thesis_level = ?, thesis_type = ?, required_knowledge = ?, notes = ?, expiration = ?, cod_degree = ?, is_archived = ?, keywords = ?
      WHERE id = ?`;
    const [rows] = await pool.execute(sql, [
      thesis.title,
      thesis.description,
      thesis.supervisor_id,
      thesis.thesis_level,
      thesis.type_name,
      thesis.required_knowledge,
      thesis.notes,
      thesis.expiration,
      thesis.cod_degree,
      thesis.is_archived,
      thesis.keywords,
      thesis.thesis_id,
    ]);

    return rows.affectedRows;
  } catch (error) {
    console.error("Error in updateThesis: ", error);
    throw error;
  }
};

// Updates an existing row in thesis_group table, must receive id of thesis and id of related group, returns number of rows modified
exports.deleteThesisGroups = async (thesis_id) => {
  try {
    const sql = "DELETE FROM thesis_group WHERE thesis_id = ?";
    const [rows] = await pool.execute(sql, [thesis_id]);

    /* const thesis_group = {
      thesis_id: thesis_id,
      group_id: group_id,
    }; */

    return rows.affectedRows;
  } catch (error) {
    console.error("Error in updateThesisGroup: ", error);
    throw error;
  }
};

// Deletes all the rows in thesis_cosupervisor table related to a given thesis, must receive thesis id
exports.deleteThesisCosupervisorTeacherAll = async (thesis_id) => {
  try {
    const sql = "DELETE FROM thesis_cosupervisor_teacher WHERE thesis_id = ?";
    const [rows] = await pool.execute(sql, [thesis_id]);

    /* const thesis_cosupervisor = {
      thesis_id: thesis_id,
      thesis_cosupervisor: professor_id,
    }; */
    return rows.affectedRows;
  } catch (error) {
    console.error("Error in deleteThesisCosupervisorTeacherAll: ", error);
    throw error;
  }
};

// Deletes all the rows in thesis_cosupervisor_external tablerelated to a given thesis, must receive thesis id
exports.deleteThesisCosupervisorExternalAll = async (thesis_id) => {
  try {
    const sql = "DELETE FROM thesis_cosupervisor_external WHERE thesis_id = ?";
    const [rows] = await pool.execute(sql, [thesis_id]);

    /* const thesis_cosupervisor = {
      thesis_id: thesis_id,
      thesis_cosupervisor: email,
    }; */
    return rows.affectedRows;
  } catch (error) {
    console.error("Error in deleteThesisCosupervisorExternalAll: ", error);
    throw error;
  }
};

// Checks if thesis proposal exists
exports.isThesisProposalValid = async (thesis_id) => {
  try {
    const sql = "SELECT COUNT(*) AS count FROM thesis WHERE id=?";
    const [rows] = await pool.execute(sql, [thesis_id]);

    if (rows[0].count == 1) return true;
    else if (rows[0].count == 0) return false;
    else throw new Error("Internal server error");
  } catch (error) {
    console.error("Error in isThesisProposalValid: ", error);
    throw error;
  }
};

// get student application
exports.getProposalsProfessor = async (professor_id) => {
  try {
    const sql =
      "SELECT t.* FROM thesis t inner join teacher p on p.id = t.supervisor_id WHERE p.email  = ? and is_deleted = 0 and is_expired= 0 order by t.title";
    const [rows] = await pool.execute(sql, [professor_id]);
    return rows;
  } catch (error) {
    console.error("Error in getExternal_cosupervisors_emails: ", error);
    throw error;
  }
};

//check if a proposal 1 has an active application or 2 is_archived or 3 is_expired. in these case we prevent deletion of that thesis
exports.checkBeforeDeleteProposal = async (thesis_id, professor_id) => {
  try {
    //first check the specified thesis is_archived and is_expired and is_deleted. if anyone of those is equall to 1, we cant delete that thesis, and we return an error
    const sql =
      "SELECT * FROM thesis WHERE id = ? AND is_archived = 0 AND is_deleted = 0 AND is_expired = 0";
    const [rows] = await pool.execute(sql, [thesis_id]);
    if (rows.length === 0) {
      return "The thesis you request to delete is either not available or not removale.";
    }

    //check if the requested proposal for delete is belongs to the professor whom we receive delete request from
    const sql2 = "SELECT supervisor_id FROM thesis WHERE id = ?";
    const [rows2] = await pool.execute(sql2, [thesis_id]);
    if (rows2[0].supervisor_id !== professor_id) {
      return "You can only delete your own proposals.";
    }

    //second check if the specified thesis has an accepted application, then throw an error
    const sql3 = `SELECT * FROM application WHERE thesis_id = ? AND status = "Accepted"`;
    const [rows3] = await pool.execute(sql3, [thesis_id]);
    if (rows3.length !== 0) {
      return "The thesis you request to delete has an active application. you can't delete it.";
    } else {
      return "ok";
    }
  } catch (error) {
    console.error("Error in check before delete proposal: ", error);
    throw error;
  }
};

exports.deleteProposal = async (thesis_id) => {
  try {
    //we can't delete proposal from database since there might be some pending application for that proposal. instead we change the is_deleted column to 1
    const sql = "UPDATE thesis SET is_deleted = 1 WHERE id = ?";
    const [rows] = await pool.execute(sql, [thesis_id]);
    return rows.info;
  } catch (error) {
    console.error("Error in delete proposal: ", error);
    throw error;
  }
};

//change all the recently deleted proposal's applications to state = cancelled
exports.updateApplicationsAfterProposalDeletion = async (thesis_id) => {
  try {
    const sql = `UPDATE application SET status = "Cancelled" WHERE thesis_id = ?`;
    const [rows] = await pool.execute(sql, [thesis_id]);
    return rows.info;
  } catch (error) {
    console.error(
      "Error in updating application table after deletion of a proposal: ",
      error
    );
    throw error;
  }
};

// get professor email of each thesis that is expiring a week from now
exports.getProfessorEmailExpiring = async (specifiedDate) => {
  try {
    const sql = `
    SELECT DISTINCT
      u.email AS professor_email,
      t.title AS thesis_title,
      t.expiration AS thesis_expiration
    FROM
      users u
    JOIN
      teacher te ON u.email = te.email
    JOIN
      thesis t ON te.id = t.supervisor_id
    WHERE
      t.expiration BETWEEN DATE_ADD(?, INTERVAL 7 DAY) AND DATE_ADD(DATE_ADD(?, INTERVAL 7 DAY), INTERVAL 7 HOUR) AND t.is_archived=0 AND t.is_expired=0 AND t.is_deleted=0;
  `;
    const [rows] = await pool.execute(sql, [specifiedDate, specifiedDate]);
    return rows;
  } catch (error) {
    console.error("Error in getExternal_cosupervisors_emails: ", error);
    throw error;
  }
};

//begin transaction function
exports.beginTransaction = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
  } catch (error) {
    console.error("Error in beginTransaction: ", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//commit function for transactions
exports.commit = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.commit();
  } catch (error) {
    console.error("Error in commit: ", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//rollback function for transactions
exports.rollback = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.rollback();
  } catch (error) {
    console.error("Error in rollback: ", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//get thesis data to copy for the insert of a new thesis
exports.getThesisForProfessorById = async (id) => {
  try {
    //get thesis
    const sql =
      "select t.*, CONCAT_WS(' ', te.name, te.surname) AS supervisor_name from thesis t inner join teacher te on t.supervisor_id  = te.id where t.id=?";
    const [row] = await pool.execute(sql, [id]);
    return row[0];
  } catch (err) {
    console.error("Error in getThesisForProfessorById: ", err);
    throw err;
  }
};

//get thesis external cosupervisor to copy for the insert of a new thesis
exports.getThesisExCosupervisorForProfessorById = async (id) => {
  try {
    const sqlExt =
      "select t.cosupevisor_id, CONCAT_WS(' ', es.name , es.surname) AS ext_supervisor_name from thesis_cosupervisor_external t " +
      "inner join external_supervisor es on t.cosupevisor_id = es.email where t.thesis_id = ?";
    const [rowExt] = await pool.execute(sqlExt, [id]);

    /*  return rowExt.map((item) => {
      return item.cosupevisor_id;
    }); */
    return rowExt;
  } catch (err) {
    console.error("Error in getThesisExCosupervisorForProfessorById: ", err);
    throw err;
  }
};

//get thesis internal cosupervisor to copy for the insert of a new thesis
exports.getThesisIntCosupervisorForProfessor = async (id) => {
  try {
    const sqlInt =
      "select t.cosupevisor_id, CONCAT_WS(' ', te.name , te.surname) AS int_supervisor_name from thesis_cosupervisor_teacher t " +
      "inner join teacher te on t.cosupevisor_id = te.id where t.thesis_id = ?";
    const [rowInt] = await pool.execute(sqlInt, [id]);
    /* return rowInt.map((item) => {
      return item.cosupevisor_id;
    }); */
    return rowInt;
  } catch (err) {
    console.error("Error in getThesisIntCosupervisorForProfessor: ", err);
    throw err;
  }
};

exports.getThesisGroups = async (id) => {
  try {
    //get thesis group
    const sql = "select group_id from thesis_group where thesis_id = ?";
    const [rows] = await pool.execute(sql, [id]);
    return rows.map((x) => x.group_id);
  } catch (err) {
    console.error("Error in getThesisGroupForProfessor: ", err);
    throw err;
  }
};

// Creates a new thesis row in thesis table, must receive every data of thesis, returns newly created row, including autoicremented id ( used to add new rows in successive tables)
exports.createRequest = async (thesisRequest) => {
  try {
    const sql =
      "INSERT INTO thesis_request (title, student_id, description, supervisor_id, status_code) VALUES (?, ?, ?,?, 0)";
    const [rows] = await pool.execute(sql, [
      thesisRequest.title,
      thesisRequest.student_id,
      thesisRequest.description,
      thesisRequest.supervisor_id,
    ]);

    const thesisRequestRow = { id: rows.insertId, ...thesisRequest };
    return thesisRequestRow;
  } catch (error) {
    console.error("Error in createRequest: ", error);
    throw error;
  }
};

//status =>
//0: secretary have to accept
//1: accepted by the secretary
//2: professor have to accepts
//3: accepted
//4: rejected by secretary
//5: rejected by professor
exports.secretaryThesisRequest = async (request_id, change) => {
  try {
    const sql = `UPDATE thesis_request SET status_code = ? WHERE id = ?`;
    const [rows] = await pool.execute(sql, [change, request_id]);
    return rows.info;
  } catch (error) {
    throw error;
  }
};
exports.teachersThesisRequest = async (request_id, change) => {
  try {
    let start_date = new Date();
    const sql = `UPDATE thesis_request SET status_code = ?, start_date = ? WHERE id = ?`;
    const [rows] = await pool.execute(sql, [change, start_date, request_id]);
    return rows.info;
  } catch (error) {
    throw error;
  }
};
exports.getRequestsForProfessor = async (email) => {
  try {
    const sql =
      "SELECT " +
      "tr.id, " +
      "tr.student_id, " +
      "CONCAT(s.name, ' ', s.surname) AS student_fullname, " +
      "tr.title, " +
      "tr.description, " +
      "tr.supervisor_id, " +
      "CONCAT(t.name, ' ', t.surname) AS professor_fullname " +
      "FROM thesis_request tr " +
      "INNER JOIN student s ON s.id = tr.student_id " +
      "INNER JOIN teacher t ON t.id = tr.supervisor_id " +
      "WHERE tr.status_code = 1 AND t.email = ?";

    const [rows] = await pool.execute(sql, [email]);

    for (const r of rows) {
      const sql2 =
        "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?";
      const [rows2] = await pool.execute(sql2, [r.id]);

      let cosup = rows2.map((row) => row.cosup_fullname);
      r.cosup_fullname = cosup;
    }

    return rows;
  } catch (err) {
    console.error("Error in getRequestsForProfessor: ", err);
    throw err;
  }
};

exports.getRequestsForSecretary = async () => {
  try {
    const sql =
      "select " +
      "tr.id, " +
      "tr.student_id, " +
      "concat(s.name,' ', s.surname) as student_fullname, " +
      "tr.title, " +
      "tr.description, " +
      "tr.supervisor_id, " +
      "concat(t.name, ' ', t.surname) as professor_fullname " +
      "from thesis_request tr " +
      "inner join student s on s.id = tr.student_id " +
      "inner join teacher t on t.id = tr.supervisor_id " +
      "where tr.status_code = 0";

    const [rows] = await pool.execute(sql);

    for (const r of rows) {
      const sql2 =
        "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?";
      const [rows2] = await pool.execute(sql2, [r.id]);

      let cosup = rows2.map((row) => row.cosup_fullname);
      r.cosup_fullname = cosup;
    }

    return rows;
  } catch (err) {
    console.error("Error in getRequestsForSecretary: ", err);
    throw err;
  }
};

exports.getStudentExams = async (studentID) => {
  try {
    const sql = "select * FROM career WHERE id=?";
    const [rows] = await pool.execute(sql, [studentID]);
    return rows;
  } catch (err) {
    console.error("Error in getStudentExams: ", err);
    throw err;
  }
};

exports.getStudent = async (studentID) => {
  try {
    const sql = "select * FROM student WHERE id=?";
    const [rows] = await pool.execute(sql, [studentID]);
    return rows;
  } catch (err) {
    console.error("Error in getStudentExams: ", err);
    throw err;
  }
};

exports.getCountStudentRequestNotRejected = async (studentID) => {
  try {
    const sql =
      "select count(*) as tot from thesis_request r where r.student_id = ? and status_code <> 4 and status_code <> 5";
    const [rows] = await pool.execute(sql, [studentID]);
    return rows[0].tot;
  } catch (err) {
    console.error("Error in getCountStudentRequestNotRejected: ", err);
    throw err;
  }
};
