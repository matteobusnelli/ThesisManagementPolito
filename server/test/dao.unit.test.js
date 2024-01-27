const dao = require("../dao");
const mysql = require("mysql2/promise");
const dayjs = require("dayjs");
const crypto = require("crypto");



jest.mock("crypto", () => {
    return {
        scrypt: jest.fn(),
        timingSafeEqual: jest.fn()
    }
});

jest.mock("mysql2/promise", () => {
    const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
    };
    const mockPool = {
        execute: jest.fn(),
        getConnection: jest.fn(() => mockConnection),
    };
    return {
        createPool: jest.fn(() => mockPool)
    };
});

const mockPool = mysql.createPool();



beforeEach(() => {
    jest.clearAllMocks();
});



describe("isThesisValid", () => {

    test("Should return true if the thesis is not expired or archived", async () => {
        const mockInput = {
            thesisID: 1,
            formattedDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
        };
        const mockExecuteOutput = [
            [{ count: 1 }]
        ];
        mockPool.execute.mockResolvedValue(mockExecuteOutput);

        const result = await dao.isThesisValid(mockInput.thesisID, mockInput.formattedDate);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM thesis WHERE id = ? AND expiration>?",
            [
                mockInput.thesisID,
                mockInput.formattedDate
            ]
        );
        expect(result).toBe(true);
    });

    test("Should return false if the thesis is expired or archived", async () => {
        const mockInput = {
            thesisID: 1,
            formattedDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
        };
        const mockExecuteOutput = [
            [{ count: 0 }]
        ]
        mockPool.execute.mockResolvedValue(mockExecuteOutput);

        const result = await dao.isThesisValid(mockInput.thesisID, mockInput.formattedDate);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM thesis WHERE id = ? AND expiration>?",
            [
                mockInput.thesisID,
                mockInput.formattedDate
            ]
        );
        expect(result).toBe(false);
    });

    test("Should throw an error if there is more than one thesis", async () => {
        const mockInput = {
            thesisID: 1,
            formattedDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
        };
        const mockExecuteOutput = [
            [{ count: 2 }]
        ]
        mockPool.execute.mockResolvedValue(mockExecuteOutput);

        await expect(dao.isThesisValid(mockInput.thesisID, mockInput.formattedDate)).rejects.toStrictEqual(new Error("Database error"));

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM thesis WHERE id = ? AND expiration>?",
            [
                mockInput.thesisID,
                mockInput.formattedDate
            ]
        );
    });

    test("Should handle errors during query execution", async () => {
        const mockInput = {
            thesisID: 1,
            formattedDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.isThesisValid(mockInput.thesisID, mockInput.formattedDate)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM thesis WHERE id = ? AND expiration>?",
            [
                mockInput.thesisID,
                mockInput.formattedDate
            ]
        );
    });

});

describe("isAlreadyExisting", () => {

    test("Should return true if a student is already applied for a thesis", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        const mockExecuteOutput = [
            [{ count: 1 }]
        ]
        mockPool.execute.mockResolvedValue(mockExecuteOutput);

        const result = await dao.isAlreadyExisting(mockInput.studentID, mockInput.thesisID);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM application WHERE student_id = ? and (status ='Accepted' or status ='Pending')",
            [
                mockInput.studentID
            ]
        );
        expect(result).toBe(true);
    });

    test("Should return false if a student is not already applied for a thesis", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        const mockExecuteOutput = [
            [{ count: 0 }]
        ]
        mockPool.execute.mockResolvedValue(mockExecuteOutput);

        const result = await dao.isAlreadyExisting(mockInput.studentID, mockInput.thesisID);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM application WHERE student_id = ? and (status ='Accepted' or status ='Pending')",
            [
                mockInput.studentID
            ]
        );
        expect(result).toBe(false);
    });

    test("Should throw an error if there is more than one couple student_id-thesis_id", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        const mockExecuteOutput = [
            [{ count: 2 }]
        ]
        mockPool.execute.mockResolvedValue(mockExecuteOutput);

        await expect(dao.isAlreadyExisting(mockInput.studentID, mockInput.thesisID)).rejects.toStrictEqual(new Error("Database error"));

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM application WHERE student_id = ? and (status ='Accepted' or status ='Pending')",
            [
                mockInput.studentID
            ]
        );
    });

    test("Should handle errors during query execution", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.isAlreadyExisting(mockInput.studentID, mockInput.thesisID)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) as count FROM application WHERE student_id = ? and (status ='Accepted' or status ='Pending')",
            [
                mockInput.studentID
            ]
        );
    });

});

describe("newApply", () => {

    test("Should insert a new application into the database", async () => {
        const mockInput = {
            studentID: 1,
            thesisID: 1,
            date: dayjs()
        };
        const mockOutput = [1, 2, 3];
        mockPool.execute.mockResolvedValue(mockOutput);

        const result = await dao.newApply(mockInput.studentID, mockInput.thesisID, mockInput.date);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO application (student_id, thesis_id, status, application_date) VALUES (?, ?, ?, ?)",
            [
                mockInput.studentID,
                mockInput.thesisID,
                "pending",
                mockInput.date.format("YYYY-MM-DD HH:mm:ss")
            ]
        );
        expect(result).toStrictEqual("Application successful.");
    });

    test("Should handle duplicate entry error", async () => {
        const mockInput = {
            studentID: 1,
            thesisID: 1,
            date: dayjs()
        };
        const mockExecuteOutput = {
            code: "ER_DUP_ENTRY"
        };
        mockPool.execute.mockRejectedValue(mockExecuteOutput);

        await expect(dao.newApply(mockInput.studentID, mockInput.thesisID, mockInput.date)).rejects.toStrictEqual("You have already applied to this thesis.");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO application (student_id, thesis_id, status, application_date) VALUES (?, ?, ?, ?)",
            [
                mockInput.studentID,
                mockInput.thesisID,
                "pending",
                mockInput.date.format("YYYY-MM-DD HH:mm:ss")
            ]
        )
    });

    test("Should handle other errors", async () => {
        const mockInput = {
            studentID: 1,
            thesisID: 1,
            date: dayjs()
        };
        const mockExecuteOutput = {
            code: "NOT_ER_DUP_ENTRY"
        };
        mockPool.execute.mockRejectedValue(mockExecuteOutput);

        await expect(dao.newApply(mockInput.studentID, mockInput.thesisID, mockInput.date)).rejects.toStrictEqual(mockExecuteOutput);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO application (student_id, thesis_id, status, application_date) VALUES (?, ?, ?, ?)",
            [
                mockInput.studentID,
                mockInput.thesisID,
                "pending",
                mockInput.date.format("YYYY-MM-DD HH:mm:ss")
            ]
        )
    });

});

describe("createThesis", () => {

    test("Should return the new thesis", async () => {
        const mockInput = {
            title: "title",
            description: "description",
            supervisor_id: "t_id",
            thesis_level: "level",
            type_name: "type",
            required_knowledge: "knowledge",
            notes: "notes",
            expiration: new Date(),
            cod_degree: "cod",
            is_archived: false,
            keywords: "keywordss"
        };
        let rows = [{ insertId: 1 }];
        mockPool.execute.mockResolvedValue(rows);

        const result = await dao.createThesis(mockInput);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis (title, description, supervisor_id, thesis_level, thesis_type, required_knowledge, notes, expiration, cod_degree, is_archived, keywords, is_expired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            [mockInput.title, mockInput.description, mockInput.supervisor_id,
            mockInput.thesis_level, mockInput.type_name, mockInput.required_knowledge, mockInput.notes,
            mockInput.expiration, mockInput.cod_degree, mockInput.is_archived, mockInput.keywords]
        );
        expect(result).toStrictEqual({ id: rows[0].insertId, ...mockInput });
    });

    test("Should handle database error and reject", async () => {
        const mockInput = {
            title: "title",
            description: "description",
            supervisor_id: "t_id",
            thesis_level: "level",
            type_name: "type",
            required_knowledge: "knowledge",
            notes: "notes",
            expiration: new Date(),
            cod_degree: "cod",
            is_archived: false,
            keywords: "keywordss"
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.createThesis(mockInput)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis (title, description, supervisor_id, thesis_level, thesis_type, required_knowledge, notes, expiration, cod_degree, is_archived, keywords, is_expired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            [mockInput.title, mockInput.description, mockInput.supervisor_id,
            mockInput.thesis_level, mockInput.type_name, mockInput.required_knowledge, mockInput.notes,
            mockInput.expiration, mockInput.cod_degree, mockInput.is_archived, mockInput.keywords]
        );
    });
});

describe("getTeacher", () => {

    test("Should return the arrays of teachers id", async () => {
        const mockRows = [[{ id: 1 }, { id: 2 }, { id: 3 }]];
        const mockOutput = [1, 2, 3];
        mockPool.execute.mockResolvedValue(mockRows);

        const result = await dao.getTeachers();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT id FROM teacher",
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should handle database error and reject", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getTeachers()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT id FROM teacher",
        );
    });
})

