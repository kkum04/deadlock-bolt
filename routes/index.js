const express = require('express');
const { exec } = require("child_process");
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/lock', function (req, res) {
  exec('gpio export 21 low', (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Unexpected Error'`);
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      res.status(500).send(`Unexpected Error`);
      console.log(`stderr: ${stderr}`);
      return;림
    }
    console.log(`닫힘: ${stdout}`);
    res.status(500).send(`success'`);
  });
});

router.get('/unlock', function () {
  exec('gpio export 21 high', (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Unexpected Error'`);
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      res.status(500).send(`Unexpected Error'`);
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`열: ${stdout}`);
    res.status(500).send(`success'`);
  });
});

module.exports = router;
