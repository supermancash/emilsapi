var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/version/pushPackages/web.app.netlify.push', function(req, res){
  res.header({"Content-type":"application/zip"});
  res.send("Post successfull!");
  //res.sendFile();
});

module.exports = router;
