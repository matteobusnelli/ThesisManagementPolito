const dao = require("../dao");

async function getStudentCV(req, res) {
    try {
      const cv = await dao.getStudentExams(req.params.student_id)
      return res.status(200).json(cv);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async function getStudent(req, res) {
    try {
      const student = await dao.getStudent(req.params.student_id)
      return res.status(200).json(student);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  
  module.exports = { getStudentCV, getStudent };