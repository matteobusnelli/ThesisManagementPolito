"use strict";

const { isStudent, isProfessor, isLoggedIn, isSecretary, isSecretaryOrProfessor } = require("../controllers/middleware");
const { getProposals, getProposal, getProposalsProfessor } = require("../controllers/showThesis");
const { newApplication, updateApplicationStatus, getApplications, getApplicationStudent, isApplied, hasAlreadyRequest } = require("../controllers/manageApplication");
const { addFiles, getAllFiles, getStudentFilesList, getFile } = require("../controllers/manageFiles");
const { newThesis, updateThesis, updateThesesArchivationManual, getThesisForProfessorById, deleteProposal, newRequest } = require("../controllers/manageThesis");
const { listExternalCosupervisors, createExternalCosupervisor, getTeachersList, listGroups, listDegrees } = require("../controllers/others");

const dao = require("../dao");
const dayjs = require("dayjs");
const { validationResult } = require("express-validator");
const fs = require("fs");
const nodemailer = require("nodemailer");

jest.mock("../dao");
jest.mock("express-validator");
jest.mock("fs");
jest.mock("nodemailer", () => {
    const mockTransporter = {
        sendMail: jest.fn()
    };
    return {
        createTransport: jest.fn(() => mockTransporter)
    };
});

const mockTransporter = nodemailer.createTransport();



beforeEach(() => {
    jest.clearAllMocks();
});



