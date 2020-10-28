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

const readPinData = async () => {
  return execWithPromise(`gpio exports`);
}

const getPinData = (readLines, pinCode) => {
  const pinData = readLines.split('\n')
    .map(it => it.trim())
    .map(it => it.replace(':', ''))
    .map(it => {
      return it.split(/(\s+)/)
        .map(it => it.trim())
        .filter(it => it.length > 0)
    })
    .find(it => pinCode == it[0])
    [2];
  return parseInt(pinData);
}

const checkDoor = async () => {
  try {
    await initDoorStatusPin();
  } catch (e) {
    throw e;
  }

  let autoLockCount = 0;
  setInterval(async () => {
    try {
      let readLines = await readPinData(lockControlPinCode);
      const isLock = getPinData(readLines, lockControlPinCode) === 1;
      const isOpenDoor = getPinData(readLines, doorStatusPinCode) === 0;

      //////////////////////////////////////////////////////
      // 문이 닫혀 있고, 락이 안걸려 있다면 5초 후에 문을 자동으로 닫는다.
      if (!isOpenDoor && !isLock) {
        autoLockCount++;
        console.log(`auto lock count: ${autoLockCount}`);
      }
      if (autoLockCount >= 5) {
        await operateDeadlockBolt(true);
        autoLockCount = 0;
        console.log('auto lock');
      }
      //////////////////////////////////////////////////////
    } catch (e) {
      console.error(e);
      console.error('Can not read pin data.');
    }

  }, 1000);
}

checkDoor()
  .catch(error => {
    console.error('An error is occurred in checkDoor().');
    console.error(e);
  });

module.exports = router;
