const dao = require("../dao");

async function updateThesisRequest(req, res) {
  console.log(req.user.user_type)
  try {
    if(req.user.user_type === 'SECR'){
      await dao.secretaryThesisRequest(req.params.id, req.body.change);
      console.log('secr')
    }
    else{
      console.log('teacher')
      await dao.teachersThesisRequest(req.params.id, req.body.change);
    }

    return res.status(200).json("updated");
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getRequestsForProfessor(req, res) {
  try {
    console.log(req.user);
    let requests = await dao.getRequestsForProfessor(req.user.username);
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getRequestsForSecretary(req, res) {
  try {
    let requests = await dao.getRequestsForSecretary();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  updateThesisRequest,
  getRequestsForProfessor,
  getRequestsForSecretary,
};