describe("getCodDegrees", () => {

    test("Should return the arrays of degrees id", async () => {
        const mockRows = [[{ cod_degree: "DEGR01" }, { cod_degree: "DEGR02" }, { cod_degree: "DEGR03" }]];
        const mockOutput = ["DEGR01", "DEGR02", "DEGR03"];
        mockPool.execute.mockResolvedValue(mockRows);

        const result = await dao.getCodDegrees();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT cod_degree FROM degree_table",
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should handle database error and reject", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getCodDegrees()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT cod_degree FROM degree_table",
        );
    });
})

describe("getCodes_group", () => {

    test("Should return the arrays of groups code", async () => {
        const mockRows = [[{ cod_group: "GRP01" }, { cod_group: "GRP02" }]];
        const mockOutput = ["GRP01", "GRP02"];
        mockPool.execute.mockResolvedValue(mockRows);

        const result = await dao.getCodes_group();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT cod_group FROM group_table",
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should handle database error and reject", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getCodes_group()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT cod_group FROM group_table",
        );
    });

})

describe("createThesis_group", () => {

    test("Should return the arrays of thesis_group", async () => {
        const mockInput = {
            thesis_id: 1,
            group_id: "GRP01"
        };

        mockPool.execute.mockResolvedValue(true);

        const result = await dao.createThesis_group(mockInput.thesis_id, mockInput.group_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_group (thesis_id, group_id) VALUES (?,?)",
            [mockInput.thesis_id, mockInput.group_id]
        );
        expect(result).toStrictEqual(mockInput);
    });

    test("Should handle database error and reject", async () => {
        const mockInput = {
            thesis_id: 1,
            group_id: "GRP01"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.createThesis_group(mockInput.thesis_id, mockInput.group_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_group (thesis_id, group_id) VALUES (?,?)",
            [mockInput.thesis_id, mockInput.group_id]
        );
    });

});

describe("createThesis_cosupervisor_teacher", () => {

    test("Should return the object of a thesis_cosupervisor (teacher), the cosupervisor is a teacher", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P123456"
        };
        const mockOutput = {
            thesis_id: 1,
            thesis_cosupervisor: "P123456"
        };
        mockPool.execute.mockResolvedValue(true);

        const result = await dao.createThesis_cosupervisor_teacher(mockInput.thesis_id, mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_cosupervisor_teacher (thesis_id, cosupevisor_id) VALUES (?,?)",
            [mockInput.thesis_id, mockInput.professor_id]
        );
        expect(result).toStrictEqual(mockOutput);
    });


    test("Should handle database error and reject", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P123456"
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.createThesis_cosupervisor_teacher(mockInput.thesis_id, mockInput.professor_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_cosupervisor_teacher (thesis_id, cosupevisor_id) VALUES (?,?)",
            [mockInput.thesis_id, mockInput.professor_id]
        );
    });

});

describe("createThesis_cosupervisor_external", () => {

    test("Should return the object of a thesis_cosupervisor (external), the cosupervisor is not a teacher", async () => {
        const mockInput = {
            thesis_id: 1,
            email: "test@test.com"
        };
        const mockOutput = {
            thesis_id: 1,
            thesis_cosupervisor: "test@test.com"
        };
        mockPool.execute.mockResolvedValue(true);

        const result = await dao.createThesis_cosupervisor_external(mockInput.thesis_id, mockInput.email);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_cosupervisor_external (thesis_id, cosupevisor_id) VALUES (?,?)",
            [mockInput.thesis_id, mockInput.email]
        );
        expect(result).toStrictEqual(mockOutput);
    });


    test("Should handle database error and reject", async () => {
        const mockInput = {
            thesis_id: 1,
            email: "test@test.com"
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.createThesis_cosupervisor_external(mockInput.thesis_id, mockInput.email)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_cosupervisor_external (thesis_id, cosupevisor_id) VALUES (?,?)",
            [mockInput.thesis_id, mockInput.email]
        );
    });

});

describe("getExternal_cosupervisors", () => {

    test("Should return the arrays of cosupervisors", async () => {
        const mockRows = [{ email: "test@test.com", surname: "surname", name: "name" }, { email: "aaabbb@test.com", surname: "aaa", name: "bbb" }];
        mockPool.execute.mockResolvedValue([mockRows])

        const result = await dao.getExternal_cosupervisors();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM external_supervisor"
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should reject if the database returns an error", async () => {
        mockPool.execute.mockRejectedValue("Database error")

        await expect(dao.getExternal_cosupervisors()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM external_supervisor"
        );
    });
})

describe("getExternal_cosupervisors_emails", () => {

    test("Should return the arrays of external cosupervisors emails", async () => {
        const mockRows = [{ email: "test@test.com", surname: "surname", name: "name" }, { email: "aaabbb@test.com", surname: "aaa", name: "bbb" }];
        mockPool.execute.mockResolvedValue([mockRows])

        const result = await dao.getExternal_cosupervisors_emails();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT email FROM external_supervisor"
        );
        expect(result).toStrictEqual([mockRows[0].email, mockRows[1].email]);
    });

    test("Should reject if the database returns an error", async () => {
        mockPool.execute.mockRejectedValue("Database error")

        await expect(dao.getExternal_cosupervisors_emails()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT email FROM external_supervisor"
        );
    });
})

describe("create_external_cosupervisor", () => {

    test("Should return the new external cosupervsior", async () => {
        const mockInput = {
            email: "test@test.com",
            surname: "surname",
            name: "name"
        };
        mockPool.execute.mockResolvedValue(true);

        const result = await dao.create_external_cosupervisor(mockInput);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO external_supervisor (email, surname, name) VALUES (?,?,?)",
            [mockInput.email, mockInput.surname, mockInput.name]
        );
        expect(result).toStrictEqual(mockInput);
    });

    test("Should handle database error and reject", async () => {
        const mockInput = {
            email: "test@test.com",
            surname: "surname",
            name: "name"
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.create_external_cosupervisor(mockInput)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO external_supervisor (email, surname, name) VALUES (?,?,?)",
            [mockInput.email, mockInput.surname, mockInput.name]
        );
    });

});

