const dao = require("../dao");
const { validationResult } = require("express-validator");

async function getProposals(req, res) {
  try {
    const proposals = await dao.getProposals(
      req.user.user_type,
      req.user.username,
      req.query.date
    );
    res.status(200).json(proposals);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getProposal(req, res) {
  const thesis_id = req.params.id; // Extract thesis_id from the URL
  try {
    if (!Number.isInteger(Number(thesis_id))) {
      throw new Error("Thesis ID must be an integer");
    }

    const proposal = await dao.getProposalById(
      thesis_id,
      req.user.user_type,
      req.user.username
    );
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getProposalsProfessor(req, res) {
  try {
    const proposals = await dao.getProposalsProfessor(req.user.username);

    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];
      let vettExtCosup = await dao.getThesisExCosupervisorForProfessorById(
        proposal.id
      );
      if (vettExtCosup.length > 0) {
        proposals[i].external_cosupervisors = vettExtCosup;
      } else {
        proposals[i].external_cosupervisors = [];
      }
      let vettIntCosup = await dao.getThesisIntCosupervisorForProfessor(
        proposal.id
      );
      if (vettIntCosup.length > 0) {
        proposals[i].internal_cosupervisors = vettIntCosup;
      } else proposals[i].internal_cosupervisors = [];
    }

    return res.status(200).json(proposals);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = { getProposals, getProposal, getProposalsProfessor };