describe("isLoggedIn", () => {

    test("Should grant access to an authenticated user", () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true)
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isLoggedIn(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('Should return 401 if user is not authenticated', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(false)
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isLoggedIn(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

});

describe("isStudent", () => {

    test("Should grant access to an authenticated student", () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isStudent(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('Should return 401 if student is not authenticated', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(false),
            user: {
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isStudent(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not student' });
    });

    test('Should return 401 if the user is not a student', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "NOT_STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isStudent(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not student' });
    });

});

describe("isProfessor", () => {

    test("Should grant access to an authenticated student", () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('Should return 401 if student is not authenticated', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(false),
            user: {
                user_type: "PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not professor' });
    });

    test('Should return 401 if the user is not a student', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "NOT_PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not professor' });
    });

});

describe("getProposals", () => {

    test("Should get a list of thesis proposals", async () => {
        const mockReq = {
            user: {
                username: "username",
                user_type: "STUD"
            },
            query: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const output = "output";
        dao.getProposals.mockResolvedValue(output);

        await getProposals(mockReq, mockRes);

        expect(dao.getProposals).toHaveBeenCalledTimes(1)
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(output);
    });

    test("Should return 500 - internal server error", async () => {
        const mockReq = {
            user: {
                username: "username",
                user_type: "STUD"
            },
            query: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        dao.getProposals.mockRejectedValue("Database error");

        await getProposals(mockReq, mockRes);

        expect(dao.getProposals).toHaveBeenCalledTimes(1)
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("getProposal", () => {

    test("Should get all the fields of a thesis proposal", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            user: {
                username: "username",
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const output = "output";
        dao.getProposalById.mockResolvedValue(output);

        await getProposal(mockReq, mockRes);

        expect(dao.getProposalById).toHaveBeenCalledTimes(1)
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(output);
    });

    test("Should return 500 - \"thesis_id\" is not a number", async () => {
        const mockReq = {
            params: {
                id: "not a number"
            },
            user: {
                username: "username",
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getProposal(mockReq, mockRes);

        expect(dao.getProposalById).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(new Error('Thesis ID must be an integer'));
    });

    test("Should return 500 - internal server error", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            user: {
                username: "username",
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        dao.getProposalById.mockRejectedValue("Database error");

        await getProposal(mockReq, mockRes);

        expect(dao.getProposalById).toHaveBeenCalledTimes(1)
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("newApplication", () => {

    test("Should create a new application if the thesis is valid and the student hasn't already applied for it; then sends an email", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            params: {
                thesis_id: 1
            },
            body: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S123456");
        dao.isThesisValid.mockResolvedValue(true);
        dao.isAlreadyExisting.mockResolvedValue(false);
        dao.newApply.mockResolvedValue(true);
        dao.commit.mockResolvedValue(true);
        dao.getDataTeacherApplicationEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockImplementation((mailOptions, callback) => {
            callback(null, 'Mocked info');
        });

        await newApplication(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.isThesisValid).toHaveBeenCalledTimes(1);
        expect(dao.isAlreadyExisting).toHaveBeenCalledTimes(1);
        expect(dao.newApply).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.getDataTeacherApplicationEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith("Application created successfully");
    });

    test("Should create a new application if the thesis is valid and the student hasn't already applied for it; generates an error while sending the email", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            params: {
                thesis_id: 1
            },
            body: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S123456");
        dao.isThesisValid.mockResolvedValue(true);
        dao.isAlreadyExisting.mockResolvedValue(false);
        dao.newApply.mockResolvedValue(true);
        dao.commit.mockResolvedValue(true);
        dao.getDataTeacherApplicationEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockImplementation((mailOptions, callback) => {
            callback(new Error('Email error'), null);
        });

        await newApplication(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.isThesisValid).toHaveBeenCalledTimes(1);
        expect(dao.isAlreadyExisting).toHaveBeenCalledTimes(1);
        expect(dao.newApply).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.getDataTeacherApplicationEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith("Application created successfully");
    });

    test("Should return 422 - \"thesis_id\" is not an integer", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            params: {
                thesis_id: "Not a number"
            },
            body: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await newApplication(mockReq, mockRes);

        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getUserID).not.toHaveBeenCalled();
        expect(dao.isThesisValid).not.toHaveBeenCalled();
        expect(dao.isAlreadyExisting).not.toHaveBeenCalled();
        expect(dao.newApply).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataTeacherApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith("Thesis ID must be an integer");
    });

    test("Should return 422 - The thesis is not valid", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            params: {
                thesis_id: 1
            },
            body: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S123456");
        dao.isThesisValid.mockResolvedValue(false);
        dao.rollback.mockResolvedValue(true);

        await newApplication(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.isThesisValid).toHaveBeenCalledTimes(1);
        expect(dao.isAlreadyExisting).not.toHaveBeenCalled();
        expect(dao.newApply).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataTeacherApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith("This thesis is not valid");
    });

    test("Should return 422 - The student is already applied for the thesis", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            params: {
                thesis_id: 1
            },
            body: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S123456");
        dao.isThesisValid.mockResolvedValue(true);
        dao.isAlreadyExisting.mockResolvedValue(true);
        dao.rollback.mockResolvedValue(true);

        await newApplication(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.isThesisValid).toHaveBeenCalledTimes(1);
        expect(dao.isAlreadyExisting).toHaveBeenCalledTimes(1);
        expect(dao.newApply).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataTeacherApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith("You cannot apply");
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            params: {
                thesis_id: 1
            },
            body: {
                date: dayjs()
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockRejectedValue("Database error");
        dao.rollback.mockResolvedValue(true);

        await newApplication(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.isThesisValid).not.toHaveBeenCalled();
        expect(dao.isAlreadyExisting).not.toHaveBeenCalled();
        expect(dao.newApply).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataTeacherApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("newThesis", () => {

    test("Should create a new thesis proposal", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const thesis_group = {
            thesis_id: 1,
            group_id: mockReq.body.cod_group
        };
        const thesis_internal_cosupervisors = [
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_external[0]
            },
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_external[1]
            },
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_external[2]
            }
        ];
        const thesis_external_cosupervisors = [
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_internal[0]
            },
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_internal[1]
            }
        ];
        const thesis = {
            id: 1,
            title: mockReq.body.title,
            description: mockReq.body.description,
            supervisor_id: mockReq.body.supervisor_id,
            thesis_level: "thesis_level",
            type_name: mockReq.body.type_name,
            required_knowledge: mockReq.body.required_knowledge,
            notes: mockReq.body.notes,
            expiration: mockReq.body.expiration,
            cod_degree: mockReq.body.cod_degree,
            is_archived: mockReq.body.is_archived,
            keywords: mockReq.body.keywords,
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.getDegrees.mockResolvedValue([{ cod: "DEGR01" }]);
        dao.getCodes_group.mockResolvedValue(["GRP001"]);
        dao.createThesis.mockResolvedValue(thesis);
        dao.createThesis_group.mockResolvedValue(thesis_group);
        dao.createThesis_cosupervisor_teacher.mockResolvedValueOnce(thesis_internal_cosupervisors[0]);
        dao.createThesis_cosupervisor_teacher.mockResolvedValueOnce(thesis_internal_cosupervisors[1]);
        dao.createThesis_cosupervisor_external.mockResolvedValueOnce(thesis_external_cosupervisors[0]);
        dao.createThesis_cosupervisor_external.mockResolvedValueOnce(thesis_external_cosupervisors[1]);
        dao.createThesis_cosupervisor_external.mockResolvedValueOnce(thesis_external_cosupervisors[2]);
        dao.commit.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(dao.getCodes_group).toHaveBeenCalledTimes(1);
        expect(dao.createThesis).toHaveBeenCalledTimes(1);
        expect(dao.createThesis_group).toHaveBeenCalledTimes(1);
        expect(dao.createThesis_cosupervisor_teacher).toHaveBeenCalledTimes(2);
        expect(dao.createThesis_cosupervisor_external).toHaveBeenCalledTimes(3);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(thesis);
    });

    test("Should return 422 - express-validator has found some errors", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => false)
        };

        validationResult.mockReturnValue(mockedValidationResult);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json.mock.calls[0][0]).toHaveProperty("errors");
    });

    test("Should return 400 - The provided \"supervisor_id\" doesn't represent a teacher", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P444444",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.rollback.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Supervisor_id: ${mockReq.body.supervisor_id} is not a teacher` });
    });

    test("Should return 400 - At least one of the provided internal cosupervisors is not a teacher", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333",
                    "P444444"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.rollback.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Internal cosupervisor_id: ${mockReq.body.cosupervisors_internal[2]} is not a teacher` });
    });

    test("Should return 400 - At least one of the provided external cosupervisors is not a valid cosupervisor", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext4@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.rollback.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `External cosupervisor email: ${mockReq.body.cosupervisors_external[2]} is not a valid external cosupervisor email` });
    });

    test("Should return 400 - The provided \"cod_degree\" doesn't represent a degree", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR02",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.getDegrees.mockResolvedValue([{ cod: "DEGR01" }]);
        dao.rollback.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Cod_degree: ${mockReq.body.cod_degree} is not a valid degree code` });
    });

    test("Should return 400 - The provided \"cod_group\" doesn't represent a group", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP002",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.getDegrees.mockResolvedValue([{ cod: "DEGR01" }]);
        dao.getCodes_group.mockResolvedValue(["GRP001"]);
        dao.rollback.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(dao.getCodes_group).toHaveBeenCalledTimes(1);
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Cod_group: ${mockReq.body.cod_group} is not a valid research group code` });
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockRejectedValue("Database error");
        dao.rollback.mockResolvedValue(true);

        await newThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.createThesis).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(503);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
    });

});

describe("listExternalCosupervisors", () => {

    test("Should retrieve the list of all the external cosupervisors", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const output = ["cos_ext_1", "cos_ext_2", "cos_ext_3"];

        dao.getExternal_cosupervisors.mockResolvedValue(output);

        await listExternalCosupervisors(mockReq, mockRes);

        expect(dao.getExternal_cosupervisors).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(output);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getExternal_cosupervisors.mockRejectedValue("Database error");

        await listExternalCosupervisors(mockReq, mockRes);

        expect(dao.getExternal_cosupervisors).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("createExternalCosupervisor", () => {

    test("Should create a new external cosupervisor", async () => {
        const mockReq = {
            body: {
                name: "cos",
                surname: "ext",
                email: "cos.ext4@mail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.create_external_cosupervisor.mockResolvedValue({ ...mockReq.body })
        dao.commit.mockResolvedValue(true);

        await createExternalCosupervisor(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.create_external_cosupervisor).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ ...mockReq.body });
    });

    test("Should return 422 - express-validator has found some errors", async () => {
        const mockReq = {
            body: {
                name: "cos",
                surname: "ext",
                email: "cos.ext4@mail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockedValidationResult = {
            isEmpty: jest.fn(() => false),
        };

        validationResult.mockReturnValue(mockedValidationResult);

        await createExternalCosupervisor(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.create_external_cosupervisor).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json.mock.calls[0][0]).toHaveProperty("errors");
    });

    test("Should return 400 - The provided \"email\" belongs to an already existing external cosupervisor", async () => {
        const mockReq = {
            body: {
                name: "cos",
                surname: "ext",
                email: "cos.ext1@mail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.rollback.mockResolvedValue(true);

        await createExternalCosupervisor(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.create_external_cosupervisor).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `External cosupervisor email: ${mockReq.body.email} is already present in db` });
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            body: {
                name: "cos",
                surname: "ext",
                email: "cos.ext1@mail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockRejectedValue("Database error");
        dao.rollback.mockResolvedValue(true);

        await createExternalCosupervisor(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.create_external_cosupervisor).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(503);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
    });

});

describe("updateApplicationStatus", () => {

    test("Should accept a student application, cancels all other applications for that student and rejects every other student application for that same thesis; then send an email", async () => {
        const mockReq = {
            body: {
                student_id: "S222222",
                thesis_id: 1,
                status: "Accepted"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockApplications = [
            {
                student_id: "S111111",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 2,
                application_date: dayjs(),
                status: "status"
            }
        ];

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getApplications.mockResolvedValue(mockApplications);
        dao.updateApplicationStatus.mockResolvedValue(mockReq.body);
        dao.rejectApplicationsExcept.mockResolvedValue(mockReq.body);
        dao.commit.mockResolvedValue(true);
        dao.getDataStudentApplicationEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockImplementation((mailOptions, callback) => {
            callback(null, 'Mocked info');
        });

        await updateApplicationStatus(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).toHaveBeenCalledTimes(1);
        expect(dao.updateApplicationStatus).toHaveBeenCalledTimes(1);
        expect(dao.rejectApplicationsExcept).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.getDataStudentApplicationEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockReq.body);
    });

    test("Should accept a student application, cancels all other applications for that student and rejects every other student application for that same thesis; generates an error while sending the email", async () => {
        const mockReq = {
            body: {
                student_id: "S222222",
                thesis_id: 1,
                status: "Accepted"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockApplications = [
            {
                student_id: "S111111",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 2,
                application_date: dayjs(),
                status: "status"
            }
        ];

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getApplications.mockResolvedValue(mockApplications);
        dao.updateApplicationStatus.mockResolvedValue(mockReq.body);
        dao.rejectApplicationsExcept.mockResolvedValue(mockReq.body);
        dao.commit.mockResolvedValue(true);
        dao.getDataStudentApplicationEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockImplementation((mailOptions, callback) => {
            callback(new Error('Email error'), null);
        });

        await updateApplicationStatus(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).toHaveBeenCalledTimes(1);
        expect(dao.updateApplicationStatus).toHaveBeenCalledTimes(1);
        expect(dao.rejectApplicationsExcept).toHaveBeenCalledTimes(1);
        expect(dao.getDataStudentApplicationEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockReq.body);
    });

    test("Should just update an application' status if no student has been accepted", async () => {
        const mockReq = {
            body: {
                student_id: "S222222",
                thesis_id: 1,
                status: "Not accepted"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockApplications = [
            {
                student_id: "S111111",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 2,
                application_date: dayjs(),
                status: "status"
            }
        ];

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getApplications.mockResolvedValue(mockApplications);
        dao.updateApplicationStatus.mockResolvedValue(mockReq.body);
        dao.commit.mockResolvedValue(true);
        dao.getDataStudentApplicationEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockResolvedValue(true);

        await updateApplicationStatus(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).toHaveBeenCalledTimes(1);
        expect(dao.updateApplicationStatus).toHaveBeenCalledTimes(1);
        expect(dao.rejectApplicationsExcept).not.toHaveBeenCalled();
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.getDataStudentApplicationEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockReq.body);
    });

    test("Should return 422 - express-validator has found some errors", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => false)
        };

        validationResult.mockReturnValue(mockedValidationResult);

        await updateApplicationStatus(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getApplications).not.toHaveBeenCalled();
        expect(dao.updateApplicationStatus).not.toHaveBeenCalled();
        expect(dao.rejectApplicationsExcept).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataStudentApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json.mock.calls[0][0]).toHaveProperty("errors");
    });

    test("Should return 400 - No application found", async () => {
        const mockReq = {
            body: {
                student_id: "S333333",
                thesis_id: 1,
                status: "Accepted"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockApplications = [
            {
                student_id: "S111111",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 2,
                application_date: dayjs(),
                status: "status"
            }
        ];

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getApplications.mockResolvedValue(mockApplications);

        await updateApplicationStatus(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).toHaveBeenCalledTimes(1);
        expect(dao.updateApplicationStatus).not.toHaveBeenCalled();
        expect(dao.rejectApplicationsExcept).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataStudentApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
            ` error: Application of student: ${mockReq.body.student_id} for thesis with id: ${mockReq.body.thesis_id} not found `
        );
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            body: {
                student_id: "S222222",
                thesis_id: 1,
                status: "Not accepted"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockRejectedValue("Database error");
        dao.rollback.mockResolvedValue(true);

        await updateApplicationStatus(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).not.toHaveBeenCalled();
        expect(dao.updateApplicationStatus).not.toHaveBeenCalled();
        expect(dao.rejectApplicationsExcept).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataStudentApplicationEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(503);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("getApplicationStudent", () => {

    test("Should return all applications submitted by a student", async () => {
        const mockReq = {
            params: {
                student_id: "S123456"
            },
            user: {
                username: "username",
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockOutput = [
            {
                status: "status",
                cosupervisors: ["name1 surname1", "name2 surname2"],
                department_name: "department_name",
                description: 1,
                expiration: "2022-01-01 00:00:00",
                group_name: [{ department: "department_name", group: "group_name" }, { department: "department_name2", group: "group_name2" }],
                id: 1,
                is_archived: true,
                keywords: ["keywords"],
                name: "name",
                notes: "notes",
                required_knowledge: "required_knowledge",
                surname: "surname",
                thesis_level: "thesis_level",
                thesis_type: "thesis_type",
                title: "title",
                title_degree: "title_degree"
            },
            {
                status: "status",
                cosupervisors: ["name1 surname1", "name2 surname2"],
                department_name: "department_name",
                description: 1,
                expiration: "2022-01-01 00:00:00",
                group_name: [{ department: "department_name", group: "group_name" }, { department: "department_name2", group: "group_name2" }],
                id: 2,
                is_archived: true,
                keywords: ["keywords"],
                name: "name",
                notes: "notes",
                required_knowledge: "required_knowledge",
                surname: "surname",
                thesis_level: "thesis_level",
                thesis_type: "thesis_type",
                title: "title",
                title_degree: "title_degree"
            }
        ]

        dao.getUserID.mockResolvedValue("S123456");
        dao.getStudentApplication.mockResolvedValue(
            [
                {
                    thesis_id: 1,
                    status: "status"
                },
                {
                    thesis_id: 2,
                    status: "status"
                },
            ]
        );
        dao.getProposalById
            .mockResolvedValueOnce(
                {
                    cosupervisors: ["name1 surname1", "name2 surname2"],
                    department_name: "department_name",
                    description: 1,
                    expiration: "2022-01-01 00:00:00",
                    group_name: [{ department: "department_name", group: "group_name" }, { department: "department_name2", group: "group_name2" }],
                    id: 1,
                    is_archived: true,
                    keywords: ["keywords"],
                    name: "name",
                    notes: "notes",
                    required_knowledge: "required_knowledge",
                    surname: "surname",
                    thesis_level: "thesis_level",
                    thesis_type: "thesis_type",
                    title: "title",
                    title_degree: "title_degree"
                }
            )
            .mockResolvedValueOnce(
                {
                    cosupervisors: ["name1 surname1", "name2 surname2"],
                    department_name: "department_name",
                    description: 1,
                    expiration: "2022-01-01 00:00:00",
                    group_name: [{ department: "department_name", group: "group_name" }, { department: "department_name2", group: "group_name2" }],
                    id: 2,
                    is_archived: true,
                    keywords: ["keywords"],
                    name: "name",
                    notes: "notes",
                    required_knowledge: "required_knowledge",
                    surname: "surname",
                    thesis_level: "thesis_level",
                    thesis_type: "thesis_type",
                    title: "title",
                    title_degree: "title_degree"
                }
            );

        await getApplicationStudent(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getStudentApplication).toHaveBeenCalledTimes(1);
        expect(dao.getProposalById).toHaveBeenCalledTimes(2);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockOutput);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            params: {
                student_id: "S123456"
            },
            user: {
                username: "username",
                user_type: "STUD"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getUserID.mockRejectedValue("Database error");

        await getApplicationStudent(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getStudentApplication).not.toHaveBeenCalled();
        expect(dao.getProposalById).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("getApplications", () => {

    test("Should return all applications offered by a professor that are still pending", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getApplicationsForProfessor.mockResolvedValue("result");

        await getApplications(mockReq, mockRes);

        expect(dao.getApplicationsForProfessor).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith("result");
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getApplicationsForProfessor.mockRejectedValue("Database error");

        await getApplications(mockReq, mockRes);

        expect(dao.getApplicationsForProfessor).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("isSecretary", () => {

    test("Should grant access to an authenticated secretary", () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "SECR"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretary(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('Should return 401 if secretary is not authenticated', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(false),
            user: {
                user_type: "SECR"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretary(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not secretary' });
    });

    test('Should return 401 if the user is not a secretary', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "NOT_PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretary(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not secretary' });
    });

});

describe("isSecretaryOrProfessor", () => {

    test("Should grant access to an authenticated secretary or an authenticated professor - case secretary", () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "SECR"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretaryOrProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test("Should grant access to an authenticated secretary or an authenticated professor - case professor", () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretaryOrProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('Should return 401 if professor or secretary is not authenticated', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(false),
            user: {
                user_type: "PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretaryOrProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not professor or secretary' });
    });

    test('Should return 401 if the user is not a secretary or professor', () => {
        const mockReq = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            user: {
                user_type: "NOT_PROF"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        isSecretaryOrProfessor(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not professor or secretary' });
    });

});

describe("isApplied", () => {

    test("Should return 200 - The student is applied to some thesis proposal", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockApplications = [
            {
                student_id: "S111111",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 2,
                application_date: dayjs(),
                status: "status"
            }
        ];

        dao.getUserID.mockResolvedValue("S111111");
        dao.getApplications.mockResolvedValue(mockApplications);

        await isApplied(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(1);
    });

    test("Should return 200 - The student is NOT applied to some thesis proposal", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockApplications = [
            {
                student_id: "S111111",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                application_date: dayjs(),
                status: "status"
            },
            {
                student_id: "S222222",
                thesis_id: 2,
                application_date: dayjs(),
                status: "status"
            }
        ];

        dao.getUserID.mockResolvedValue("S333333");
        dao.getApplications.mockResolvedValue(mockApplications);

        await isApplied(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(0);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getUserID.mockRejectedValue("Database error");

        await isApplied(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getApplications).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("error: Database error");
    });

});

describe("getTeachersList", () => {

    test("Should return 200 - Retrieve the list of all the teachers", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getTeachersList.mockResolvedValue(true);

        await getTeachersList(mockReq, mockRes);

        expect(dao.getTeachersList).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(true);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getTeachersList.mockRejectedValue("Database error");

        await getTeachersList(mockReq, mockRes);

        expect(dao.getTeachersList).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("listGroups", () => {

    test("Should return 200 - Retrieve the list of all the groups", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getGroups.mockResolvedValue(true);

        await listGroups(mockReq, mockRes);

        expect(dao.getGroups).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(true);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getGroups.mockRejectedValue("Database error");

        await listGroups(mockReq, mockRes);

        expect(dao.getGroups).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("listDegrees", () => {

    test("Should return 200 - Retrieve the list of all the degrees", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getDegrees.mockResolvedValue(true);

        await listDegrees(mockReq, mockRes);

        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(true);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getDegrees.mockRejectedValue("Database error");

        await listDegrees(mockReq, mockRes);

        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("getProposalsProfessor", () => {

    test("Should return 200 - Retrieve all the thesis proposals of a given supervisor", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockProposals =
            [
                {
                    id: 1,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: new Date(),
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords"
                },
                {
                    id: 2,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: new Date(),
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords"
                }
            ];
        const mockExternalCosupervisor =
            [
                [
                    {
                        cosupevisor_id: "E1",
                        ext_supervisor_name: "name surname 1"
                    },
                    {
                        cosupevisor_id: "E2",
                        ext_supervisor_name: "name surname 2"
                    }
                ],
                [
                    {
                        cosupevisor_id: "E3",
                        ext_supervisor_name: "name surname 3"
                    }
                ]
            ];
        const mockInternalCosupervisor =
            [
                [
                    {
                        cosupevisor_id: "I1",
                        int_supervisor_name: "name surname 1"
                    }
                ],
                [
                    {
                        cosupevisor_id: "I2",
                        int_supervisor_name: "name surname 2"
                    },
                    {
                        cosupevisor_id: "I3",
                        int_supervisor_name: "name surname 3"
                    }
                ]
            ];
        const mockResult =
            [
                {
                    id: 1,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: mockProposals[0].expiration,
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords",
                    external_cosupervisors:
                        [
                            {
                                cosupevisor_id: "E1",
                                ext_supervisor_name: "name surname 1"
                            },
                            {
                                cosupevisor_id: "E2",
                                ext_supervisor_name: "name surname 2"
                            }
                        ],
                    internal_cosupervisors:
                        [
                            {
                                cosupevisor_id: "I1",
                                int_supervisor_name: "name surname 1"
                            }
                        ]
                },
                {
                    id: 2,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: mockProposals[1].expiration,
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords",
                    external_cosupervisors:
                        [
                            {
                                cosupevisor_id: "E3",
                                ext_supervisor_name: "name surname 3"
                            }
                        ],
                    internal_cosupervisors:
                        [
                            {
                                cosupevisor_id: "I2",
                                int_supervisor_name: "name surname 2"
                            },
                            {
                                cosupevisor_id: "I3",
                                int_supervisor_name: "name surname 3"
                            }
                        ]
                }
            ];

        dao.getProposalsProfessor.mockResolvedValue(mockProposals);
        dao.getThesisExCosupervisorForProfessorById.mockResolvedValueOnce(mockExternalCosupervisor[0])
            .mockResolvedValueOnce(mockExternalCosupervisor[1]);
        dao.getThesisIntCosupervisorForProfessor.mockResolvedValueOnce(mockInternalCosupervisor[0])
            .mockResolvedValueOnce(mockInternalCosupervisor[1]);

        await getProposalsProfessor(mockReq, mockRes);

        expect(dao.getProposalsProfessor).toHaveBeenCalledTimes(1);
        expect(dao.getThesisExCosupervisorForProfessorById).toHaveBeenCalledTimes(2);
        expect(dao.getThesisIntCosupervisorForProfessor).toHaveBeenCalledTimes(2);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    test("Should return 200 - Retrieve all the thesis proposals of a given supervisor - No cosupervisors", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockProposals =
            [
                {
                    id: 1,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: new Date(),
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords"
                },
                {
                    id: 2,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: new Date(),
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords"
                }
            ];
        const mockExternalCosupervisor = [
            [],
            []
        ];
        const mockInternalCosupervisor = [
            [],
            []
        ];
        const mockResult =
            [
                {
                    id: 1,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: mockProposals[0].expiration,
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords",
                    external_cosupervisors: [],
                    internal_cosupervisors: []
                },
                {
                    id: 2,
                    title: "title",
                    description: "description",
                    supervisor_id: "P111111",
                    thesis_level: "level",
                    thesis_type: "type",
                    required_knowledge: "knowledge",
                    notes: "notes",
                    expiration: mockProposals[1].expiration,
                    cod_degree: "cod",
                    is_archived: false,
                    is_expired: false,
                    is_deleted: false,
                    keywords: "keywords",
                    external_cosupervisors: [],
                    internal_cosupervisors: []
                }
            ];

        dao.getProposalsProfessor.mockResolvedValue(mockProposals);
        dao.getThesisExCosupervisorForProfessorById.mockResolvedValueOnce(mockExternalCosupervisor[0])
            .mockResolvedValueOnce(mockExternalCosupervisor[1]);
        dao.getThesisIntCosupervisorForProfessor.mockResolvedValueOnce(mockInternalCosupervisor[0])
            .mockResolvedValueOnce(mockInternalCosupervisor[1]);

        await getProposalsProfessor(mockReq, mockRes);

        expect(dao.getProposalsProfessor).toHaveBeenCalledTimes(1);
        expect(dao.getThesisExCosupervisorForProfessorById).toHaveBeenCalledTimes(2);
        expect(dao.getThesisIntCosupervisorForProfessor).toHaveBeenCalledTimes(2);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getProposalsProfessor.mockRejectedValue("Database error");

        await getProposalsProfessor(mockReq, mockRes);

        expect(dao.getProposalsProfessor).toHaveBeenCalledTimes(1);
        expect(dao.getThesisExCosupervisorForProfessorById).not.toHaveBeenCalled();
        expect(dao.getThesisIntCosupervisorForProfessor).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("updateThesis", () => {

    test("Should return 200 - Thesis proposal successfully updated", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const thesis_group = {
            thesis_id: 1,
            group_id: mockReq.body.cod_group
        };
        const thesis_internal_cosupervisors = [
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_external[0]
            },
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_external[1]
            },
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_external[2]
            }
        ];
        const thesis_external_cosupervisors = [
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_internal[0]
            },
            {
                thesis_id: 1,
                thesis_cosupervisor: mockReq.body.cosupervisors_internal[1]
            }
        ];
        const thesis = {
            thesis_id: mockReq.params.id,
            title: mockReq.body.title,
            description: mockReq.body.description,
            supervisor_id: mockReq.body.supervisor_id,
            thesis_level: "thesis_level",
            type_name: mockReq.body.type_name,
            required_knowledge: mockReq.body.required_knowledge,
            notes: mockReq.body.notes,
            expiration: mockReq.body.expiration,
            cod_degree: mockReq.body.cod_degree,
            is_archived: mockReq.body.is_archived,
            keywords: mockReq.body.keywords,
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.getDegrees.mockResolvedValue([{ cod: "DEGR01" }]);
        dao.getCodes_group.mockResolvedValue(["GRP001"]);
        dao.updateThesis.mockResolvedValue(thesis);
        dao.deleteThesisGroups.mockResolvedValue(true);
        dao.createThesis_group.mockResolvedValue(thesis_group);
        dao.deleteThesisCosupervisorTeacherAll.mockResolvedValue(true);
        dao.createThesis_cosupervisor_teacher.mockResolvedValueOnce(thesis_internal_cosupervisors[0]);
        dao.createThesis_cosupervisor_teacher.mockResolvedValueOnce(thesis_internal_cosupervisors[1]);
        dao.deleteThesisCosupervisorExternalAll.mockResolvedValue(true);
        dao.createThesis_cosupervisor_external.mockResolvedValueOnce(thesis_external_cosupervisors[0]);
        dao.createThesis_cosupervisor_external.mockResolvedValueOnce(thesis_external_cosupervisors[1]);
        dao.createThesis_cosupervisor_external.mockResolvedValueOnce(thesis_external_cosupervisors[2]);
        dao.commit.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(dao.getCodes_group).toHaveBeenCalledTimes(1);
        expect(dao.updateThesis).toHaveBeenCalledTimes(1);
        expect(dao.deleteThesisGroups).toHaveBeenCalledTimes(1);
        expect(dao.createThesis_group).toHaveBeenCalledTimes(1);
        expect(dao.deleteThesisCosupervisorTeacherAll).toHaveBeenCalledTimes(1);
        expect(dao.createThesis_cosupervisor_teacher).toHaveBeenCalledTimes(2);
        expect(dao.deleteThesisCosupervisorExternalAll).toHaveBeenCalledTimes(1);
        expect(dao.createThesis_cosupervisor_external).toHaveBeenCalledTimes(3);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(thesis);
    });

    test("Should return 422 - express-validator has found some errors", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => false)
        };

        validationResult.mockReturnValue(mockedValidationResult);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.isThesisProposalValid).not.toHaveBeenCalled();
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json.mock.calls[0][0]).toHaveProperty("errors");
    });

    test("Should return 400 - The provided thesis id doesn't represent a valid thesis proposal", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P444444",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(false);
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Thesis_id: ${mockReq.params.id} is not a valid thesis proposal` });
    });

    test("Should return 400 - The provided \"supervisor_id\" doesn't represent a teacher", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P444444",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Supervisor_id: ${mockReq.body.supervisor_id} is not a teacher` });
    });

    test("Should return 400 - At least one of the provided internal cosupervisors is not a teacher", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P444444"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Internal cosupervisor_id: ${mockReq.body.cosupervisors_internal[1]} is not a teacher` });
    });

    test("Should return 400 - At least one of the provided external cosupervisors is not a valid cosupervisor", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext4@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `External cosupervisor email: ${mockReq.body.cosupervisors_external[2]} is not a valid external cosupervisor email` });
    });

    test("Should return 400 - The provided \"cod_degree\" doesn't represent a degree", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR02",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.getDegrees.mockResolvedValue([{ cod: "DEGR01" }]);
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Cod_degree: ${mockReq.body.cod_degree} is not a valid degree code` });
    });

    test("Should return 400 - The provided \"cod_group\" doesn't represent a group", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP002",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.isThesisProposalValid.mockResolvedValue(true);
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.getExternal_cosupervisors_emails.mockResolvedValue(["cos.ext1@mail.com", "cos.ext2@mail.com", "cos.ext3@mail.com"]);
        dao.getDegrees.mockResolvedValue([{ cod: "DEGR01" }]);
        dao.getCodes_group.mockResolvedValue(["GRP001"]);
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.getExternal_cosupervisors_emails).toHaveBeenCalledTimes(1);
        expect(dao.getDegrees).toHaveBeenCalledTimes(1);
        expect(dao.getCodes_group).toHaveBeenCalledTimes(1);
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Cod_group: ${mockReq.body.cod_group} is not a valid research group code` });
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            params: {
                id: 1
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date("2025-01-01"),
                cod_degree: "DEGR01",
                is_archived: false,
                keywords: "keywords",
                cod_group: "GRP001",
                cosupervisors_internal: [
                    "P222222",
                    "P333333"
                ],
                cosupervisors_external: [
                    "cos.ext1@mail.com",
                    "cos.ext2@mail.com",
                    "cos.ext3@mail.com"
                ],
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockRejectedValue("Database error");
        dao.rollback.mockResolvedValue(true);

        await updateThesis(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.isThesisProposalValid).not.toHaveBeenCalled();
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.getExternal_cosupervisors_emails).not.toHaveBeenCalled();
        expect(dao.getDegrees).not.toHaveBeenCalled();
        expect(dao.getCodes_group).not.toHaveBeenCalled();
        expect(dao.updateThesis).not.toHaveBeenCalled();
        expect(dao.deleteThesisGroups).not.toHaveBeenCalled();
        expect(dao.createThesis_group).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorTeacherAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.deleteThesisCosupervisorExternalAll).not.toHaveBeenCalled();
        expect(dao.createThesis_cosupervisor_external).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(503);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
    });

});