describe("getProposals", () => {

    test("Should get all thesis proposals viewable by a certain student - STUD; applicationResult.length != 0", async () => {
        const mockInput = {
            user_type: "STUD",
            username: "username",
            date: dayjs()
        };
        const mockOutput = [
            {
                cosupervisors: ["name surname", "name surname"],
                department_name: "department_name",
                description: 1,
                expiration: "2022-01-01 00:00:00",
                group_name: [{ "department": "department_name", "group": "group_name" }],
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
        ]

        mockPool.execute
            .mockResolvedValueOnce([[{ title_degree: "title_degree" }]])
            .mockResolvedValueOnce([[{ thesis_id: 2 }, { thesis_id: 3 }]])
            .mockResolvedValueOnce([[{
                id: 1,
                title: "title",
                description: 1,
                name: "name",
                surname: "surname",
                thesis_level: "thesis_level",
                thesis_type: "thesis_type",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: dayjs("2022-01-01").format("YYYY-MM-DD HH:mm:ss"),
                keywords: "keywords",
                title_degree: "title_degree",
                group_name: "group_name",
                department_name: "department_name",
                is_archived: true
            }]])
            .mockResolvedValueOnce([[{
                id: 1,
                cosupevisor_id: 1,
                name: "name",
                surname: "surname"
            }]])
            .mockResolvedValueOnce([[{
                id: 1,
                name: "name",
                surname: "surname",
                group_name: "group_name",
                department_name: "department_name"
            }]]);

        const result = await dao.getProposals(mockInput.user_type, mockInput.username, mockInput.date);

        expect(mockPool.execute).toHaveBeenCalledTimes(5);
        expect(result).toStrictEqual(mockOutput);

    });

    test("Should get all thesis proposals viewable by a certain student - NOT STUD", async () => {
        const mockInput = {
            user_type: "PROF",
            username: "username",
            date: dayjs()
        };
        const mockOutput = [
            {
                cosupervisors: ["name surname", "name surname"],
                department_name: "department_name",
                description: 1,
                expiration: "2022-01-01 00:00:00",
                group_name: [{ "department": "department_name", "group": "group_name" }],
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
        ]

        mockPool.execute
            .mockResolvedValueOnce([[{
                id: 1,
                title: "title",
                description: 1,
                name: "name",
                surname: "surname",
                thesis_level: "thesis_level",
                thesis_type: "thesis_type",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: dayjs("2022-01-01").format("YYYY-MM-DD HH:mm:ss"),
                keywords: "keywords",
                title_degree: "title_degree",
                group_name: "group_name",
                department_name: "department_name",
                is_archived: true
            }]])
            .mockResolvedValueOnce([[{
                id: 1,
                cosupevisor_id: 1,
                name: "name",
                surname: "surname"
            }]])
            .mockResolvedValueOnce([[{
                id: 1,
                name: "name",
                surname: "surname",
                group_name: "group_name",
                department_name: "department_name"
            }]]);

        const result = await dao.getProposals(mockInput.user_type, mockInput.username, mockInput.date);

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(result).toStrictEqual(mockOutput);

    });

    test("Should return error \"no entry\"", async () => {
        const mockInput = {
            user_type: "STUD",
            username: "username",
            date: dayjs()
        };

        mockPool.execute
            .mockResolvedValueOnce([[{ title_degree: "title_degree" }]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]]);

        const result = await dao.getProposals(mockInput.user_type, mockInput.username, mockInput.date)

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(result).toStrictEqual([]);

    });

    test("Should handle database errors", async () => {
        const mockInput = {
            user_type: "STUD",
            username: "username",
            date: dayjs()
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getProposals(mockInput.user_type, mockInput.username, mockInput.date)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});

describe("getProposalById", () => {

    test("Should get all informations about a thesis proposal if it is viewable by a certain student", async () => {
        const mockInput = {
            requested_thesis_id: 1,
            user_type: "STUD",
            username: "username"
        };
        const mockOutput =
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


        mockPool.execute
            .mockResolvedValueOnce([[{ cod_degree: "DEGR01" }]])
            .mockResolvedValueOnce([[{ cod_degree: "DEGR01" }]])
            .mockResolvedValueOnce([[{
                id: 1,
                title: "title",
                description: 1,
                name: "name",
                surname: "surname",
                thesis_level: "thesis_level",
                thesis_type: "thesis_type",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: dayjs("2022-01-01").format("YYYY-MM-DD HH:mm:ss"),
                keywords: "keywords",
                title_degree: "title_degree",
                group_name: "group_name",
                department_name: "department_name",
                is_archived: true
            }]])
            .mockResolvedValueOnce([[{
                id: 1,
                cosupevisor_id: 1,
                name: "name1",
                surname: "surname1"
            }]])
            .mockResolvedValueOnce([[{
                id: 1,
                name: "name2",
                surname: "surname2",
                group_name: "group_name2",
                department_name: "department_name2"
            }]]);

        const result = await dao.getProposalById(mockInput.requested_thesis_id, mockInput.user_type, mockInput.username);

        expect(mockPool.execute).toHaveBeenCalledTimes(5);
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should return error \"you are not allowed to see proposals from other degrees\" - First if", async () => {
        const mockInput = {
            requested_thesis_id: 1,
            user_type: "STUD",
            username: "username"
        };

        mockPool.execute
            .mockResolvedValueOnce([[{ cod_degree: "DEGR01" }]])
            .mockResolvedValueOnce([[{ cod_degree: "DEGR02" }]]);

        const result = await dao.getProposalById(mockInput.requested_thesis_id, mockInput.user_type, mockInput.username);

        expect(mockPool.execute).toHaveBeenCalledTimes(2);
        expect(result).toStrictEqual({ error: "you are not allowed to see proposals from other degrees" });
    });

    test("Should return error \"you are not allowed to see proposals from other degrees\" - Second if", async () => {
        const mockInput = {
            requested_thesis_id: 1,
            user_type: "STUD",
            username: "username"
        };

        mockPool.execute
            .mockResolvedValueOnce([[{ cod_degree: "DEGR01" }]])
            .mockResolvedValueOnce([[{ cod_degree: "DEGR01" }]])
            .mockResolvedValueOnce([[]]);

        const result = await dao.getProposalById(mockInput.requested_thesis_id, mockInput.user_type, mockInput.username);

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(result).toStrictEqual({ error: "you are not allowed to see proposals from other degrees" });
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            requested_thesis_id: 1,
            user_type: "STUD",
            username: "username"
        };
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getProposalById(mockInput.requested_thesis_id, mockInput.user_type, mockInput.username)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});

describe("beginTransaction", () => {

    test("Should begin a transaction", async () => {
        let mockConnection = mockPool.getConnection();
        mockConnection.beginTransaction.mockResolvedValue(true);

        await dao.beginTransaction();

        expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    test("Should handle database errors", async () => {
        let mockConnection = mockPool.getConnection();
        mockConnection.beginTransaction.mockRejectedValue("Database error");

        await expect(dao.beginTransaction()).rejects.toStrictEqual("Database error");

        expect(mockConnection.beginTransaction).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

});

describe("commit", () => {

    test("Should commit a transaction", async () => {
        let mockConnection = mockPool.getConnection();
        mockConnection.commit.mockResolvedValue(true);

        await dao.commit();

        expect(mockConnection.commit).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    test("Should handle database errors", async () => {
        let mockConnection = mockPool.getConnection();
        mockConnection.commit.mockRejectedValue("Database error");

        await expect(dao.commit()).rejects.toStrictEqual("Database error");

        expect(mockConnection.commit).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

});

describe("rollback", () => {

    test("Should rollback a transaction", async () => {
        let mockConnection = mockPool.getConnection();
        mockConnection.rollback.mockResolvedValue(true);

        await dao.rollback();

        expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    test("Should handle database errors", async () => {
        let mockConnection = mockPool.getConnection();
        mockConnection.rollback.mockRejectedValue("Database error");

        await expect(dao.rollback()).rejects.toStrictEqual("Database error");

        expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

});

describe("updateThesesArchivationManual", () => {

    test("Should update \"isArchived\" for a specified existing thesis proposal", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = {
            info: "ok"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.updateThesesArchivationManual(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            ` 
                UPDATE thesis
                SET is_archived = 1
                WHERE id = ?
                `,
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockRows.info);
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.updateThesesArchivationManual(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            ` 
                UPDATE thesis
                SET is_archived = 1
                WHERE id = ?
                `,
            [mockInput.thesis_id]
        );
    });

});

describe("updateApplicationStatus", () => {

    test("Should update the status of an application", async () => {
        const mockInput = {
            status: "status",
            student_id: "S123456",
            thesis_id: 1
        };

        mockPool.execute.mockResolvedValue([true]);

        const result = await dao.updateApplicationStatus(mockInput);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE application
                 SET status = ?
                 WHERE student_id = ? AND thesis_id = ?;`,
            [mockInput.status, mockInput.student_id, mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockInput);
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            status: "status",
            student_id: "S123456",
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.updateApplicationStatus(mockInput)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});

describe("rejectApplicationsExcept", () => {

    test("Should reject an application", async () => {
        const mockInput = {
            thesis_id: 1,
            student_id: "S123456"
        };

        mockPool.execute.mockResolvedValue([true]);

        const result = await dao.rejectApplicationsExcept(mockInput);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            ` 
                  UPDATE application
                  SET status = "Rejected"
                  WHERE  thesis_id = ?
                  AND student_id <> ?
                `,
            [mockInput.thesis_id, mockInput.student_id]
        );
        expect(result).toStrictEqual(mockInput);
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            thesis_id: 1,
            student_id: "S123456"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.rejectApplicationsExcept(mockInput)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });
});

describe("cancelStudentApplications", () => {

    test("Should cancel a student application", async () => {
        const mockInput = {
            student_id: "S123456",
            thesis_id: 1
        };

        mockPool.execute.mockResolvedValue([true]);

        const result = await dao.cancelStudentApplications(mockInput);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            ` 
                  DELETE FROM application
                  WHERE student_id = ?
                  AND thesis_id <> ?;
                `,
            [mockInput.student_id, mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockInput);
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            student_id: "S123456",
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.cancelStudentApplications(mockInput)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});

describe("getApplications", () => {

    test("Should return the list of all applications", async () => {
        const mockRows = [
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
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getApplications();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM application",
            []
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should handle database errors", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getApplications()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});

describe("getApplicationsForProfessor", () => {

    test("Should return all applications offered by a professor that are still pending", async () => {
        const mockInput = {
            profId: "name.surname@polito.it"
        };
        const mockRows = [
            {
                student_id: "S111111",
                name: "name1",
                surname: "surname1",
                thesis_id: 1,
                title: "title1",
                application_date: dayjs().format("YYYY-MM-DD")
            },
            {
                student_id: "S222222",
                name: "name2",
                surname: "surname2",
                thesis_id: 1,
                title: "title1",
                application_date: dayjs().format("YYYY-MM-DD")
            },
            {
                student_id: "S111111",
                name: "name1",
                surname: "surname1",
                thesis_id: 2,
                title: "title2",
                application_date: dayjs().format("YYYY-MM-DD")
            }
        ];
        const mockOutput = [
            {
                student_id: "S111111",
                student_name: "name1 surname1",
                thesis_id: 1,
                thesis_title: "title1",
                application_date: dayjs().format("YYYY-MM-DD")
            },
            {
                student_id: "S222222",
                student_name: "name2 surname2",
                thesis_id: 1,
                thesis_title: "title1",
                application_date: dayjs().format("YYYY-MM-DD")
            },
            {
                student_id: "S111111",
                student_name: "name1 surname1",
                thesis_id: 2,
                thesis_title: "title2",
                application_date: dayjs().format("YYYY-MM-DD")
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getApplicationsForProfessor(mockInput.profId);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `SELECT a.student_id ,s.name ,s.surname ,a.thesis_id ,t.title ,a.application_date
                 FROM application a join student s on s.id = a.student_id join thesis t on t.id = a.thesis_id join teacher tch on t.supervisor_id = tch.id 
                 WHERE a.status = 'Pending' and tch.email = ?  ORDER BY t.title`,
            [mockInput.profId]
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            profId: "name.surname@polito.it"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getApplicationsForProfessor(mockInput.profId)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});

describe("getStudentApplication", () => {

    test("Should return all applications submitted by a student", async () => {
        const mockInput = {
            studentId: "S123456"
        };

        const mockRows = [
            {
                field1: "field1",
                field2: 1,
                field3: dayjs().format("YYYY-MM-DD")
            },
            {
                field1: "field2",
                field2: 2,
                field3: dayjs().format("YYYY-MM-DD")
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getStudentApplication(mockInput.studentId);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM application WHERE student_id = ?",
            [mockInput.studentId]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should handle database errors", async () => {
        const mockInput = {
            studentId: "S123456"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getStudentApplication(mockInput.studentId)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
    });

});


describe("getUser", () => {

    test("Should return the info of an existing user", async () => {
        const mockInput = {
            email: "email",
            password: "password"
        };
        const mockRows = [
            {
                email: "email",
                salt: "salt",
                password: "password",
                user_type_id: "user_type_id"
            }
        ];
        const mockUser = {
            username: "email",
            user_type: "user_type_id"
        };

        mockPool.execute.mockResolvedValue([mockRows]);
        crypto.scrypt.mockImplementation((password, salt, keylen, callback) => {
            callback(null, Buffer.from("hashedpassword"));
        });
        crypto.timingSafeEqual.mockReturnValue(true);

        const result = await dao.getUser(mockInput.email, mockInput.password);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
        expect(crypto.scrypt).toHaveBeenCalledTimes(1);
        expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual(mockUser);
    });

    test("Should return false - MySql query doesn't return anything", async () => {
        const mockInput = {
            email: "email",
            password: "password"
        };
        const mockRows = [];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getUser(mockInput.email, mockInput.password);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
        expect(crypto.scrypt).not.toHaveBeenCalled();
        expect(crypto.timingSafeEqual).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    test("Should return false - Wrong password", async () => {
        const mockInput = {
            email: "email",
            password: "password"
        };
        const mockRows = [
            {
                email: "email",
                salt: "salt",
                password: "differentpassword",
                user_type_id: "user_type_id"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);
        crypto.scrypt.mockImplementation((password, salt, keylen, callback) => {
            callback(null, Buffer.from("hashedpassword"));
        });
        crypto.timingSafeEqual.mockReturnValue(false);

        const result = await dao.getUser(mockInput.email, mockInput.password);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
        expect(crypto.scrypt).toHaveBeenCalledTimes(1);
        expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });

    test("Should throw an error - crypto.scrypt doesn't work properly", async () => {
        const mockInput = {
            email: "email",
            password: "password"
        };
        const mockRows = [
            {
                email: "email",
                salt: "salt",
                password: "password",
                user_type_id: "user_type_id"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);
        crypto.scrypt.mockImplementation((password, salt, keylen, callback) => {
            callback("Error");
        });

        await expect(dao.getUser(mockInput.email, mockInput.password)).rejects.toStrictEqual("Error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
        expect(crypto.scrypt).toHaveBeenCalledTimes(1);
        expect(crypto.timingSafeEqual).not.toHaveBeenCalled();
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            email: "email",
            password: "password"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getUser(mockInput.email, mockInput.password)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
        expect(crypto.scrypt).not.toHaveBeenCalled();
        expect(crypto.timingSafeEqual).not.toHaveBeenCalled();
    });

});

describe("getUserByEmail", () => {

    test("Should return an existing user given their email", async () => {
        const mockInput = {
            email: "email"
        };
        const mockRows = [
            {
                email: "email",
                salt: "salt",
                password: "password",
                user_type_id: "user_type_id"
            }
        ];
        const mockUser = {
            username: "email",
            user_type: "user_type_id"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getUserByEmail(mockInput.email);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
        expect(result).toStrictEqual(mockUser);
    });

    test("Should throw an error - MySql query is empty", async () => {
        const mockInput = {
            email: "email"
        };
        const mockRows = [];

        mockPool.execute.mockResolvedValue([mockRows]);

        await expect(dao.getUserByEmail(mockInput.email)).rejects.toStrictEqual({ error: "User not found." });

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            email: "email"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getUserByEmail(mockInput.email)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM users WHERE email = ?",
            [mockInput.email]
        );
    });

});

describe("getUserID", () => {

    test("Should retrieve te id of an existing user", async () => {
        const mockInput = {
            username: "username"
        };
        const mockRows = [
            {
                id: "S111111",
                surname: "surname",
                name: "name",
                gender: "gender",
                nationality: "nationality",
                email: "email",
                cod_degree: "cod_degree",
                enrollment_year: 2019
            }
        ];
        const mockResult = "S111111";

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getUserID(mockInput.username);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM student WHERE email = ?",
            [mockInput.username]
        );
        expect(result).toStrictEqual(mockResult);
    });

    test("Should throw an error - Parameter \"username\" isn't valid", async () => {
        const mockInput = {
            username: undefined
        };

        await expect(dao.getUserID(mockInput.username)).rejects.toStrictEqual({ error: "parameter is missing" });

        expect(mockPool.execute).not.toHaveBeenCalled();
    });

    test("Should throw an error - MySql query is empty", async () => {
        const mockInput = {
            username: "username"
        };
        const mockRows = [];

        mockPool.execute.mockResolvedValue([mockRows]);

        await expect(dao.getUserID(mockInput.username)).rejects.toStrictEqual({ error: "User not found." });

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM student WHERE email = ?",
            [mockInput.username]
        );
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            username: "username"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getUserID(mockInput.username)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM student WHERE email = ?",
            [mockInput.username]
        );
    });

});

describe("getProfID", () => {

    test("Should retrieve te id of an existing professor", async () => {
        const mockInput = {
            username: "username"
        };
        const mockRows = [
            {
                id: "P111111",
                surname: "surname",
                name: "name",
                email: "email",
                cod_group: "cod_group",
                cod_department: "cod_department"
            }
        ];
        const mockResult = "P111111";

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getProfID(mockInput.username);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM teacher WHERE email = ?",
            [mockInput.username]
        );
        expect(result).toStrictEqual(mockResult);
    });

    test("Should throw an error - Parameter \"username\" isn't valid", async () => {
        const mockInput = {
            username: undefined
        };

        await expect(dao.getProfID(mockInput.username)).rejects.toStrictEqual({ error: "parameter is missing" });

        expect(mockPool.execute).not.toHaveBeenCalled();
    });

    test("Should throw an error - MySql query is empty", async () => {
        const mockInput = {
            username: "username"
        };
        const mockRows = [];

        mockPool.execute.mockResolvedValue([mockRows]);

        await expect(dao.getProfID(mockInput.username)).rejects.toStrictEqual({ error: "User not found." });

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM teacher WHERE email = ?",
            [mockInput.username]
        );
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            username: "username"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getProfID(mockInput.username)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM teacher WHERE email = ?",
            [mockInput.username]
        );
    });

});

describe("getDataTeacherApplicationEmail", () => {

    test("Should retrieve the thesis title and the supervisor email of an application for an existing thesis proposal", async () => {
        const mockInput = {
            thesisId: 1
        };
        const mockRows = [
            {
                email: "email",
                title: "title"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getDataTeacherApplicationEmail(mockInput.thesisId);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT  email, title FROM thesis TS, teacher TE WHERE TS.id = ? AND TS.supervisor_id = TE.id",
            [mockInput.thesisId]
        );
        expect(result).toStrictEqual(mockRows[0]);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesisId: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getDataTeacherApplicationEmail(mockInput.thesisId)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT  email, title FROM thesis TS, teacher TE WHERE TS.id = ? AND TS.supervisor_id = TE.id",
            [mockInput.thesisId]
        );
    });

});

describe("getDataStudentApplicationEmail", () => {

    test("Should retrieve the thesis title and the student email of an application for an existing thesis proposal", async () => {
        const mockInput = {
            thesisId: 1,
            studentId: "S111111"
        };
        const mockRows = [
            {
                email: "email",
                title: "title"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getDataStudentApplicationEmail(mockInput.thesisId, mockInput.studentId);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT  email, title FROM thesis TS, student S WHERE TS.id = ? AND S.id = ? ",
            [mockInput.thesisId, mockInput.studentId]
        );
        expect(result).toStrictEqual(mockRows[0]);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesisId: 1,
            studentId: "S111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getDataStudentApplicationEmail(mockInput.thesisId, mockInput.studentId)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT  email, title FROM thesis TS, student S WHERE TS.id = ? AND S.id = ? ",
            [mockInput.thesisId, mockInput.studentId]
        );
    });

});

describe("getTeachersList", () => {

    test("Should retrieve the list of all the teachers", async () => {
        const mockRows = [
            {
                id: "P111111",
                surname: "surname1",
                name: "name1",
                email: "email1",
                cod_group: "cod_group1",
                cod_department: "cod_department1"
            },
            {
                id: "P222222",
                surname: "surname2",
                name: "name2",
                email: "email2",
                cod_group: "cod_group2",
                cod_department: "cod_department2"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getTeachersList();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM teacher"
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getTeachersList()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM teacher"
        );
    });

});

describe("getDegrees", () => {

    test("Should retrieve the list of all degrees", async () => {
        const mockRows = [
            {
                title_degree: "degree 1",
                cod_degree: "DEGR01",
            },
            {
                title_degree: "degree 2",
                cod_degree: "DEGR02",
            }
        ];
        const mockResult = [
            {
                name: "degree 1",
                cod: "DEGR01",
            },
            {
                name: "degree 2",
                cod: "DEGR02",
            }
        ]

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getDegrees();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM degree_table"
        );
        expect(result).toStrictEqual(mockResult);
    });

    test("Should throw an error - MySql error", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getDegrees()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM degree_table"
        );
    });

});

describe("createRequest_cosupervisor_teacher", () => {

    test("Should associate a cosupervisor to a thesis request", async () => {
        const mockInput = {
            request_id: 1,
            professor_id: "P111111"
        };
        const mockOutput = {
            request_id: 1,
            thesis_cosupervisor: "P111111"
        };

        mockPool.execute.mockResolvedValue(true);

        const result = await dao.createRequest_cosupervisor_teacher(mockInput.request_id, mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_cosupervisor_teacher (thesisrequest_id, cosupevisor_id) VALUES (?,?)",
            [
                mockInput.request_id,
                mockInput.professor_id
            ]
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            request_id: 1,
            professor_id: "P111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.createRequest_cosupervisor_teacher(mockInput.request_id, mockInput.professor_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_cosupervisor_teacher (thesisrequest_id, cosupevisor_id) VALUES (?,?)",
            [
                mockInput.request_id,
                mockInput.professor_id
            ]
        );
    });

});

describe("getGroups", () => {

    test("Should retrieve the list of all groups", async () => {
        const mockRows = [
            {
                group_name: "Group 1",
                cod_group: "GRP01",
            },
            {
                group_name: "Group 2",
                cod_group: "GRP02",
            }
        ];
        const mockResult = [
            {
                name: "Group 1",
                cod: "GRP01",
            },
            {
                name: "Group 2",
                cod: "GRP02",
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getGroups();

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM group_table"
        );
        expect(result).toStrictEqual(mockResult);
    });

    test("Should throw an error - MySql error", async () => {
        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getGroups()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM group_table"
        );
    });

});

describe("setExpired", () => {

    test("Should update \"isArchieved\" for every thesis proposal that has expiration date greater then \"virtualDateTime\"", async () => {
        const mockInput = {
            virtualDateTime: new Date()
        };
        const mockRows = {
            info: "ok"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.setExpired(mockInput.virtualDateTime);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            ` 
                UPDATE thesis
                SET is_expired = CASE
                    WHEN expiration < ? THEN 1
                    ELSE 0
                END;
                `,
            [mockInput.virtualDateTime]
        );
        expect(result).toStrictEqual(mockRows.info);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            virtualDateTime: new Date()
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.setExpired(mockInput.virtualDateTime)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            ` 
                UPDATE thesis
                SET is_expired = CASE
                    WHEN expiration < ? THEN 1
                    ELSE 0
                END;
                `,
            [mockInput.virtualDateTime]
        );
    });

});

describe("updateThesis", () => {

    test("Should update an existing thesis proposal", async () => {
        const mockInput = {
            thesis: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date(),
                cod_degree: "DEGR01",
                is_archived: 0,
                keywords: "keywords",
                thesis_id: 1,
            }
        }
        const mockRows = {
            affectedRows: 1
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.updateThesis(mockInput.thesis);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE thesis
      SET title = ?, description = ?, supervisor_id = ?, thesis_level = ?, thesis_type = ?, required_knowledge = ?, notes = ?, expiration = ?, cod_degree = ?, is_archived = ?, keywords = ?
      WHERE id = ?`,
            [
                mockInput.thesis.title,
                mockInput.thesis.description,
                mockInput.thesis.supervisor_id,
                mockInput.thesis.thesis_level,
                mockInput.thesis.type_name,
                mockInput.thesis.required_knowledge,
                mockInput.thesis.notes,
                mockInput.thesis.expiration,
                mockInput.thesis.cod_degree,
                mockInput.thesis.is_archived,
                mockInput.thesis.keywords,
                mockInput.thesis.thesis_id,
            ]
        );
        expect(result).toStrictEqual(mockRows.affectedRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis: {
                title: "title",
                description: "description",
                supervisor_id: "P111111",
                thesis_level: "thesis_level",
                type_name: "type_name",
                required_knowledge: "required_knowledge",
                notes: "notes",
                expiration: new Date(),
                cod_degree: "DEGR01",
                is_archived: 0,
                keywords: "keywords",
                thesis_id: 1,
            }
        }

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.updateThesis(mockInput.thesis)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE thesis
      SET title = ?, description = ?, supervisor_id = ?, thesis_level = ?, thesis_type = ?, required_knowledge = ?, notes = ?, expiration = ?, cod_degree = ?, is_archived = ?, keywords = ?
      WHERE id = ?`,
            [
                mockInput.thesis.title,
                mockInput.thesis.description,
                mockInput.thesis.supervisor_id,
                mockInput.thesis.thesis_level,
                mockInput.thesis.type_name,
                mockInput.thesis.required_knowledge,
                mockInput.thesis.notes,
                mockInput.thesis.expiration,
                mockInput.thesis.cod_degree,
                mockInput.thesis.is_archived,
                mockInput.thesis.keywords,
                mockInput.thesis.thesis_id,
            ]
        );
    });

});

describe("deleteThesisGroups", () => {

    test("Should delete all groups associated to a specific thesis proposal", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = {
            affectedRows: 1
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.deleteThesisGroups(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "DELETE FROM thesis_group WHERE thesis_id = ?",
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockRows.affectedRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.deleteThesisGroups(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "DELETE FROM thesis_group WHERE thesis_id = ?",
            [mockInput.thesis_id]
        );
    });

});

describe("deleteThesisCosupervisorTeacherAll", () => {

    test("Should delete all internal cosupervisors associated with a specified thesis proposal", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = {
            affectedRows: 1
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.deleteThesisCosupervisorTeacherAll(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "DELETE FROM thesis_cosupervisor_teacher WHERE thesis_id = ?",
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockRows.affectedRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.deleteThesisCosupervisorTeacherAll(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "DELETE FROM thesis_cosupervisor_teacher WHERE thesis_id = ?",
            [mockInput.thesis_id]
        );
    });

});

describe("deleteThesisCosupervisorExternalAll", () => {

    test("Should delete all external cosupervisors associated with a specified thesis proposal", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = {
            affectedRows: 1
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.deleteThesisCosupervisorExternalAll(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "DELETE FROM thesis_cosupervisor_external WHERE thesis_id = ?",
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockRows.affectedRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.deleteThesisCosupervisorExternalAll(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "DELETE FROM thesis_cosupervisor_external WHERE thesis_id = ?",
            [mockInput.thesis_id]
        );
    });

});

describe("isThesisProposalValid", () => {

    test("Should check if a given thesis proposal exists - return true", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = [
            { count: 1 }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.isThesisProposalValid(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) AS count FROM thesis WHERE id=?",
            [mockInput.thesis_id]
        );
        expect(result).toBe(true);
    });

    test("Should check if a given thesis proposal exists - return false", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = [
            { count: 0 }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.isThesisProposalValid(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) AS count FROM thesis WHERE id=?",
            [mockInput.thesis_id]
        );
        expect(result).toBe(false);
    });

    test("Should throw an error - more than one thesis proposal found", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = [
            { count: 2 }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        await expect(dao.isThesisProposalValid(mockInput.thesis_id)).rejects.toStrictEqual(new Error("Internal server error"));

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) AS count FROM thesis WHERE id=?",
            [mockInput.thesis_id]
        );
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.isThesisProposalValid(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT COUNT(*) AS count FROM thesis WHERE id=?",
            [mockInput.thesis_id]
        );
    });

});

describe("getProposalsProfessor", () => {

    test("Should retrieve all the thesis proposals of a given supervisor", async () => {
        const mockInput = {
            professor_id: "P111111"
        };
        const mockRows = [
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

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getProposalsProfessor(mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.* FROM thesis t inner join teacher p on p.id = t.supervisor_id WHERE p.email  = ? and is_deleted = 0 and is_expired= 0 order by t.title",
            [mockInput.professor_id]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            professor_id: "P111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getProposalsProfessor(mockInput.professor_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.* FROM thesis t inner join teacher p on p.id = t.supervisor_id WHERE p.email  = ? and is_deleted = 0 and is_expired= 0 order by t.title",
            [mockInput.professor_id]
        );
    });

});

describe("checkBeforeDeleteProposal", () => {

    test("Should check if a thesis proposal has active applications, is archived or is expired", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P111111"
        };
        const mockRows1 = [
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
                keywords: "keywords",
                supervisor_name: "name surname"
            }
        ];
        const mockRows2 = [
            { supervisor_id: "P111111" }
        ];
        const mockRows3 = [];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2])
            .mockResolvedValueOnce([mockRows3]);

        const result = await dao.checkBeforeDeleteProposal(mockInput.thesis_id, mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM thesis WHERE id = ? AND is_archived = 0 AND is_deleted = 0 AND is_expired = 0",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT supervisor_id FROM thesis WHERE id = ?",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            `SELECT * FROM application WHERE thesis_id = ? AND status = "Accepted"`,
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual("ok");
    });

    test("Should return an error - The thesis proposal is archived, is expired and/or is_deleted", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P111111"
        };
        const mockRows1 = [];

        mockPool.execute.mockResolvedValueOnce([mockRows1]);

        const result = await dao.checkBeforeDeleteProposal(mockInput.thesis_id, mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM thesis WHERE id = ? AND is_archived = 0 AND is_deleted = 0 AND is_expired = 0",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            "SELECT supervisor_id FROM thesis WHERE id = ?",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            `SELECT * FROM application WHERE thesis_id = ? AND status = "Accepted"`,
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual("The thesis you request to delete is either not available or not removale.");
    });

    test("Should return an error - The thesis proposal doesn't belong to the professor who has made the request", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P111111"
        };
        const mockRows1 = [
            {
                id: 1,
                title: "title",
                description: "description",
                supervisor_id: "P222222",
                thesis_level: "level",
                thesis_type: "type",
                required_knowledge: "knowledge",
                notes: "notes",
                expiration: new Date(),
                cod_degree: "cod",
                is_archived: false,
                is_expired: false,
                is_deleted: false,
                keywords: "keywords",
                supervisor_name: "name surname"
            }
        ];
        const mockRows2 = [
            { supervisor_id: "P222222" }
        ];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2]);

        const result = await dao.checkBeforeDeleteProposal(mockInput.thesis_id, mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(2);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM thesis WHERE id = ? AND is_archived = 0 AND is_deleted = 0 AND is_expired = 0",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT supervisor_id FROM thesis WHERE id = ?",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            `SELECT * FROM application WHERE thesis_id = ? AND status = "Accepted"`,
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual("You can only delete your own proposals.");
    });

    test("Should check if a thesis proposal has active applications, is archived or is expired", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P111111"
        };
        const mockRows1 = [
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
                keywords: "keywords",
                supervisor_name: "name surname"
            }
        ];
        const mockRows2 = [
            { supervisor_id: "P111111" }
        ];
        const mockRows3 = [
            {
                student_id: "S111111",
                thesis_id: 1,
                status: "status",
                application_date: new Date()
            },
            {
                student_id: "S222222",
                thesis_id: 1,
                status: "status",
                application_date: new Date()
            }
        ];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2])
            .mockResolvedValueOnce([mockRows3]);

        const result = await dao.checkBeforeDeleteProposal(mockInput.thesis_id, mockInput.professor_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM thesis WHERE id = ? AND is_archived = 0 AND is_deleted = 0 AND is_expired = 0",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT supervisor_id FROM thesis WHERE id = ?",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            `SELECT * FROM application WHERE thesis_id = ? AND status = "Accepted"`,
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual("The thesis you request to delete has an active application. you can't delete it.");
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1,
            professor_id: "P111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.checkBeforeDeleteProposal(mockInput.thesis_id, mockInput.professor_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT * FROM thesis WHERE id = ? AND is_archived = 0 AND is_deleted = 0 AND is_expired = 0",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            "SELECT supervisor_id FROM thesis WHERE id = ?",
            [mockInput.thesis_id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            `SELECT * FROM application WHERE thesis_id = ? AND status = "Accepted"`,
            [mockInput.thesis_id]
        );
    });

});

describe("deleteProposal", () => {

    test("Should set the \"is_deleted\" flag of a specified thesis proposal to true", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = {
            info: "ok"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.deleteProposal(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "UPDATE thesis SET is_deleted = 1 WHERE id = ?",
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockRows.info);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.deleteProposal(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "UPDATE thesis SET is_deleted = 1 WHERE id = ?",
            [mockInput.thesis_id]
        );
    });

});

describe("updateApplicationsAfterProposalDeletion", () => {

    test("Should cancell all application related to a specific thesis proposal", async () => {
        const mockInput = {
            thesis_id: 1
        };
        const mockRows = {
            info: "ok"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.updateApplicationsAfterProposalDeletion(mockInput.thesis_id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE application SET status = "Cancelled" WHERE thesis_id = ?`,
            [mockInput.thesis_id]
        );
        expect(result).toStrictEqual(mockRows.info);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesis_id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.updateApplicationsAfterProposalDeletion(mockInput.thesis_id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE application SET status = "Cancelled" WHERE thesis_id = ?`,
            [mockInput.thesis_id]
        );
    });

});

describe("getProfessorEmailExpiring", () => {

    test("Should retrieve professor email of each thesis that is expiring a week from now", async () => {
        const mockInput = {
            specifiedDate: new Date()
        };
        const mockRows = [
            {
                professor_email: "email1",
                thesis_title: "title1",
                thesis_expiration: new Date()
            },
            {
                professor_email: "email2",
                thesis_title: "title2",
                thesis_expiration: new Date()
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getProfessorEmailExpiring(mockInput.specifiedDate);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `
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
  `,
            [mockInput.specifiedDate, mockInput.specifiedDate]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            specifiedDate: new Date()
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getProfessorEmailExpiring(mockInput.specifiedDate)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `
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
  `,
            [mockInput.specifiedDate, mockInput.specifiedDate]
        );
    });

});

describe("getThesisForProfessorById", () => {

    test("Should retrieve all the information about a specified thesis proposal and the name and surname of its supervisor", async () => {
        const mockInput = {
            id: 1
        };
        const mockRows = [
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
                keywords: "keywords",
                supervisor_name: "name surname"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getThesisForProfessorById(mockInput.id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select t.*, CONCAT_WS(' ', te.name, te.surname) AS supervisor_name from thesis t inner join teacher te on t.supervisor_id  = te.id where t.id=?",
            [mockInput.id]
        );
        expect(result).toStrictEqual(mockRows[0]);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getThesisForProfessorById(mockInput.id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select t.*, CONCAT_WS(' ', te.name, te.surname) AS supervisor_name from thesis t inner join teacher te on t.supervisor_id  = te.id where t.id=?",
            [mockInput.id]
        );
    });

});

describe("getThesisExCosupervisorForProfessorById", () => {

    test("Should retrieve all the external cosupervisors of a specified thesis proposal", async () => {
        const mockInput = {
            id: 1
        };
        const mockRows = [
            {
                cosupevisor_id: "E1",
                ext_supervisor_name: "name surname 1"
            },
            {
                cosupevisor_id: "E2",
                ext_supervisor_name: "name surname 2"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getThesisExCosupervisorForProfessorById(mockInput.id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select t.cosupevisor_id, CONCAT_WS(' ', es.name , es.surname) AS ext_supervisor_name from thesis_cosupervisor_external t " +
            "inner join external_supervisor es on t.cosupevisor_id = es.email where t.thesis_id = ?",
            [mockInput.id]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getThesisExCosupervisorForProfessorById(mockInput.id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select t.cosupevisor_id, CONCAT_WS(' ', es.name , es.surname) AS ext_supervisor_name from thesis_cosupervisor_external t " +
            "inner join external_supervisor es on t.cosupevisor_id = es.email where t.thesis_id = ?",
            [mockInput.id]
        );
    });

});

describe("getThesisIntCosupervisorForProfessor", () => {

    test("Should retrieve all the internal cosupervisors of a specified thesis proposal", async () => {
        const mockInput = {
            id: 1
        };
        const mockRows = [
            {
                cosupevisor_id: "I1",
                ext_supervisor_name: "name surname 1"
            },
            {
                cosupevisor_id: "I2",
                ext_supervisor_name: "name surname 2"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getThesisIntCosupervisorForProfessor(mockInput.id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select t.cosupevisor_id, CONCAT_WS(' ', te.name , te.surname) AS int_supervisor_name from thesis_cosupervisor_teacher t " +
            "inner join teacher te on t.cosupevisor_id = te.id where t.thesis_id = ?",
            [mockInput.id]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getThesisIntCosupervisorForProfessor(mockInput.id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select t.cosupevisor_id, CONCAT_WS(' ', te.name , te.surname) AS int_supervisor_name from thesis_cosupervisor_teacher t " +
            "inner join teacher te on t.cosupevisor_id = te.id where t.thesis_id = ?",
            [mockInput.id]
        );
    });

});

describe("getThesisGroups", () => {

    test("Should retrieve all groups related to a specified thesis proposal", async () => {
        const mockInput = {
            id: 1
        };
        const mockRows = [
            {
                group_id: "GRP01"
            },
            {
                group_id: "GRP02"
            }
        ];
        const mockOutput = ["GRP01", "GRP02"];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getThesisGroups(mockInput.id);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select group_id from thesis_group where thesis_id = ?",
            [mockInput.id]
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            id: 1
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getThesisGroups(mockInput.id)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select group_id from thesis_group where thesis_id = ?",
            [mockInput.id]
        );
    });

});

describe("createRequest", () => {

    test("Should create a new thesis request", async () => {
        const mockInput = {
            thesisRequest: {
                title: "title",
                student_id: "S111111",
                description: "description",
                supervisor_id: "P111111"
            }
        };
        const mockRows = { insertId: 1 };
        const mockOutput = {
            id: 1,
            title: "title",
            student_id: "S111111",
            description: "description",
            supervisor_id: "P111111"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.createRequest(mockInput.thesisRequest);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_request (title, student_id, description, supervisor_id, status_code) VALUES (?, ?, ?,?, 0)",
            [
                mockInput.thesisRequest.title,
                mockInput.thesisRequest.student_id,
                mockInput.thesisRequest.description,
                mockInput.thesisRequest.supervisor_id
            ]
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            thesisRequest: {
                title: "title",
                student_id: "S111111",
                description: "description",
                supervisor_id: "P111111"
            }
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.createRequest(mockInput.thesisRequest)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "INSERT INTO thesis_request (title, student_id, description, supervisor_id, status_code) VALUES (?, ?, ?,?, 0)",
            [
                mockInput.thesisRequest.title,
                mockInput.thesisRequest.student_id,
                mockInput.thesisRequest.description,
                mockInput.thesisRequest.supervisor_id
            ]
        );
    });

});

describe("secretaryThesisRequest", () => {

    test("Should update the status of a thesis request", async () => {
        const mockInput = {
            request_id: 1,
            change: 0
        };
        const mockRows = {
            info: "ok"
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.secretaryThesisRequest(mockInput.request_id, mockInput.change);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE thesis_request SET status_code = ? WHERE id = ?`,
            [mockInput.change, mockInput.request_id]
        );
        expect(result).toStrictEqual(mockRows.info);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            request_id: 1,
            change: 0
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.secretaryThesisRequest(mockInput.request_id, mockInput.change)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE thesis_request SET status_code = ? WHERE id = ?`,
            [mockInput.change, mockInput.request_id]
        );
    });

});

describe("teachersThesisRequest", () => {

    test("Should update a thesis request", async () => {
        const mockInput = {
            request_id: 1,
            change: 0
        };
        const mockRows = {
            info: "ok"
        };
        //const start_date = new Date();

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.teachersThesisRequest(mockInput.request_id, mockInput.change);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE thesis_request SET status_code = ?, start_date = ? WHERE id = ?`,
            [mockInput.change, expect.any(Date), mockInput.request_id]
        );

        /* const mockDate = mockPool.execute.mock.calls[0][1][1];
        expect(mockDate.getFullYear()).toStrictEqual(start_date.getFullYear());
        expect(mockDate.getMonth()).toStrictEqual(start_date.getMonth());
        expect(mockDate.getDate()).toStrictEqual(start_date.getDate());
        expect(mockDate.getHours()).toStrictEqual(start_date.getHours());
        expect(mockDate.getMinutes()).toStrictEqual(start_date.getMinutes());
        expect(mockDate.getSeconds()).toStrictEqual(start_date.getSeconds()); */
        
        expect(result).toStrictEqual(mockRows.info);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            request_id: 1,
            change: 0
        };
        const start_date = new Date();

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.teachersThesisRequest(mockInput.request_id, mockInput.change)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            `UPDATE thesis_request SET status_code = ?, start_date = ? WHERE id = ?`,
            [mockInput.change, expect.any(Date), mockInput.request_id]
        );

        /* const mockDate = mockPool.execute.mock.calls[0][1][1];
        expect(mockDate.getFullYear()).toStrictEqual(start_date.getFullYear());
        expect(mockDate.getMonth()).toStrictEqual(start_date.getMonth());
        expect(mockDate.getDate()).toStrictEqual(start_date.getDate());
        expect(mockDate.getHours()).toStrictEqual(start_date.getHours());
        expect(mockDate.getMinutes()).toStrictEqual(start_date.getMinutes());
        expect(mockDate.getSeconds()).toStrictEqual(start_date.getSeconds()); */
    });

});

describe("getRequestsForProfessor", () => {

    test("Should retrieve all the thesis request made to a specified professor", async () => {
        const mockInput = {
            email: "email"
        };
        const mockRows1 = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            }
        ];
        const mockRows2 = [
            {
                id: "P222222",
                cosup_fullname: "name surname 2"
            }
        ];
        const mockRows3 = [
            {
                id: "P333333",
                cosup_fullname: "name surname 3"
            },
            {
                id: "P444444",
                cosup_fullname: "name surname 4"
            }
        ];
        const mockOutput = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname",
                cosup_fullname: ["name surname 2"]
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname",
                cosup_fullname: ["name surname 3", "name surname 4"]
            }
        ];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2])
            .mockResolvedValueOnce([mockRows3]);

        const result = await dao.getRequestsForProfessor(mockInput.email);

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(mockPool.execute).toHaveBeenCalledWith(
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
            "WHERE tr.status_code = 1 AND t.email = ?",
            [mockInput.email]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[0].id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[1].id]
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should throw an error - MySql error inside first query", async () => {
        const mockInput = {
            email: "email"
        };
        const mockRows1 = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            }
        ];

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getRequestsForProfessor(mockInput.email)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
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
            "WHERE tr.status_code = 1 AND t.email = ?",
            [mockInput.email]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[0].id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[1].id]
        );
    });

    test("Should throw an error - MySql error inside second query", async () => {
        const mockInput = {
            email: "email"
        };
        const mockRows1 = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            }
        ];
        const mockRows2 = [
            {
                id: "P222222",
                cosup_fullname: "name surname 2"
            }
        ];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2])
            .mockRejectedValueOnce("Database error");

        await expect(dao.getRequestsForProfessor(mockInput.email)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(mockPool.execute).toHaveBeenCalledWith(
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
            "WHERE tr.status_code = 1 AND t.email = ?",
            [mockInput.email]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[0].id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[1].id]
        );
    });

});

