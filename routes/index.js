const express = require('express');
const { exec } = require("child_process");
const router = express.Router();
require('dotenv').config();

const LOCK_CONTROL_PIN_CODE = process.env.LOCK_CONTROL_PIN_CODE;
const DOOR_TYPE = process.env.DOOR_TYPE

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/lock', async function (req, res) {
  try {
    const response = await closeDoor();
    console.log(`닫힘: ${response}`);
    res.status(200).send(`success`);
  } catch (e) {
    res.status(500).send(`Unexpected Error`);
    console.error(`stderr: ${e}`);
  }
});

router.get('/unlock', async function (req, res) {
  try {
    const response = await openDoor();
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

const openDoor = async () => {
  await operateDoor(false)

  if (DOOR_TYPE === "SLIDING_DOOR") {
    setTimeout(() => closeDoor(), 3000)
  }
}

const closeDoor = () => {
  return operateDoor(true)
}

const operateDoor = async (isLock) => {
  if (DOOR_TYPE === 'DEADLOCK_BOLT') {
    isLock = !isLock
  }
  const operation = isLock === true ? 'high' : 'low';
  const commandLine = `gpio export ${LOCK_CONTROL_PIN_CODE} ${operation}`;
  return execWithPromise(commandLine);
}

execWithPromise(`gpio export ${LOCK_CONTROL_PIN_CODE} OUT`)
  .catch(error => console.error(error))

module.exports = router;
