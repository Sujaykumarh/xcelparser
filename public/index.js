/******************************************************************************
 ** Copyright (c) 2018 Sujaykumar.Hublikar <sujaykumar6390@gmail.com>
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

var apiURL = "/api/parser";
var parserURL = "/xlsx";
var formData = null;
var url;
const regxNumber = new RegExp('^[0-9]+$');

// Custom file drop extension https://stackoverflow.com/a/15809374
$.fn.extend({
    filedrop: function (options) {
        var defaults = {
            callback: null,
            class: ''
        };
        options = $.extend(defaults, options);
        return this.each(function () {
            var files = [];
            var $this = $(this);

            // Stop default browser actions
            $this.bind('dragover dragleave', function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (event.type === "dragover") $(this).addClass(options.class);
                else $(this).removeClass(options.class);
            });

            // Catch drop event
            $this.bind('drop', function (event) {
                $(this).removeClass(options.class);
                // Stop default browser actions
                event.stopPropagation();
                event.preventDefault();

                // Get all files that are dropped
                files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;
                if (options.callback) options.callback(files); // SEND FILES LIST
                /*
                // Convert uploaded file to data URL and pass trought callback
                if (options.callback) {
                    var reader = new FileReader()
                    reader.onload = function (event) {
                        options.callback(event.target.result);
                    }
                    reader.readAsDataURL(files[0]);
                }
                /*
                 */
                return false;
            })
        })
    }
});

$(window).on('load', function () {
    if (URL)
        url = new URL(window.location);
    // RESET values to server side
    $('#resetButton').click();
});

$(document).ready(function () {
    $('#fileUploadLink').on('click', function (e) {
        e.preventDefault();
        $('#fileInput').click();
    });

    $('#fileInput').change(function () {
        var filename = $('#fileInput').val().split('\\').pop();
        $("#fileName").html(filename);
        $('#parseButton').removeClass('disabled');
    });

    $('#fileUploadForm').submit(function (e) {
        e.preventDefault();
        formData = new FormData(this);
        var colData = $('#colSelect').val();
        formData.set(regxNumber.test(colData) ? "col" : "colStr", colData);
        // TODO
        // var worksheetData = $('#worksheetSelect').val();
        // formData.set(regxNumber.test(worksheetData) ? "worksheet" : "worksheetStr", worksheetData);
        if (URL && url.searchParams.get("nanp") !== null) // SEARCH URL FOR nanp scrip use
            formData.set('nanp', 'true');
        console.log(formData.get('nanp'));
        postData();
    });

    $('#resetButton').click(function () {
        $('#fileDropZone').removeClass('drop');
        $('#parseButton').addClass('disabled');
        $('#fileUploadForm').trigger('reset');
        $('#colSelect').val("1");
        $('#worksheetSelect').val("1")
        $("#fileName").html('none');
    });

    $('#parseButton').click(function () {
        if ($(this).hasClass('disabled')) return;

        // SEND Data 
        if ($('#fileDropZone').hasClass('drop')) {
            var colData = $('#colSelect').val();
            formData.set(regxNumber.test(colData) ? "col" : "colStr", colData);
            // TODO
            // var worksheetData = $('#worksheetSelect').val();
            // formData.set(regxNumber.test(worksheetData) ? "worksheet" : "worksheetStr", worksheetData);
            if (URL && url.searchParams.get("nanp") !== null) // SEARCH URL FOR nanp scrip use
                formData.set('nanp', 'true');
            console.log(formData.get('nanp'));
            postData();
        } else
            $('#fileUploadForm').submit();
    });


    $('#fileDropZone').filedrop({
        callback: function (files) {
            //console.log(files);
            formData = new FormData($('#fileUploadForm')[0]);
            formData.set("file", files[0]);
            $("#fileName").html(files[0].name);
            $('#parseButton').removeClass('disabled');
            $('#fileDropZone').addClass('drop');
        },
        class: 'drag'
    });

});

function postData() {
    // https://github.com/eligrey/FileSaver.js/wiki/Saving-a-remote-file
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiURL + parserURL);
    xhr.send(formData);
    //xhr.responseType = 'blob'; 
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 2) {
            if (xhr.status == 200) {
                xhr.responseType = "blob";
            } else {
                xhr.responseType = "text";
            }
        }
    };
    xhr.onload = function () {
        if (xhr.status !== 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response.error);
            return alert(response.error);
        }

        // save file https://stackoverflow.com/a/51355169
        var disposition = xhr.getResponseHeader('Content-Disposition');
        var startIndex = disposition.indexOf("filename=") + 10; // Adjust '+ 10' if filename is not the right one.
        var endIndex = disposition.length - 1; //Check if '- 1' is necessary
        var filename = disposition.substring(startIndex, endIndex);
        saveAs(xhr.response, filename);
        $.ajax({
            url: apiURL + '/complete',
            data: '',
            type: 'GET'
        });
    };
}