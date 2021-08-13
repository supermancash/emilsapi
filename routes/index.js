var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/v2/pushPackages/web.app.netlify.push', function(req, res){
  res.header({"Content-type":"application/zip"});
  res.sendFile('../var/www/safari.push/pushPackage.zip');
});

module.exports = router;
