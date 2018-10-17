var path = require('path');
var fs = require('fs');
// DEPENDS ON fileMiddleware = require('express-multipart-file-parser');

// ++++++ TODO 
// 1. add multiple files parse
// 2. Add commments


// DEFALUT VALUES
var _dest = '';
var _fileName = '';
var _fileExtension = '';
var _filter = {
    fileType: null,
    mimetype: [],
    extension: ''
};
var _limits = {
    fileSize: -1
}
var _file = {
    path: '',
    filename: '',
    filesize: 0
};
var _files = [];
var _NumberOfFiles = 1;

function getRandomInt() {
    var high = 5000;
    var low = 1000;
    return Math.floor(Math.random() * (high - low) + low);
}

var _errorCode = -1;
const _errors = ["Invalid File Provided", "ERROR Max. File Size Exceeded", "Invalid File Type", "Unknown ERROR Occurred"];
const ERROR_INVALID_FILE = 0;
const ERROR_FILE_SIZE_MAX = 1;
const ERROR_INVALID_FILE_TYPE = 2;
const ERROR_UNKNOWN = 3;

function saveMultipleFiles() {
    // +++++++ TODO
}

module.exports = (req, res, next) => {
    _errorCode = -1;

    if (!req.files) {
        // INVALID FILEs
        _errorCode = ERROR_INVALID_FILE;
        return;
    }

    if (_NumberOfFiles > 1) {
        saveMultipleFiles();
        res.files = _files;
        res.file = {};
        return next();
    }
    // ELSE SINGLE FiLE SAVE
    //GET AND ASSIGN FILE
    _file = req.files[0];
    if(!_file){
        _errorCode = ERROR_INVALID_FILE;
        return next();
    }

    _file.filename = getFileName() + '.' + _fileExtension;
    _file.path = '' + _dest + _file.filename;
    /*
    console.log(_file);
    console.log(_file.path);
*/
    // TEST FILE TYPE
    if (_filter.mimetype.length > 0 && !_filter.mimetype.includes(_file.mimetype)) {
        _errorCode = ERROR_INVALID_FILE_TYPE;
        return next();
    }

    // TEST FILE SIZE
    if (_file.buffer.length > _limits.fileSize) {
        _errorCode = ERROR_FILE_SIZE_MAX;
        return next();
    }

    fs.writeFileSync(_file.path, _file.buffer);

    req.file = _file;
    delete req.file['buffer']; // remove buffer object form req.file
    req.files = {}; // EMPTY FILES 
    return next();
}

// FOR HANDLING ERROR 
module.exports.processed = (cb) => {
    if (_errorCode === -1) cb(undefined);
    else cb(_errors[_errorCode]);
}

var getFileName = function () {
    return '' + Date.now() + '' + getRandomInt();
};

module.exports.init = (data) => {
    if (data.dest) _dest = data.dest;
    if (data.limits) Object.assign(_limits, data.limits);
    if (data.filter) Object.assign(_filter, data.filter);
    if (data.filename) getFileName = data.filename; // File Name if files FileName + 1 is used
    if (data.fileExtension) _fileExtension = data.fileExtension; // FILE EXTENSION for files
    if (data.files) _NumberOfFiles = data.files; // Number of files to save
}

module.exports.getRandomInt = getRandomInt;