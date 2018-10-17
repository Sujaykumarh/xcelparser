var express = require('express');
var router = express.Router();
var excelsheetJSON = require('./excelsheet.json');
var _ = require('lodash');

router.getRegion = function (number) {
    var number = '' + number;
    var index = -1;
    var regions;
    if (number.startsWith('9')) {
        regions = excelsheetJSON['9xxx'];
    } else if (number.startsWith('8')) {
        regions = excelsheetJSON['8xxx'];
    } else if (number.startsWith('7')) {
        regions = excelsheetJSON['7xxx'];
    } else if (number.startsWith('6')) {
        regions = excelsheetJSON['6xxx'];
    }
    index = _.findIndex(regions, {
        'Num': number.slice(0, 4)
    });
    //console.log('region:', region, ' index:', index, ' number:', number);
    if (index > 0) {
        var region = regions[index].Region;
        return (region) ? region : '---';
    }
    if (number > 0) return '---';   // IF NUMBER AVAILABLE AND NOT FROM given LIST
    return '';  // DEFAULT EMPTY
}

router.getRegions = function (numbers) {
    var regions = [];
    numbers.forEach(number => {
        regions.push(router.getRegion(number));
    });
    return regions;
}

module.exports = router;