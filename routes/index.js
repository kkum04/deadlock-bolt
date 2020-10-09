const express = require('express');
const { exec } = require("child_process");
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

const showLog = (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
}

router.get('/lock', function () {
  exec('ls -al', showLog);
});

router.get('/unlock', function () {
  exec('ls -al', showLog);
});

module.exports = router;