describe("updateThesesArchivationManual", () => {

    test("Should return 200 - Thesis proposal successfully archived (manual operation)", async () => {
        const mockReq = {
            body: {
                thesis_id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.updateThesesArchivationManual.mockResolvedValue("ok");
        dao.commit.mockResolvedValue(true);

        await updateThesesArchivationManual(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.updateThesesArchivationManual).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith("ok");
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            body: {
                thesis_id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.updateThesesArchivationManual.mockRejectedValue("Database error")
        dao.rollback.mockResolvedValue(true);

        await updateThesesArchivationManual(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.updateThesesArchivationManual).toHaveBeenCalledTimes(1);
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("getThesisForProfessorById", () => {

    test("Should return 200 - Retrieve all the informations about a specified thesis proposal", async () => {
        const mockReq = {
            params: {
                id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockThesis =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            thesis_level: "level",
            thesis_type: "type",
            required_knowledge: "knowledge",
            notes: "notes",
            expiration: new Date(),
            cod_degree: "cod",
            is_archived: false,
            is_expired: false,
            is_deleted: false,
            keywords: "keywords1, keywords2, keywords3",
            supervisor_name: "name surname"
        };
        const mockExternalCosupervisor =
            [
                {
                    cosupevisor_id: "E1",
                    ext_supervisor_name: "name surname E1"
                },
                {
                    cosupevisor_id: "E2",
                    ext_supervisor_name: "name surname E2"
                }
            ];
        const mockInternalCosupervisor =
            [
                {
                    cosupevisor_id: "I1",
                    int_supervisor_name: "name surname I1"
                }
            ];
        const mockGroup = [{ group_id: "GRP01" }];
        const mockResult =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            thesis_level: "level",
            type_name: "type",
            required_knowledge: "knowledge",
            notes: "notes",
            expiration: mockThesis.expiration,
            cod_degree: "cod",
            is_archived: false,
            is_expired: false,
            is_deleted: false,
            keywords: [
                "keywords1",
                "keywords2",
                "keywords3"
            ],
            cosupervisors_external: ["E1", "E2"],
            cosupervisors_internal: ["I1"],
            list_cosupervisors:
                [
                    "name surname E1",
                    "name surname E2",
                    "name surname I1"
                ],
            supervisor_name: "name surname",
            cod_group: { group_id: "GRP01" }
        }

        dao.getThesisForProfessorById.mockResolvedValue(mockThesis);
        dao.getThesisExCosupervisorForProfessorById.mockResolvedValue(mockExternalCosupervisor);
        dao.getThesisIntCosupervisorForProfessor.mockResolvedValue(mockInternalCosupervisor);
        dao.getThesisGroups.mockResolvedValue(mockGroup);

        await getThesisForProfessorById(mockReq, mockRes);

        expect(dao.getThesisForProfessorById).toHaveBeenCalledTimes(1);
        expect(dao.getThesisExCosupervisorForProfessorById).toHaveBeenCalledTimes(1);
        expect(dao.getThesisIntCosupervisorForProfessor).toHaveBeenCalledTimes(1);
        expect(dao.getThesisGroups).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    test("Should return 200 - Retrieve all the informations about a specified thesis proposal - No keywords, No internal cosupervisors, No external cosupervisors", async () => {
        const mockReq = {
            params: {
                id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockThesis =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            thesis_level: "level",
            thesis_type: "type",
            required_knowledge: "knowledge",
            notes: "notes",
            expiration: new Date(),
            cod_degree: "cod",
            is_archived: false,
            is_expired: false,
            is_deleted: false,
            keywords: "",
            supervisor_name: "name surname"
        };
        const mockExternalCosupervisor = [];
        const mockInternalCosupervisor = [];
        const mockGroup = [{ group_id: "GRP01" }];
        const mockResult =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            thesis_level: "level",
            type_name: "type",
            required_knowledge: "knowledge",
            notes: "notes",
            expiration: mockThesis.expiration,
            cod_degree: "cod",
            is_archived: false,
            is_expired: false,
            is_deleted: false,
            keywords: [],
            cosupervisors_external: [],
            cosupervisors_internal: [],
            list_cosupervisors: [],
            supervisor_name: "name surname",
            cod_group:{ group_id: "GRP01" }
        }

        dao.getThesisForProfessorById.mockResolvedValue(mockThesis);
        dao.getThesisExCosupervisorForProfessorById.mockResolvedValue(mockExternalCosupervisor);
        dao.getThesisIntCosupervisorForProfessor.mockResolvedValue(mockInternalCosupervisor);
        dao.getThesisGroups.mockResolvedValue(mockGroup);

        await getThesisForProfessorById(mockReq, mockRes);

        expect(dao.getThesisForProfessorById).toHaveBeenCalledTimes(1);
        expect(dao.getThesisExCosupervisorForProfessorById).toHaveBeenCalledTimes(1);
        expect(dao.getThesisIntCosupervisorForProfessor).toHaveBeenCalledTimes(1);
        expect(dao.getThesisGroups).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            params: {
                id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getThesisForProfessorById.mockRejectedValue("Database error");

        await getThesisForProfessorById(mockReq, mockRes);

        expect(dao.getThesisForProfessorById).toHaveBeenCalledTimes(1);
        expect(dao.getThesisExCosupervisorForProfessorById).not.toHaveBeenCalled();
        expect(dao.getThesisIntCosupervisorForProfessor).not.toHaveBeenCalled();
        expect(dao.getThesisGroups).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("Database error");
    });

});

describe("deleteProposal", () => {

    test("Should return 200 - Should delete a thesis proposal", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                thesis_id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.getProfID.mockResolvedValue("P111111");
        dao.checkBeforeDeleteProposal.mockResolvedValue("ok");
        dao.deleteProposal.mockResolvedValue(true);
        dao.updateApplicationsAfterProposalDeletion.mockResolvedValue(true);
        dao.commit.mockResolvedValue(true);

        await deleteProposal(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getProfID).toHaveBeenCalledTimes(1);
        expect(dao.checkBeforeDeleteProposal).toHaveBeenCalledTimes(1);
        expect(dao.deleteProposal).toHaveBeenCalledTimes(1);
        expect(dao.updateApplicationsAfterProposalDeletion).toHaveBeenCalledTimes(1);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ result: `The proposal has been deleted successfully` });
    });

    test("Should return 400 - Missing field inside req.body", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await deleteProposal(mockReq, mockRes);

        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getProfID).not.toHaveBeenCalled();
        expect(dao.checkBeforeDeleteProposal).not.toHaveBeenCalled();
        expect(dao.deleteProposal).not.toHaveBeenCalled();
        expect(dao.updateApplicationsAfterProposalDeletion).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "bad input format" });
    });

    test("Should return 400 - \"thesis_id\" is not a number", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                thesis_id: "1"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await deleteProposal(mockReq, mockRes);

        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getProfID).not.toHaveBeenCalled();
        expect(dao.checkBeforeDeleteProposal).not.toHaveBeenCalled();
        expect(dao.deleteProposal).not.toHaveBeenCalled();
        expect(dao.updateApplicationsAfterProposalDeletion).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "thesis_id in the body should be a positive integer" });
    });

    test("Should return 400 - \"thesis_id\" is not a positive number", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                thesis_id: -1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await deleteProposal(mockReq, mockRes);

        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getProfID).not.toHaveBeenCalled();
        expect(dao.checkBeforeDeleteProposal).not.toHaveBeenCalled();
        expect(dao.deleteProposal).not.toHaveBeenCalled();
        expect(dao.updateApplicationsAfterProposalDeletion).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "thesis_id in the body should be a positive integer" });
    });

    test("Should return 400 - The specified thesis proposal can't be deleted", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                thesis_id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.getProfID.mockResolvedValue("P111111");
        dao.checkBeforeDeleteProposal.mockResolvedValue("not ok");

        await deleteProposal(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getProfID).toHaveBeenCalledTimes(1);
        expect(dao.checkBeforeDeleteProposal).toHaveBeenCalledTimes(1);
        expect(dao.deleteProposal).not.toHaveBeenCalled();
        expect(dao.updateApplicationsAfterProposalDeletion).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "not ok" });
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                thesis_id: 1
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.beginTransaction.mockResolvedValue(true);
        dao.getProfID.mockResolvedValue("P111111");
        dao.checkBeforeDeleteProposal.mockRejectedValue("Database error");

        await deleteProposal(mockReq, mockRes);

        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getProfID).toHaveBeenCalledTimes(1);
        expect(dao.checkBeforeDeleteProposal).toHaveBeenCalledTimes(1);
        expect(dao.deleteProposal).not.toHaveBeenCalled();
        expect(dao.updateApplicationsAfterProposalDeletion).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
    });

});