describe("getRequestsForSecretary", () => {

    test("Should retrieve all the thesis request made to a specified professor", async () => {
        const mockRows1 = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            }
        ];
        const mockRows2 = [
            {
                id: "P222222",
                cosup_fullname: "name surname 2"
            }
        ];
        const mockRows3 = [
            {
                id: "P333333",
                cosup_fullname: "name surname 3"
            },
            {
                id: "P444444",
                cosup_fullname: "name surname 4"
            }
        ];
        const mockOutput = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname",
                cosup_fullname: ["name surname 2"]
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname",
                cosup_fullname: ["name surname 3", "name surname 4"]
            }
        ];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2])
            .mockResolvedValueOnce([mockRows3]);

        const result = await dao.getRequestsForSecretary();

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(mockPool.execute).toHaveBeenCalledWith(
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
            "where tr.status_code = 0"
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[0].id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[1].id]
        );
        expect(result).toStrictEqual(mockOutput);
    });

    test("Should throw an error - MySql error inside first query", async () => {
        const mockRows1 = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            }
        ];

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getRequestsForSecretary()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
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
            "where tr.status_code = 0"
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[0].id]
        );
        expect(mockPool.execute).not.toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[1].id]
        );
    });

    test("Should throw an error - MySql error inside second query", async () => {
        const mockRows1 = [
            {
                id: 1,
                student_id: "S111111",
                student_fullname: "name1 surname1",
                title: "title1",
                description: "description1",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            },
            {
                id: 2,
                student_id: "S222222",
                student_fullname: "name2 surname2",
                title: "title2",
                description: "description2",
                supervisor_id: "P111111",
                professor_fullname: "name surname"
            }
        ];
        const mockRows2 = [
            {
                id: "P222222",
                cosup_fullname: "name surname 2"
            }
        ];

        mockPool.execute.mockResolvedValueOnce([mockRows1])
            .mockResolvedValueOnce([mockRows2])
            .mockRejectedValueOnce("Database error");

        await expect(dao.getRequestsForSecretary()).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(3);
        expect(mockPool.execute).toHaveBeenCalledWith(
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
            "where tr.status_code = 0"
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[0].id]
        );
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT t.id, CONCAT(t.name, ' ', t.surname) AS cosup_fullname FROM teacher t INNER JOIN thesis_cosupervisor_teacher tc ON tc.cosupevisor_id = t.id WHERE tc.thesisrequest_id = ?",
            [mockRows1[1].id]
        );
    });

});

