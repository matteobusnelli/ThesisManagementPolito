## API Server
- OLD VERSION, DO NOT USE
- POST `/api/newThesis`
  - Receives
    {   
        "title": " ", min: 1, max: 100 characters
        "description": " ", 
        "supervisor_id":" ", min: 1, max: 7 characters
        "thesis_level": " ", ['bachelor' OR 'master']
        "type_name": " ", min: 1, max: 50 characters
        "required_knowledge": " ",
        "notes": " ",
        "expiration": " ", Date time must be in forma YYYY-MM-DD HH:MM:SS
        "cod_degree": " ", min: 1, max: 10 characters
        "is_archived": ,  boolean
        "keywords" : ["",""],
        "cod_group" : ""
        "cosupervisors": ["", ""]
    }

  - Returns {
        "id": ,
        "title": "",
        "description": " ",
        "supervisor_id": " ",
        "thesis_level": " ",
        "type_name": " ",
        "required_knowledge": " ",
        "notes": " ",
        "expiration": "",
        "cod_degree": "",
        "is_archived": boolean
}