var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/v2/pushPackages/web.app.netlify.push', function(req, res){
  res.header({"Content-type":"application/zip"});
  res.sendFile('pushPackage.zip',{root: __dirname});
});

module.exports = router;
