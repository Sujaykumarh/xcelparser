/******************************************************************************
 ** Copyright (c) 2018 Sujaykumar.Hublikar <hello@sujaykumarh.com>
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **       http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 ******************************************************************************/
/**
 * Module dependencies.
 */
'use strict';
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var router = require('./routes/router');
const fileMiddleware = require('express-multipart-file-parser');
// GLOBAL Variable 
var HTTP_PORT = 5335; // App PORT

var app = express();    // Express App

app.set('appName', require(__dirname + '/package.json').name);  // SET APPNAME
app.set('appVer', require(__dirname + '/package.json').version);  // SET APPNAME

app.use(cookieParser());
app.use(session({
  secret: "SECRET_KEY", // SECRET_KEY for session
  resave: false,
  saveUninitialized: true
}));

// all enviroments
app.set('port', process.env.PORT || HTTP_PORT);
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());
app.use(bodyParser.json());
app.use(fileMiddleware); // Handle file from multipart/form-data
app.use(express.static('public'));  // Static files

app.use('/', router); // Handel all the URL routes except public 

// DEFAULT 404 for unkonwn location
app.all('*', (req, res, next) => {
    res.status(404).sendFile('404.html', {"root": path.join(__dirname, 'public')});
});


app.use((err, req, res, next) => {
    if(err){
      console.log(err);
      return res.json({
        error: err
      });
    }
    next();
});
  
  
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    console.log('Open http://localhost:' + app.get('port'));
});
    
  