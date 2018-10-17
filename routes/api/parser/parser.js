var express = require('express');
var path = require('path');
var Excel = require('exceljs');
var fs = require('fs');

var fileHandler = require('./fileHandler'); // Custom Multipart file handler
var customXLSX = require('./custom/customXLSX'); // USing cusotm info provider using JSON
var nanpScript = require('./nanp/nanp-script'); // USING Provided nanp-script.js

var router = express.Router(); // Express Router Object

var xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
var maxFileSize = 1 * 1024 * 1024; // MAX upload file size currently 1MB should be changed to fit need

// Custom file handler options
fileHandler.init({
    dest: 'tmp/', // store uploaded files in tmp/ direcory
    limits: {
        fileSize: maxFileSize
    },
    filename: function () {
        return 'file-' + Date.now() + '-' + fileHandler.getRandomInt(); // Random filenanme
    },
    fileExtension: 'xlsx',
    filter: {
        filetype: /xlsx/,
        mimetype: [xlsxMimeType, 'application/wps-office.xlsx'],
        extension: 'xlsx'
    },
    files: 1
});

// DEFAULT use customScript if nanp = true in body then use nanpScript
router.post('/xlsx', fileHandler, (req, res, next) => {
    fileHandler.processed((err) => {
        if (err) {
            console.log('fileHandler ERROR: ', err);
            return res.status(400).send({
                'error': err
            });
        }
        var file = req.file;
        req.session.filename = file.filename;
        var parseCol = 1; // Default first Column selected
        var parseWorksheet = 1; // Default first worksheet selected

        if (req.body.worksheet)
            parseWorksheet = parseInt(req.body.worksheet);

        if (req.body.col)
            parseCol = parseInt(req.body.col);

        // send error if given Column/Worksheet provided is invlaid
        if ((isNaN(parseCol) || parseCol < 1) && (isNaN(parseWorksheet) || parseWorksheet < 1)) {
            deleteTempFile(req);
            return res.status(400).json({
                'error': "Invalid Column/Worksheet Number"
            });
        }
        // send error if given Worksheet provided is invlaid
        if (isNaN(parseWorksheet) || parseWorksheet < 1) {
            deleteTempFile(req);
            return res.status(400).json({
                'error': "Invalid Worksheet Number"
            });
        }
        // send error if given Column provided is invlaid
        if (isNaN(parseCol) || parseCol < 1) {
            deleteTempFile(req);
            return res.status(400).json({
                'error': "Invalid Column Number"
            });
        }

        // send error if given File is invlaid
        if (!file) {
            deleteTempFile(req);
            return res.status(400).json({
                'error': "Invalid File provided"
            });
        }

        // STRING VALUES
        if (req.body.worksheetStr)
            parseWorksheet = req.body.worksheetStr;

        if (req.body.colStr)
            parseCol = req.body.colStr.toUpperCase();

        // PARSE WORKBOOK using CUSTOM Script
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(file.path).then(() => {
            //console.log('col ', parseCol, ' worksheet: ', parseWorksheet);
            //console.log('worksett.len ', workbook.worksheets.length)

            var worksheet = workbook.getWorksheet(parseWorksheet);
            if (!worksheet) {
                deleteTempFile(req);
                return res.status(400).send({
                    'error': "Invalid Worksheet " + parseWorksheet
                });
            }
            // Send ERROR If col has no value
            if (worksheet.getColumn(parseCol).values.length < 1) {
                deleteTempFile(req);
                return res.status(400).send({
                    'error': "No DATA available in Column " + parseCol
                });
            }

            var items = [];
            worksheet.getColumn(parseCol).eachCell({
                includeEmpty: true
            }, (cell, rowNum) => {
                items.push(cell.value);
                //console.log("cell: ", cell.value, ' Row: ', rowNum);
            });

            var values = [];
            //console.log('req.body.col ', req.body.col);
            //console.log('req.body.nanp ', req.body.nanp);
            if (req.body.nanp) // USE nanp Script if set
                values = nanpScript.compareNumber(items);
            else // ELSE use custom script 
                values = customXLSX.getRegions(items);
            values[0] = 'Region';

            worksheet.getColumn(worksheet.actualColumnCount + 1).values = values;
            // Save Workbook
            workbook.creator = workbook.lastModifiedBy = '' + req.app.get('appName') + ' v' + req.app.get('appVer');
            workbook.modified = workbook.created = new Date();
            return workbook.xlsx.writeFile(file.path).then(() => {
                // Send Workbook

                res.setHeader('Content-Type', xlsxMimeType);
                res.download('./tmp/' + file.filename);

                // DELETE File after download
                // CALL /complete
            });
        });
    });
});

function deleteTempFile(req) {
    if (!req.session.filename) return;
    fs.unlinkSync(path.resolve('./tmp/' + req.session.filename)); // DELETE FILE 
    console.log("Deleted " + req.session.filename + " successfully");
    req.session.filename = undefined;
}

router.all('/complete', (req, res, next) => {
    if (!req.session.filename) return res.sendStatus(200);
    deleteTempFile(req);
    res.sendStatus(200);
});

router.all('*', function (req, res, next) {
    res.sendStatus(501);
});

module.exports = router;