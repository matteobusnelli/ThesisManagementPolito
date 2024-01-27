const dao = require("../dao");
const multer = require("multer");
const fs = require("fs");
const zipdir = require("zip-dir");

const { validationResult } = require("express-validator");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const userID = await dao.getUserID(req.user.username);
      const thesis_id = req.params.thesis_id;
      const userFolderPath = `studentFiles/${userID}/${thesis_id}`;

      // Create directories recursively if they don't exist
      fs.mkdirSync(userFolderPath, { recursive: true });

      cb(null, userFolderPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = file.originalname;
    let filename;

    if (uniqueSuffix.endsWith(".pdf")) {
      filename = uniqueSuffix;
    } else {
      filename = uniqueSuffix + ".pdf";
    }

    filename = filename.replace(/\s/g, "_");
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8000000
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Solo file PDF sono ammessi!");
    }
  },
});

async function addFiles(req, res) {
  const thesis_id = req.params.thesis_id;
  try {
    if (!Number.isInteger(Number(thesis_id))) {
      throw new Error("Thesis ID must be an integer");
    }
    upload.array("file", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(422).json("Multer error");
        console.log(err);
      } else if (err) {
        res.status(422).json("An unexpected error occurred");
        console.log(err);
      } else {
        res.status(200).json("files uploaded correctly");
      }
    });
  } catch (error) {
    res.status(422).json(error);
  }
}

async function getAllFiles(req, res) {
  try {
    const studentID = req.params.student_id;
    const thesisID = req.params.thesis_id;
    const userFolderPath = `studentFiles/${studentID}/${thesisID}`;
    const zipFilePath = `studentFiles/${studentID}/${thesisID}/student_files_${studentID}.zip`;

    zipdir(userFolderPath, { saveTo: zipFilePath }, function (err, buffer) {
      if (err) {
        throw err;
      } else {
        res.status(200).download(zipFilePath, () => {
          // Delete the file after the download is complete
          fs.unlink(zipFilePath, (err) => {
            if (err) {
              console.error("Error deleting the zip file:", err);
            }
          });
        });
      }
    });
  } catch (error) {
    res.status(500).json("An unexpected error occurred");
  }
}

async function getStudentFilesList(req, res) {
  try {
    const studentID = req.params.student_id;
    const thesisID = req.params.thesis_id;
    const userFolderPath = `studentFiles/${studentID}/${thesisID}`;

    fs.readdir(userFolderPath, (err, files) => {
      console.log("files", files);
      if (files) {
        if (err) {
          res.status(500).json("An error occurred while reading files.");
        } else {
          const fileNames = files.map((file) => file);
          res.status(200).json(fileNames);
        }
      } else {
        res.status(200).json([]);
      }
    });
  } catch (error) {
    res.status(500).json("An unexpected error occurred");
  }
}

async function getFile(req, res) {
  try {
    const studentID = req.params.student_id;
    const thesisID = req.params.thesis_id;
    const fileName = req.params.file_name;
    const filePath = `studentFiles/${studentID}/${thesisID}/${fileName}`;

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).json("File not found");
      } else {
        res.download(filePath, fileName);
      }
    });
  } catch (error) {
    res.status(500).json("An unexpected error occurred");
  }
}

module.exports = { addFiles, getAllFiles, getStudentFilesList, getFile };
