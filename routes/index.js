var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/v2/pushPackages/web.app.netlify.webpush', function(req, res){
  res.header({"Content-type":"application/zip"});
  res.sendFile(path.resolve('./var/www/safari.push/pushPackage.zip'));
});

module.exports = router;
