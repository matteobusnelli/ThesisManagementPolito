# Thesis Management - Group 13

## Students

Alvandkoohi sajjad s314581
Amat Carla s320836
Busnelli Matteo s317090
Campagnale Paolo s317687
Corrias Jacopo s310381
Fissore Manuel 319980
Maggio Giuseppe 313346

## Contents

- [React Client Application Routes](#react-client-application-routes)
- [Docker Compose](#docker-compose)
- [API Server](#api-server)
  - [Authentication Server](#authentication-server)
    - [Login Server](#login-server)
    - [Check if user is logged in Server](#check-if-user-is-logged-in-server)
    - [Logout Server](#logout-server)
  - [Other APIs Server](#other-apis-server)
    - [OTHER 1 Server](#other-1-server)
    - [OTHER 2 Server](#other-2-server)
    - [OTHER 3 Server](#other-3-server)
- [API Client](#api-client)
  - [Authentication Client](#authentication-client)
    - [Login Client](#login-client)
    - [Check if user is logged in Client](#check-if-user-is-logged-in-client)
    - [Logout Client](#logout-client)
  - [Other APIs](#other-apis-client)
    - [getThesisProposals](#getThesisProposals)
    - [OTHER 2 Client](#other-2-client)
    - [OTHER 3 Client](#other-3-client)
- [Database Tables](#database-tables)
- [Main React Components](#main-react-components)
- [Users Credentials](#user-credentials)

## React Client Application Routes

- Route `/`: Initial route that automatically redirects to login page
- Route `/virtualclock`: Route containing the virtual clock
- Route `/profproposals`: Route only accessible to authenticated professors. It contains the active proposals of the professor currently logged-in.
- Route `/studproposals`: Route only accessible to authenticated students. It contains a list of all thesis proposals related to the degree of the logged-in student.
- Route `/newproposal`: Route only accessible to authenticated professors. It allows them to create a new thesis proposal by filling all its informations (title, description, supervisor, co-supervisors, level, keywords, type, group, required knowledge, notes, expiration date, degree and if it's archived).
- Route `/copyproposal/:idCopy`: Route only accessible to authenticated professors. It allows them to create a new thesis proposal by copying an already existing one.
- Route `/updateproposal/:idUpd`: Route only accessible to authenticated professors. It allows them to update an existing thesis proposal by changing its fields.
- Route `/viewproposal/:idView`: Route only accessible to authenticated professors. It allows them to see the details of a thesis proposal.
- Route `/applications`: Route only accessible to authenticated professors. It contains a list of all pending applications from students for thesis created by the logged-in professor, grouped by thesis.
- Route `/studentapplications`: Route only accessible to authenticated students. It contains a list of all applications made by the logged-in student, along with their status (pending, approved or rejected).
- Route `/proposals/:id`: Route only accessible to authenticated students. It allows them to see the details of a thesis proposal and to apply to it.
- Route `/requests`: Route only accessible to authenticated professors. It contains a list of all student requests for thesis supervised by the logged-in professor.
- Route `/studentrequests`: Route only accessible to authenticated students. It contains a list of all requests made by the logged-in student.
- Route `/newrequest`: Route only accessible to authenticated students. It allows them to create a new thesis request by filling the following informations : title, description, supervisor, internal co-supervisors.

## Docker Compose

### How to run the application via Docker Compose **as a developper** ?

First, modify in the server/dao.js file the dbConfig host from "127.0.0.1" to "database" :

```
  host: "database",
```

Finally, run this command at the root of the project :

```
docker compose up -d --build
```

Your app is accessible on this URL `http://localhost:5173/` !

### How to run the application via Docker Compose as a regular user ?

First, download the docker-compose.yml of our project.

Then, open a terminal in the same directory and run this command :

```
docker compose up -d --build
```

Once you see that the 3 containers started, you can access the app via this URL `http://localhost:5173/` on your browser !

### How to stop the application ?

Run in the same terminal the following command :

```
docker compose down
```

## API Server

### Authentication Server

#### **Logout Server** `POST /api/logout`

- **Description**: Destroy the user session

#### **User Info**: `GET /api/whoami`

- **Description**: Get the user's info
- **Response**:
  - `200 OK` if the user is logged in correctly.
  - `401 Unauthorized Access` if the user is not authenticated.
  - `500 Internal Server Error` if an unexpected error occurs.
- **Example**:
  ```json
  issuer: 'urn:dev-alc65i0s4u7pc5m2.us.auth0.com',
  inResponseTo: '_f043598e0347a83c0a32046fac39f770254bce78',
  sessionIndex: '_IpBIvOzKqKO0Kvd3XxTf5lXsF77MvNmK',
  nameID: 'auth0|6558a48531108fd1ba12d457',
  nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'auth0|6558a48531108fd1ba12d457',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'luca.esposito@studenti.polito.it',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Luca Esposito',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn': 'luca.esposito@studenti.polito.it',
  'http://schemas.auth0.com/identities/default/connection': 'Username-Password-Authentication',
  'http://schemas.auth0.com/identities/default/provider': 'auth0',
  'http://schemas.auth0.com/identities/default/isSocial': 'false',
  'http://schemas.auth0.com/clientID': 'NIBQ40Cep9RJAwUIviRdgPCAPMhY7iG8',
  'http://schemas.auth0.com/created_at': '2023-11-18T11:48:21.990Z',
  'http://schemas.auth0.com/email_verified': 'true',
  'http://schemas.auth0.com/nickname': 'luca.esposito',
  'http://schemas.auth0.com/picture': 'https://s.gravatar.com/avatar/fdcbf1d09f21e1f6d11828f216c87dd3?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Flu.png',
  'http://schemas.auth0.com/updated_at': '2024-01-13T09:07:28.944Z',
  'http://schemas.auth0.com/user_type': 'STUD',
  attributes: {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'auth0|6558a48531108fd1ba12d457',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'luca.esposito@studenti.polito.it',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Luca Esposito',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn': 'luca.esposito@studenti.polito.it',
    'http://schemas.auth0.com/identities/default/connection': 'Username-Password-Authentication',
    'http://schemas.auth0.com/identities/default/provider': 'auth0',
    'http://schemas.auth0.com/identities/default/isSocial': 'false',
    'http://schemas.auth0.com/clientID': 'NIBQ40Cep9RJAwUIviRdgPCAPMhY7iG8',
    'http://schemas.auth0.com/created_at': '2023-11-18T11:48:21.990Z',
    'http://schemas.auth0.com/email_verified': 'true',
    'http://schemas.auth0.com/nickname': 'luca.esposito',
    'http://schemas.auth0.com/picture': 'https://s.gravatar.com/avatar/fdcbf1d09f21e1f6d11828f216c87dd3?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Flu.png',
    'http://schemas.auth0.com/updated_at': '2024-01-13T09:07:28.944Z',
    'http://schemas.auth0.com/user_type': 'STUD'
  },
  user_type: 'STUD',
  username: 'luca.esposito@studenti.polito.it',
  name: 'Luca Esposito'
  ```

#### **Get Thesis Proposals**: `GET /api/proposals/:date`

- **Description**: Get all the active thesis for the specif user (Student or Professor)
- **Middleware**: `isLoggedIn`
- **Request Parameters**:
  - `date` (string): The date of today or the virtual clock one.
- **Response**:
  - `200 OK`
  - `401 Unauthorized Access` if the user is not authenticated.
  - `500 Internal Server Error` if an unexpected error occurs.
- **Example**:
  ```json
   [
    {
    **id**: 13,
    title: 'Quantum Computing Algorithms',
    description: `The thesis, "Quantum Computing Algorithms," explores the cutting-edge realm of quantum computing, investigating both theoretical frameworks and practical implementations of algorithms that harness the unique properties of quantum systems. The research delves into quantum parallelism, entanglement, and superposition to design algorithms that outperform classical counterparts in specific computational tasks. Key aspects include an examination of Shor's algorithm for factoring large numbers exponentially faster than classical algorithms, and Grover's algorithm for unstructured search problems, showcasing the potential for quantum speedup. The study addresses challenges such as quantum error correction, qubit coherence, and the development of quantum gates.Real-world applications span optimization problems, cryptography, and simulations of quantum systems. The thesis serves as a pivotal resource for researchers, mathematicians, and computer scientists navigating the complexities of quantum algorithms, contributing to the ongoing revolution in computing paradigms.`,
    name: 'Mario',
    surname: 'Rossi',
    thesis_level: 'Master',
    thesis_type: 'Sperimental',
    required_knowledge: 'Understanding of quantum computing principles and algorithms.',
    notes: 'None',
    expiration: 2024-09-15T21:59:59.000Z,
    keywords: [ 'QUANTUM COMPUTING', ' ALGORITHMS', ' THEORETICAL PHYSICS' ],
    title_degree: 'Computer engineering Master Degree',
    group_name: [ [Object] ],
    department_name: 'Computer department',
    is_archived: 0,
    cosupervisors: []
    }
  ]
  ```

#### **New application**: `POST /api/newApplication/:thesis_id`

- **Description**: Create a new application for a thesis.
- **Middleware**: `isStudent`
- **Request Parameters**:
  - `thesis_id` (integer): The ID of the thesis to apply for.
- **Request Body**:
  - `date` (string): The date associated with the application.
- **Response**:
  - `200 OK` if the application is created successfully.
  - `422 Unprocessable Entity` if the thesis is not valid or the user has already applied for it.
  - `500 Internal Server Error` if an unexpected error occurs.
- **Example**:
  ```json
  {
    "Application created successfully"
  }
  ```

#### **Get Thesis Proposal**: `GET /api/proposal/:thesis_id`

- **Description**: Get the thesis'info with a specific thesis id
- **Middleware**: `isLoggedIn`
- **Request Parameters**:
  - `thesisId` (integer): The id of the thesis.
- **Response**:
  - `200 OK`
  - `401 Unauthorized Access` if the user is not authenticated.
  - `500 Internal Server Error` if an unexpected error occurs.
- **Example**:
  ```json
    {
    **id**: 13,
    title: 'Quantum Computing Algorithms',
    description: `The thesis, "Quantum Computing Algorithms," explores the cutting-edge realm of quantum computing, investigating both theoretical frameworks and practical implementations of algorithms that harness the unique properties of quantum systems. The research delves into quantum parallelism, entanglement, and superposition to design algorithms that outperform classical counterparts in specific computational tasks. Key aspects include an examination of Shor's algorithm for factoring large numbers exponentially faster than classical algorithms, and Grover's algorithm for unstructured search problems, showcasing the potential for quantum speedup. The study addresses challenges such as quantum error correction, qubit coherence, and the development of quantum gates.Real-world applications span optimization problems, cryptography, and simulations of quantum systems. The thesis serves as a pivotal resource for researchers, mathematicians, and computer scientists navigating the complexities of quantum algorithms, contributing to the ongoing revolution in computing paradigms.`,
    name: 'Mario',
    surname: 'Rossi',
    thesis_level: 'Master',
    thesis_type: 'Sperimental',
    required_knowledge: 'Understanding of quantum computing principles and algorithms.',
    notes: 'None',
    expiration: 2024-09-15T21:59:59.000Z,
    keywords: [ 'QUANTUM COMPUTING', ' ALGORITHMS', ' THEORETICAL PHYSICS' ],
    title_degree: 'Computer engineering Master Degree',
    group_name: [ [Object] ],
    department_name: 'Computer department',
    is_archived: 0,
    cosupervisors: []
    }
  ```

#### **Upload files**: `POST /api/newFiles/:thesis_id`

- **Description**: Upload files related to a thesis application.
- **Middleware**: `isStudent`
- **Request Parameters**:
- `Thesis_id` (integer): The ID of the thesis to upload the file for.
- **Request Body**:
  - Form Data: `file` (array of files, up to 10 files allowed).
- **Response**:
  - `200 OK` if files are uploaded correctly.
  - `500 Internal Server Error` if an unexpected error occurs or there's a multer error during file upload.
- **Example**:
  ```json
  [
    {
      "file": "file1.pdf"
    },
    {
      "file": "file2.pdf"
    }
  ]
  ```

#### **New thesis**: `POST /api/newThesis`

- **Description**: Creates a new thesis and related int/external cosupervisors
- **Middleware**: `isProfessor`
- **Request Body**:
  - `title` (string): The title of the thesis that is created,
  - `description` (string): The description of the thesis that is created,
  - `supervisor_id` (string): The supervisor ID of the thesis that is created,
  - `thesis_level` (string): The level of the thesis that is created,
  - `type_name` (string): The type of the thesis that is created,
  - `required_knowledge` (string): The required knowledge of the thesis that is created,
  - `notes` (string): Notes about the thesis that is created,
  - `expiration` (date): The expiration date of the thesis that is created,
  - `cod_degree` (string): The degree of the thesis that is created,
  - `is_archived` (boolean): If the thesis that is created is archived,
  - `keywords` (string): The keywords of the thesis that is created,
  - `internal_cosupervisiors` (array): The internal co-supervisors of the thesis that is created,
  - `external_cosupervisiors` (array): The external co-supervisors of the thesis that is created
- **Response**:
  - `200 OK` thesis body if all the fields are correct
  - `422 Unprocessable Entity` if some inputs are wrong
  - `400`if data is incorrect
- **Example**:
  ```json
  {
    "title": "Test ERROR2",
    "description": "Test description",
    "supervisor_id": "P123456",
    "thesis_level": "Bachelor",
    "type_name": "Test type_name2",
    "required_knowledge": " Test required_knowledge",
    "notes": " test noted",
    "expiration": "2024-12-31 23:59:59",
    "cod_degree": "DEGR01",
    "is_archived": 0,
    "keywords": "IoT, Genetica",
    "cod_group": "GRP01",
    "cosupervisors_external": ["antonio.bruno@email.org"],
    "cosupervisors_internal": ["P123456"]
  }
  ```

#### **New request**: `POST /api/newThesis`

- **Description**: Create a new thesis request
- **Middleware**: `isStudent`
- **Request Body**:
  - `title` (string): The title of the thesis that is created,
  - `description` (string): The description of the thesis that is created,
  - `supervisor_id` (string): The supervisor ID of the thesis that is created,
  - `internal_cosupervisiors` (array): The internal co-supervisors of the thesis that is created,
- **Response**:
  - `200 Ok` thesis body if all the fields are correct
  - `422 Unprocessable Entity` if some inputs are wrong
  - `400`if data is incorrect
- **Example**:
  ```json
  {
    "title": "Test ERROR2",
    "description": "Test description",
    "supervisor_id": "P123456",
    "cosupervisors_internal": ["P123456"]
  }
  ```

#### **External co-supevisors list**: `GET /api/listExternalCosupervisors`

- **Description**: Returns list of every external cosupervisors
- **Middleware**: `isProfessor`
- **Response**:
  - array of external co-supervisors
  - `500 Internal Server Error` if an unexpected error occurs
- **Example**:
  ```json
  [
    {
      "email": "testmai22222222l@mail.org",
      "name": "testname",
      "surname": "testsurname"
    }
  ]
  ```

#### **New external co-supevisors**: `POST /api/newExternalCosupervisor`

- **Description**: Creates new external cosupervisor
- **Middleware**: `isProfessor`
- **Request Body**:
  - `email` (string): The email of the external co-supervisor that is created,
  - `surname` (string): The surname of the external co-supervisor that is created
  - `name` (string): The name of the external co-supervisor that is created,
- **Response**:
  - `200 OK`new external co-supervisor body
  - `401 Unauthorized` if not logged in as professor
  - `422 Unprocessable Entity` if some inputs are wrong
  - `400`if data is incorrect
- **Example**:
  ```json
  [
    {
      "email": "testmai22222222l@mail.org",
      "name": "testname",
      "surname": "testsurname"
    }
  ]
  ```

#### **Get Pending Application**: `GET /api/getApplications`

- **Description**: Returns list of every application for the professor
- **Middleware**: `isProfessor`
- **Response**:
  - `200 OK`array of applications
  - `401 Unauthorized` if not logged in as professor
  - `500 Internal Server Error` if an unexpected error occurs
- **Example**:
  ```json
  [
    {
      "student_id": "S123456",
      "student_name": "Luca Esposito",
      "thesis_id": 13,
      "thesis_title": "Quantum Computing Algorithms",
      "application_date": "2024-01-13T09:34:45.000Z"
    }
  ]
  ```

#### **Update application status**: `POST /api/updateApplicationStatus`

- **Description**: Updates status of application
- **Middleware**: `isProfessor`
- **Request Body**:
  - `thesis_id` (string): The id of the thesis the application refers to,
  - `student_id` (string): The id of the student of the application,
  - `status` (string): The new status of the application ,
- **Response**:
  - `200 OK`Some application information
  - `401 Unauthorized` if not logged in as professor
  - `400` if data is incorrect
- **Example**:
  ```json
  {
    "student_id": "S123456",
    "thesis_id": 3,
    "status": "Accepted"
  }
  ```

#### **Is Applied**: `GET /api/isApplied`

- **Description**: Return 0 if the student does not have a pending or accepted application, otherwise 1
- **Middleware**: `isStudent`
- **Response**:
  - `200 OK` 0 or 1
  - `401 Unauthorized` if not logged in as student
  - `500 Internal Server Error` if an unexpected error occurs

#### **Update a thesis proposal**: `PUT /api/updateThesis`

- **Description**: Updates an existing thesis including its group, internal cosupervisors and external cosupervisors
- **Middleware**: `isProfessor`
- **Request Body**:
  - `thesis_id` (unsigned non-zero integer): The id of the thesis,
  - `title` (string): The new title of the thesis,
  - `description` (string): The new description of the thesis,
  - `supervisor_id` (string): The new supervisor ID of the thesis,
  - `thesis_level` (string): The new level of the thesis,
  - `type_name` (string): The new type of the thesis,
  - `required_knowledge` (string): The new required knowledge of the thesis,
  - `notes` (string): The new notes about the thesis,
  - `expiration` (date): The new expiration date of the thesis,
  - `cod_degree` (string): The new degree of the thesis,
  - `is_archived` (boolean): If the updated thesis is archived,
  - `keywords` (string): The new keywords of the thesis,
  - `cosupervisors_internal` (array): The new internal co-supervisors of the thesis,
  - `cosupervisors_external` (array): The new external co-supervisors of the thesis
  - `cod_group` (string): The new code group of the thesis
- **Response**:
  - In case of success, the api returns all the fields of the updated thesis as memorized inside the database
  ```
  {
    "thesis_id": n (unsigned non-zero integer),
    "title": "new title",
    "description": "new description",
    "supervisor_id": "new supervisor_id",
    "thesis_level": "new thesis_level",
    "type_name": "new type_name",
    "required_knowledge": "new required_knowledge",
    "notes": "new notes",
    "expiration": "new expiration as string in the format YYYY-MM-DDThh:mm:ss.sssZ",
    "cod_degree": "new cod_degree",
    "is_archived": new_is_archived (boolean),
    "keywords": "new keywords"
  }
  ```
  - `422` if some inputs are wrong
  - `400` if data is incorrect
  - `500` if inside the group_table there was more than one entry with thesis_id equal to the one passed inside the request body
  - `503` if a database error occurres
- **Example**:
  ```json
  {
    "thesis_id": 1,
    "title": "new title",
    "description": "new description",
    "supervisor_id": "P654321",
    "thesis_level": "Bachelor",
    "type_name": "new type_name",
    "required_knowledge": "new required_knowledge",
    "notes": "new notes",
    "expiration": "2050-01-01T00:00:00.000Z",
    "cod_degree": "DEGR02",
    "is_archived": false,
    "keywords": "k1, k2",
    "cosupervisors_internal": ["P123456"],
    "cosupervisors_external": ["elena.conti@email.net"],
    "cod_group": "GRP02"
  }
  ```

#### **Download all student's application files**: `GET /api/getAllFiles/:student_id/:thesis_id`

- **Description**: Download all files associated with an application
- **Middleware**: `isProfessor`
- **Request Body**: None,
- **Response**:
  - `200` with a zip folder inside res.download containing all the files of the application
  - `500` if an unexpected error occurs

#### **Download a single student's application file**: `GET /api/getFile/:student_id/:thesis_id/:file_name`

- **Description**: Download a single file associated with an application
- **Middleware**: `isProfessor`
- **Request Body**: None,
- **Response**:
  - `200` with a pdf file inside res.download
  - `500` if an unexpected error occurs

#### **Show the list of all files related to an application**: `GET /api/getStudentFilesList/:student_id/:thesis_id`

- **Description**: Get the list of the names of all the PDF files linked to an application
- **Middleware**: `isProfessor`
- **Request Body**: None,
- **Response**:
  - `200` with a list of strings representing files' name
  - `500` if an unexpected error occurs

#### **Sets the datetime to real datetime**: `PUT /api/setRealDateTime`

- **Description**: Sets the datetime to real datetime
- **Middleware**: 
- **Request Body**: None,
- **Response**:
  - `200` with number of updated rows and current datetime
  - `500` if an unexpected error occurs
  - `422` if some inputs are wrong

#### **Sets the datetime to fake datetime**: `PUT /api/setVirtualDateTime`

- **Description**: Sets the datetime to fake datetime selected
- **Middleware**: 
- **Request Body**: {
      datetime: virtualTime,
    },
- **Response**:
  - `200` with number of updated rows and current datetime
  - `500` if an unexpected error occurs
  - `422` if some inputs are wrong

#### **Gets professor's proposals**: `GET /api/getProposalsProfessor`

- **Description**:Get list of proposals of professor
- **Middleware**: isProfessor
- **Request Body**:
- **Response**:
  - `200` with number of updated rows and current datetime
  - `500` if an unexpected error occurs

#### **Update the archiviation sattus of  a thesis**: `PUT /api/archiveProposalManual`

- **Description**: Sets the archiviation status of a thesis to the one provided
- **Middleware**: isProfessor
- **Request Body**:
- **Response**:
  - `200` thesis id of updated thesis
  - `500` if an unexpected error occurs

#### **Gets the list of teachers**: `GET /api/teachersList`

- **Description**: Gets the list of teachers
- **Middleware**: isLoggedIn
- **Request Body**:
- **Response**:
  - `200` list of teachers
  - `500` if an unexpected error occurs

#### **Gets the list of groups**: `GET /api/groups`

- **Description**: Gets the list of groups
- **Middleware**: isProfessor
- **Request Body**:
- **Response**:
  - `200` list of groups
  - `500` if an unexpected error occurs

#### **Gets the list of degrees**: `GET /api/degrees`

- **Description**: Gets the list of degrees
- **Middleware**: isProfessor
- **Request Body**:
- **Response**:
  - `200` list of degrees
  - `500` if an unexpected error occurs

#### **Deletes a proposal**: `DELETE /api/deleteproposal`

- **Description**: Deletes a proposal
- **Middleware**: isProfessor
- **Request Body**: { thesis_id: thesisID }
- **Response**:
  - `200` success message
  - `500` if an unexpected error occurs

#### **Gets thesis of professor with  id**: `GET /api/getThesisForProfessorById/:id`

- **Description**: Gets thesis of professor, with a certain thesis id
- **Middleware**: isProfessor
- **Request Body**: 
- **Response**:
  - `200` thesis object
  - `500` if an unexpected error occurs

#### **Gets the list of requests of a professor**: `GET /api/getrequestsforprof`

- **Description**: Gets the list of requests of a professor
- **Middleware**: isProfessor
- **Request Body**: 
- **Response**:
  - `200` list of requests
  - `500` if an unexpected error occurs

#### **Gets the list of requests for a secretary**: `GET /api/getrequestsforsecr`

- **Description**: Gets the list of requests for a secretary
- **Middleware**: isSecretary
- **Request Body**: 
- **Response**:
  - `200` list of requests
  - `500` if an unexpected error occurs

#### **Updates a request**: `PUT /api/updateRequest/:id`

- **Description**: Updates a request
- **Middleware**: isSecretaryOrProfessor
- **Request Body**: {change: newValue}
- **Response**:
  - `200` message: "updated"
  - `500` if an unexpected error occurs

#### **Gets cv of a student**: `GET api/getStudentCv/:student_id`

- **Description**:  Gets cv of a student
- **Middleware**: isSecretaryOrProfessor
- **Request Body**: 
- **Response**:
  - `200` cv 
  - `500` if an unexpected error occurs

#### **Gets data of a student with id**: `GET api/api/getStudent/:student_id`

- **Description**:  Gets data of a student with id
- **Middleware**: isSecretaryOrProfessor
- **Request Body**: 
- **Response**:
  - `200` student data
  - `500` if an unexpected error occurs

#### OTHER 1 Server

#### OTHER 2 Server

#### OTHER 3 Server

## API Client

### Authentication Client

#### Login Client

#### Check if user is logged in Client

#### Logout Client

### Other APIs Client

#### getThesisProposals

- Description: Asks the server for the list of all thesis proposals relating to the degree of the logged-in student
- API server called: GET `/api/proposals`
- Input: _None_
- Output: A vector containing detailed information on all thesis proposals

```
[
    {
        id: id,
        title: "title",
        description: "description",
        supervisor: "supervisor",
        level: "level",
        type: "type",
        required_knowledge: "required_knowledge",
        notes: "notes",
        expiration: expiration,
        keywords: [
            "keyword 1",
            "keyword 2",
            "keyword 3",
            ...
        ],
        group: "group",
        department: "department",
        co_supervisors: [
            "co supervisor 1",
            "co supervisor 2",
            "co supervisor 3",
            "co supervisor 4",
            ...
        ]
    },
    {
        ...
    },
    ...
]
```

#### newProposal

- Description: Asks the server to create a new thesis proposal
- API server called: POST `/api/newProposal`
- Input: thesis object
- Output: inserted thesis object or errors

```
{
    "title": "Test ERROR2",
    "description": "Test description",
    "supervisor_id":"P123456",
    "thesis_level": "Bachelor",
    "type_name": "Test type_name2",
    "required_knowledge": " Test required_knowledge",
    "notes": " test noted",
    "expiration": "2024-12-31 23:59:59",
    "cod_degree": "DEGR01",
    "is_archived": 0,
    "keywords" : "IoT, Genetica",
    "cod_group" : "GRP01",
    "cosupervisors_external": ["antonio.bruno@email.org"],
    "cosupervisors_internal": ["P123456"]

}
```

#### getListExternalCosupervisors

- Description: Asks the server for the list of all the external co-supervisors
- API server called: GET `/api/listExternalCosupervisors`
- Input: _None_
- Output: A vector containing detailed information on all external co-supervisors

```
[
{
    "email": "testmai22222222l@mail.org",
    "name":"testname",
    "surname":"testsurname"

}
]
```

#### newExternalCosupervisor

- Description: Asks the server to create a new external co-supervisors
- API server called: POST `/api/newExternalCosupervisor`
- Input: external co-supervisor object
- Output: inserted external co-supervisor object

```
{
    "email": "testmai22222222l@mail.org",
    "name":"testname",
    "surname":"testsurname"

}
```

#### updateExpiration

- Description: Asks the server to update archivation of proposals based on new virtual clock time
- API server called: PUT `/api/updateThesesArchivation`
- Input: datetime string
- Output: information on update

```
"Rows matched: 6  Changed: 3  Warnings: 0"
```

#### downloadStudentApplicationAllFiles

- Description: Asks the server to download a zip folder containing all the files associated with an application
- API server called: GET `/api/getAllFiles/:student_id/:thesis_id`
- Input:
  - `student_id`: The id of the student who submitted the application
  - `thesis_id`: The id of the thesis for which the student submitted the application.
- Output: _None_

#### downloadStudentApplicationFile

- Description: Asks the server to download one of the PDF files associated with an application
- API server called: GET `/api/getFile/:student_id/:thesis_id/:file_name`
- Input:
  - `student_id`: The id of the student who submitted the application
  - `thesis_id`: The id of the thesis for which the student submitted the application.
  - `file_name`: The name of the file to be downloaded
- Output: _None_

#### listApplicationFiles

- Description: Asks the server for the list of files' name associated with an application
- API server called: GET `/api/getStudentFilesList/:student_id/:thesis_id`
- Input:
  - `student_id`: The id of the student who submitted the application
  - `thesis_id`: The id of the thesis for which the student submitted the application.
- Output: A vector of strings, each representing the name of one of the files associated with the application
- Example:

```json
[
  "file_1.pdf",
  "file_2.pdf",
  "file_3.pdf",
  ...
]
```
#### setRealTime

- Description: Sets the 
- API server called: GET `/api/setRealDateTime`
- Input: None
- Output: A vector of strings, each representing the name of one of the files associated with the application
- Example:






#### OTHER 2 Client

#### OTHER 3 Client

## Database Tables

### Table: user_type

This table contains the different user types.

- **id (VARCHAR(4), PRIMARY KEY):** Unique identifier for each user type.
- **user_type (VARCHAR(30), NOT NULL):** Descriptive name for the user type.

### Table: users

This table contains all the registered users with their credentials and type.

- **email (VARCHAR(255), PRIMARY KEY):** User email as unique identifier for each user.
- **salt (VARCHAR(16), NOT NULL):** Salt used for password hashing.
- **password (VARCHAR(128), NOT NULL):** Hashed password for user authentication.
- **user_type_id (VARCHAR(4), NOT NULL, FOREIGN KEY):** Foreign key referencing user_type(id).

### Table: student

This table contains all the students with their personal and studies informations.

- **id (VARCHAR(7), PRIMARY KEY):** Unique identifier for each student.
- **surname (VARCHAR(50), NOT NULL):** Student's surname.
- **name (VARCHAR(50), NOT NULL):** Student's first name.
- **gender (VARCHAR(10), NOT NULL):** Student's gender.
- **nationality (VARCHAR(50), NOT NULL):** Student's nationality.
- **email (VARCHAR(255), NOT NULL):** Student's email.
- **cod_degree (VARCHAR(10), NOT NULL, FOREIGN KEY):** Foreign key referencing degree_table(cod_degree).
- **enrollment_year (INT, NOT NULL):** Year when the student enrolled.

### Table: teacher

This table contains all the teachers with their informations.

- **id (VARCHAR(7), PRIMARY KEY):** Unique identifier for each teacher.
- **surname (VARCHAR(50), NOT NULL):** Teacher's surname.
- **name (VARCHAR(50), NOT NULL):** Teacher's first name.
- **email (VARCHAR(255), NOT NULL):** Teacher's email.
- **cod_group (VARCHAR(10), NOT NULL):** Group code where the teacher belongs.
- **cod_department (VARCHAR(10), NOT NULL):** Department code where the teacher belongs.

### Table: secretary

This table contains all the secretaries with their informations.

- **id (VARCHAR(7), PRIMARY KEY):** Unique identifier for each secretary.
- **surname (VARCHAR(50), NOT NULL):** Secretary's surname.
- **name (VARCHAR(50), NOT NULL):** Secretary's first name.
- **email (VARCHAR(255), NOT NULL):** Secretary's email.

### Table: degree_table

This table contains the degrees available.

- **cod_degree (VARCHAR(10), PRIMARY KEY):** Code degree as unique identifier for each degree.
- **title_degree (VARCHAR(100), NOT NULL):** Title of the degree.

### Table: career

This table contains all the different careers of each student and their courses.

- **id (VARCHAR(7), NOT NULL, FOREIGN KEY):** Foreign key referencing student(id).
- **cod_course (VARCHAR(10), NOT NULL):** Code for the course.
- **title_course (VARCHAR(50), NOT NULL):** Title of the course.
- **cfu (INT, NOT NULL):** Credit units for the course.
- **grade (DECIMAL(3, 0), NOT NULL):** Grade obtained by the student.
- **date (DATE, NOT NULL):** Date when the course was completed.

### Table: group_table

This table contains all the groups.

- **cod_group (VARCHAR(10), PRIMARY KEY):** Code group as unique identifier for each group.
- **group_name (VARCHAR(50), NOT NULL):** Name of the group.

### Table: department

This table contains all the departments and their related groups.

- **cod_department (VARCHAR(10), NOT NULL):** Code for the department.
- **department_name (VARCHAR(50), NOT NULL):** Name of the department.
- **cod_group (VARCHAR(10), NOT NULL, FOREIGN KEY):** Foreign key referencing group_table(cod_group).

### Table: external_supervisor

This table contains all the possible external thesis co-supervisors and their informations.

- **email (VARCHAR(255), PRIMARY KEY):** External co-supervisor email as unique identifier for each external co-supervisor.
- **surname (VARCHAR(50), NOT NULL):** External co-supervisor's surname.
- **name (VARCHAR(50), NOT NULL):** External co-supervisor's first name.

### Table: thesis

This table contains all the thesis proposals with their characteristics.

- **id (INT, AUTO_INCREMENT, PRIMARY KEY):** Unique identifier for each thesis.
- **title (VARCHAR(100), NOT NULL):** Title of the thesis.
- **description (TEXT, NOT NULL):** Description of the thesis.
- **supervisor_id (VARCHAR(7), NOT NULL, FOREIGN KEY):** Id of the supervisor of the thesis as foreign key referencing teacher(id).
- **thesis_level (VARCHAR(20), NOT NULL):** Level of the thesis.
- **thesis_type (VARCHAR(50), NOT NULL):** Type of the thesis.
- **required_knowledge (TEXT, NOT NULL):** Required knowledge for the thesis.
- **notes (TEXT, NOT NULL):** Additional notes for the thesis.
- **expiration (DATETIME, NOT NULL):** Expiration date for the thesis.
- **cod_degree (VARCHAR(10), NOT NULL, FOREIGN KEY):** Degree of the thesis as foreign key referencing degree_table(cod_degree).
- **keywords (TEXT):** Keywords associated with the thesis.
- **is_archived (BOOLEAN, NOT NULL, DEFAULT 0):** Indicates whether the thesis is archived.
- **is_expired (BOOLEAN, NOT NULL, DEFAULT 0):** Indicates whether the thesis is expired.
- **is_deleted (BOOLEAN, NOT NULL, DEFAULT 0):** Indicates whether the thesis is deleted.

### Table: thesis_request

This table contains all the thesis requests, their characteristics and their status.

- **id (INT, AUTO_INCREMENT, PRIMARY KEY):** Unique identifier for each thesis request.
- **title (VARCHAR(100), NOT NULL):** Title of the thesis request.
- **description (TEXT, NOT NULL):** Description of the thesis request.
- **supervisor_id (VARCHAR(7), NOT NULL, FOREIGN KEY):** Thesis supervisor as foreign key referencing teacher(id).
- **start_date (DATETIME):** Start date of the thesis request.
- **status_code (INT, NOT NULL, DEFAULT 0):** Status code for the thesis request.

## Table: thesis_group

This table links thesis proposals with all their related groups.

- **thesis_id (INT, NOT NULL, FOREIGN KEY):** Foreign key referencing thesis(id).
- **group_id (VARCHAR(10), NOT NULL, FOREIGN KEY):** Foreign key referencing group_table(cod_group).

## Table: thesis_cosupervisor_teacher

This table links thesis proposals with all their internal co-supervisors (teachers).

- **id (INT, AUTO_INCREMENT, PRIMARY KEY):** Unique identifier for each internal cosupervisor-thesis relationship.
- **thesis_id (INT, FOREIGN KEY):** Foreign key referencing thesis(id).
- **thesisrequest_id (INT, FOREIGN KEY):** Foreign key referencing thesis_request(id).
- **cosupevisor_id (VARCHAR(7), NOT NULL, FOREIGN KEY):** Foreign key referencing teacher(id).

## Table: thesis_cosupervisor_external

This table links thesis proposals with all their external co-supervisors.

- **id (INT, AUTO_INCREMENT, PRIMARY KEY):** Unique identifier for each external cosupervisor-thesis relationship.
- **thesis_id (INT, FOREIGN KEY):** Foreign key referencing thesis(id).
- **thesisrequest_id (INT, FOREIGN KEY):** Foreign key referencing thesis_request(id).
- **cosupevisor_id (VARCHAR(255), NOT NULL, FOREIGN KEY):** Foreign key referencing external_supervisor(email).

## Table: application

This table contains all the student applications and their status.

- **student_id (VARCHAR(7), NOT NULL, FOREIGN KEY):** Foreign key referencing student(id).
- **thesis_id (INT, NOT NULL, FOREIGN KEY):** Foreign key referencing thesis(id).
- **status (VARCHAR(10), NOT NULL):** Status of the application.
- **application_date (DATETIME, NOT NULL):** Date when the application was submitted.

## Main React Components

- `SearchProposalComponent` (inside `SearchProposal.jsx`): It's a component that appears in the `/proposals` route.
  Starting from the list of thesis proposals obtained from the server, it builds a filtered list. The filter is a string that can be set in a special form on the same page. If the filtered list is empty, it shows a message, otherwise it builds a table containing a row for each thesis proposal. The table rows are constructed using the `ProposalTableRow` component present in the same file and contain only the basic information of a thesis proposals (title, supervisor and expiration date). To access all the data of a specific thesis proposal, the user needs to click on its title. If the device screen is very small, the list is replaced by an accordion. Each accordion item is buildt using the `ProposalAccordion` component and has the title of a proposal in the header and supervisor and expiration date in the body.
- `NewProposal` (inside `NewProposal.jsx`): It's a component that appears in the `/newproposal` route, only accessible by authenticated professors. It's a form component that handles the creation of a new thesis proposal. The user has to enter a few mandatory fields which are : title, supervisor_id, type, level, group, degree, expiration. The others are optional. In order to choose external co-supervisors the user can select one or more existing ones, or add a new one by clicking on the corresponding button and fill the form in the `NewExternalCosupervisor.jsx` component. The errors returned by the server are displayed at the bottom of the form when the user clicks on the create button. The internal co-supervisors and keywords inputs are handled by the `ChipsInput.jsx`component. The user has to enter them one by one by pressing enter each time.
- `TeacherPage` (inside `TeacherPage.jsx`): It's a component that appears in the `/teacher` route, only accessible by authenticated professors. It contains a button redirecting to the `NewProposal`component.

## Users Credentials

| Role  | Email | Password |
|--------|---------|--------|
| teacher |   mario.rossi@polito.it                |   P123456   	|
| teacher |   sofia.bianchi@polito.it              |   P654321   	|
| student |   luca.esposito@studenti.polito.it     |   S123456   	|
| student |   alessandra.moretti@studenti.polito.it|   S654321   	|
|secretary clerk |   paola.giallo@polito.it        |   E123456   	|

## LICENSE
![Apache License](LICENSE)