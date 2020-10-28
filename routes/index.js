const express = require('express');
const { exec } = require("child_process");
const router = express.Router();
require('dotenv').config();

const lockControlPinCode = process.env.LOCK_CONTROL_PIN_CODE;
const doorStatusPinCode = process.env.DOOR_STATUS_PIN_CODE;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/lock', async function (req, res) {
  try {
    const response = await operateDeadlockBolt(false);
    console.log(`닫힘: ${response}`);
    res.status(200).send(`success`);
  } catch (e) {
    res.status(500).send(`Unexpected Error`);
    console.error(`stderr: ${e}`);
  }
});

router.get('/unlock', async function (req, res) {
  try {
    const response = await operateDeadlockBolt(true);
    console.log(`닫힘: ${response}`);
    res.status(200).send(`success`);
  } catch (e) {
    res.status(500).send(`Unexpected Error`);
    console.error(`stderr: ${e}`);
  }
});


const execWithPromise = async (commandLine) => {
  return new Promise(((resolve, reject) => {
    exec(commandLine, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      else if(stderr) {
        return reject(stderr);
      }

      return resolve(stdout);
    });
  }));
}

const operateDeadlockBolt = async (isLock) => {
  const operation = isLock === true ? 'low' : 'high';
  const commandLine = `gpio export ${lockControlPinCode} ${operation}`;
  return execWithPromise(commandLine);
}

const initDoorStatusPin = async () => {
  return execWithPromise(`gpio -g mode ${doorStatusPinCode} up`);
};

const readPinData = async (pinCode) => {
  return execWithPromise(`gpio read ${pinCode}`);
}

const checkDoor = async () => {
  try {
    await initDoorStatusPin();
  } catch (e) {
    throw e;
  }

  setInterval(() => {
    console.log(readPinData(lockControlPinCode));
    console.log(readPinData(doorStatusPinCode));
  }, 1000);
}

checkDoor()
  .catch(error => {
    console.error('An error is occurred in checkDoor().');
    console.error(e);
  });

module.exports = router;