describe("getStudentExams", () => {

    test("Should retrieve the entire career of a specified student", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        const mockRows = [
            {
                id: "S111111",
                cod_course: "cod_course_1",
                title_course: "title_course_1",
                cfu: 10,
                grade: 30,
                date: new Date(),
            },
            {
                id: "S111111",
                cod_course: "cod_course_2",
                title_course: "title_course_2",
                cfu: 10,
                grade: 30,
                date: new Date(),
            },
            {
                id: "S111111",
                cod_course: "cod_course_3",
                title_course: "title_course_3",
                cfu: 10,
                grade: 30,
                date: new Date(),
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getStudentExams(mockInput.studentID);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select * FROM career WHERE id=?",
            [mockInput.studentID]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            studentID: "S111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getStudentExams(mockInput.studentID)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select * FROM career WHERE id=?",
            [mockInput.studentID]
        );
    });

});

describe("getStudent", () => {

    test("Should retrieve all the information about a specified student", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        const mockRows = {
            id: "S111111",
            surname: "surname",
            name: "name",
            gender: "gender",
            nationality: "nationality",
            email: "email",
            cod_degree: "DEGR01",
            enrollment_year: 2019
        };

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getStudent(mockInput.studentID);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select * FROM student WHERE id=?",
            [mockInput.studentID]
        );
        expect(result).toStrictEqual(mockRows);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            studentID: "S111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getStudent(mockInput.studentID)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select * FROM student WHERE id=?",
            [mockInput.studentID]
        );
    })

});

