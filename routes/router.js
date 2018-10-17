var express = require('express');
var path = require('path');
var router = express.Router();

var api = require('./api');
router.use('/api', api);

router.all('/', (req, res, next) => {
    res.sendFile('index.html', { 'root' : 'public'});
});

router.all('*', (req, res, next) => {
    res.redirect('/');
});

module.exports = router;
