const cron = require("node-cron");
const FakeTimers = require("@sinonjs/fake-timers");
const schedule = require("node-schedule");
const dao = require("../dao");
const { validationResult } = require("express-validator");
const CronJob = require("cron").CronJob;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "group13.thesismanagement@gmail.com",
    pass: "xuzg drbh ezyn zaqg",
  },
});

var clock = null;

async function setVirtualClock(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors });
  }
  try {
    await dao.beginTransaction();
    const newvirtual = req.body.datetime;
    if (clock && typeof clock.setSystemTime === "function") {
      clock.setSystemTime(newvirtual);
    } else {
      clock = FakeTimers.install({
        now: newvirtual,
        shouldAdvanceTime: true,
      });
    }
    const now = new Date();
    console.log("Datetime is now: ", now.toString());
    const response_msg = await dao.setExpired(newvirtual);
    let text = {
      update: response_msg,
      now: newvirtual,
    };
    await dao.commit();
    return res.status(200).json(text);
  } catch (err) {
    await dao.rollback();
    console.log(err);
    return res.status(500).json(err);
  }
}

async function uninstallVirtualClock(req, res) {
  try {
    if (clock && typeof clock.uninstall === "function") {
      clock.uninstall();
      clock = null;
    }
    const current = new Date();
    const response_msg = await dao.setExpired(current);
    console.log("Datetime is now:", current.toString("italy"));
    let text = {
      update: response_msg,
      now: current,
    };
    return res.status(200).json(text);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
}

function create_schedule() {
  const scheduled_expired = cron.schedule("0 0 0 * * *", async () => {
    await update();
  });
  const scheduled_expiring_notification = cron.schedule(
    "0 0 18 * * *",
    async () => {
      await email();
    }
  );
}

const update = async () => {
  try {
    const now = new Date();
    const result = await dao.setExpired(now);
    console.log("Task executed at 00:00 am every day in Rome timezone.");
  } catch (err) {
    console.error(err);
  }
};

const email = async () => {
  try {
    const now = new Date();
    const result = await dao.getProfessorEmailExpiring(now);
    let testing_mail = "group13.thesismanagement@gmail.com";
    for (const proposal of result) {
      console.log(proposal);
      const data = new Date(proposal.thesis_expiration).toLocaleString();
      const mailOptions = {
        from: "group13.thesismanagement@gmail.com",
        to: testing_mail, //emailData.email deve essere
        subject: `EXPIRING PROPOSAL "${proposal.thesis_title}"`,
        text: `Proposal "${proposal.thesis_title}" is gonna expire a week from now at: ${data}`,
      };
      transporter.sendMail(mailOptions, async (error, info) => {
        if (!error) {
          console.log("Email mandata");
        } else {
          console.log(error);
        }
      });
    }
    console.log("Task executed at 18:00 every day in Rome timezone.");
  } catch (err) {
    console.error(err);
  }
};


async function getServerDateTime(req, res){
  try{
    const datetime = new Date()
    res.status(200).json(datetime.toString())
  }
  catch(err){
    res.status(500).json(err)
  }
}

module.exports = { setVirtualClock, uninstallVirtualClock, create_schedule,getServerDateTime };