describe("getDataProfessorRequestEmail", () => {
    test("Should retrieve the thesis request title and the supervisor email for an existing thesis request", async () => {
        const mockInput = {
            requestID: 1,
            professorID: "P111111"
        };
        const mockRows = [
            {
                email: "email",
                title: "title"
            }
        ];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getDataProfessorRequestEmail(mockInput.requestID, mockInput.professorID);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT  email, title FROM thesis_request TR, teacher T WHERE TR.id = ? AND T.id = ?",
            [mockInput.requestID, mockInput.professorID]
        );
        expect(result).toStrictEqual(mockRows[0]);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            requestID: 1,
            professorID: "P111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getDataProfessorRequestEmail(mockInput.requestID, mockInput.professorID)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "SELECT  email, title FROM thesis_request TR, teacher T WHERE TR.id = ? AND T.id = ?",
            [mockInput.requestID, mockInput.professorID]
        );
    });

});

describe("getCountStudentRequestNotRejected", () => {

    test("Should return the number of requests not rejected of a specified student", async () => {
        const mockInput = {
            studentID: "S111111"
        };
        const mockRows = [{ tot: 1 }];

        mockPool.execute.mockResolvedValue([mockRows]);

        const result = await dao.getCountStudentRequestNotRejected(mockInput.studentID);

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select count(*) as tot from thesis_request r where r.student_id = ? and status_code <> 4 and status_code <> 5",
            [mockInput.studentID]
        );
        expect(result).toStrictEqual(mockRows[0].tot);
    });

    test("Should throw an error - MySql error", async () => {
        const mockInput = {
            studentID: "S111111"
        };

        mockPool.execute.mockRejectedValue("Database error");

        await expect(dao.getCountStudentRequestNotRejected(mockInput.studentID)).rejects.toStrictEqual("Database error");

        expect(mockPool.execute).toHaveBeenCalledTimes(1);
        expect(mockPool.execute).toHaveBeenCalledWith(
            "select count(*) as tot from thesis_request r where r.student_id = ? and status_code <> 4 and status_code <> 5",
            [mockInput.studentID]
        );
    });

});