var express = require('express');
var router = express.Router();

router.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var parser = require('./api/parser/parser');
router.use('/parser', parser);


module.exports = router;