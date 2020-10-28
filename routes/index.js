const express = require('express');
const { exec } = require("child_process");
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

const operateDeadlockBolt = async (isLock) => {
  const operation = isLock === true ? 'low' : 'high';
  const commandLine = `gpio export 21 ${operation}`;
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

module.exports = router;