describe("newRequest", () => {

    test("Should return 200 - Should create a new request", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                cosupervisors_internal:
                    [
                        "P222222",
                        "P333333"
                    ]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockRequest =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            student_id: "S111111"
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S111111");
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.createRequest.mockResolvedValue(mockRequest);
        dao.createRequest_cosupervisor_teacher.mockResolvedValueOnce({ request_id: 1, thesis_cosupervisor: "P222222" })
            .mockResolvedValueOnce({ request_id: 1, thesis_cosupervisor: "P333333" });
        dao.commit.mockResolvedValue(true);
        dao.getDataProfessorRequestEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockImplementation((mailOptions, callback) => {
            callback(null, 'Mocked info');
        });

        await newRequest(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.createRequest).toHaveBeenCalledTimes(1);
        expect(dao.createRequest_cosupervisor_teacher).toHaveBeenCalledTimes(2);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.getDataProfessorRequestEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockRequest);
    });

    test("Should return 200 - Should create a new request - error while sending an email", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                cosupervisors_internal:
                    [
                        "P222222",
                        "P333333"
                    ]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockRequest =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            student_id: "S111111"
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S111111");
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.createRequest.mockResolvedValue(mockRequest);
        dao.createRequest_cosupervisor_teacher.mockResolvedValueOnce({ request_id: 1, thesis_cosupervisor: "P222222" })
            .mockResolvedValueOnce({ request_id: 1, thesis_cosupervisor: "P333333" });
        dao.commit.mockResolvedValue(true);
        dao.getDataProfessorRequestEmail.mockResolvedValue(true);
        mockTransporter.sendMail.mockImplementation((mailOptions, callback) => {
            callback(new Error('Email error'), null);
        });

        await newRequest(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.createRequest).toHaveBeenCalledTimes(1);
        expect(dao.createRequest_cosupervisor_teacher).toHaveBeenCalledTimes(2);
        expect(dao.commit).toHaveBeenCalledTimes(1);
        expect(dao.getDataProfessorRequestEmail).toHaveBeenCalledTimes(1);
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockRequest);
    });

    test("Should return 422 - express-validator has found some errors", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                cosupervisors_internal:
                    [
                        "P222222",
                        10
                    ]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => false),
        };

        validationResult.mockReturnValue(mockedValidationResult);

        await newRequest(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).not.toHaveBeenCalled();
        expect(dao.getUserID).not.toHaveBeenCalled();
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.createRequest).not.toHaveBeenCalled();
        expect(dao.createRequest_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataProfessorRequestEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json.mock.calls[0][0]).toHaveProperty("errors");
    });

    test("Should return 400 - The provided \"supervisor_id\" doesn't represent any teacher inside the system", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P444444",
                cosupervisors_internal:
                    [
                        "P222222",
                        "P333333"
                    ]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S111111");
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.rollback.mockResolvedValue(true);

        await newRequest(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.createRequest).not.toHaveBeenCalled();
        expect(dao.createRequest_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataProfessorRequestEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Supervisor_id: ${mockReq.body.supervisor_id} is not a teacher` });
    });

    test("Should return 400 - At least one cosupervisor id received inside the body doesn't represent any teacher inside the system", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                cosupervisors_internal:
                    [
                        "P222222",
                        "P444444"
                    ]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };
        const mockRequest =
        {
            id: 1,
            title: "title",
            description: "description",
            supervisor_id: "P111111",
            student_id: "S111111"
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockResolvedValue("S111111");
        dao.getTeachers.mockResolvedValue(["P111111", "P222222", "P333333"]);
        dao.createRequest.mockResolvedValue(mockRequest);
        dao.createRequest_cosupervisor_teacher.mockResolvedValueOnce({ request_id: 1, thesis_cosupervisor: "P222222" });
        dao.rollback.mockResolvedValue(true);

        await newRequest(mockReq, mockRes);

        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).toHaveBeenCalledTimes(1);
        expect(dao.createRequest).toHaveBeenCalledTimes(1);
        expect(dao.createRequest_cosupervisor_teacher).toHaveBeenCalledTimes(1);
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataProfessorRequestEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: `Internal cosupervisor id: ${mockReq.body.cosupervisors_internal[1]} is not a teacher` });
    });

    test("Should return 500 - Internal server error", async () => {
        const mockReq = {
            user: {
                username: "username"
            },
            body: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                cosupervisors_internal:
                    [
                        "P222222",
                        "P333333"
                    ]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockedValidationResult = {
            isEmpty: jest.fn(() => true),
        };

        validationResult.mockReturnValue(mockedValidationResult);
        dao.beginTransaction.mockResolvedValue(true);
        dao.getUserID.mockRejectedValue("Database error");
        dao.rollback.mockResolvedValue(true);

        await newRequest(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(validationResult).toHaveBeenCalledTimes(1);
        expect(dao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(dao.getTeachers).not.toHaveBeenCalled();
        expect(dao.createRequest).not.toHaveBeenCalled();
        expect(dao.createRequest_cosupervisor_teacher).not.toHaveBeenCalled();
        expect(dao.commit).not.toHaveBeenCalled();
        expect(dao.getDataProfessorRequestEmail).not.toHaveBeenCalled();
        expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        expect(dao.rollback).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(503);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
    });

});

describe("hasAlreadyRequest", () => {

    test("Should return 200 - The student has already a request", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getUserID.mockResolvedValue(true);
        dao.getCountStudentRequestNotRejected.mockResolvedValue(1);

        await hasAlreadyRequest(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getCountStudentRequestNotRejected).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(1);
    });

    test("Should return 200 - The student hasn't a request", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getUserID.mockResolvedValue(true);
        dao.getCountStudentRequestNotRejected.mockResolvedValue(0);

        await hasAlreadyRequest(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getCountStudentRequestNotRejected).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(0);
    });

    test("Should return 200 - The student hasn't a request", async () => {
        const mockReq = {
            user: {
                username: "username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        dao.getUserID.mockRejectedValue("Database error");

        await hasAlreadyRequest(mockReq, mockRes);

        expect(dao.getUserID).toHaveBeenCalledTimes(1);
        expect(dao.getCountStudentRequestNotRejected).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith("error: Database error");
    });

});