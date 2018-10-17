## xCelParser

<br>

Actual Server with its frontend

#### [SERVER](https://xcelparser.herokuapp.com/)

------
Frontend Using server API callbacks

#### [CLIENT DEMO](https://sujaykumarh.github.io/xcelparser/)

-----

### About

xlsx parser modifies .xlsx based on custom script 

This is the sever side code repo. Checkout [gh-pages](https://github.com/Sujaykumarh/xcelparser/tree/gh-pages) for client side implemntation using api callback.

### Screenshot

![Screenshot](https://raw.githubusercontent.com/Sujaykumarh/xcelparser/master/public/extra/screenshot/screenshot_1.png)

<br>

#### API DOCS

for .xlsx files

    HOW TO READ :
    
    "KEY"           specifes key to be sent
    
    [DATA_TYPE]     specifies type of data
    
    REQUEST_TYPE >  type of request
    
    <               RESPONSE FOR REQUEST
    
    =========================================

    1. <app_url>/api/parser/xlsx
    
    REQUEST_TYPE: POST >
    
    SEND multipart/form-data with key in request body
    
    [BLOB]  "file"          : xlsx file blob
    [NUM]   "col"           : column Number 
    [NUM]   "worksheet"     : worksheet to parse 
    [STRING]"colStr"        : coloumn eg: A or AA
    [STRING]"worksheetStr"  : worksheet to parse eg: Sheet 1
    
    < RESPONSE : [ BLOB / JSON ]
    
    [BLOB]    on status HTTP_CODE: 200
    [JSON]    else for all errors [ generally HTTP_CODE: 400 ]
    
    
<br>

## License

    Copyright 2018 - Sujaykumar.Hublikar <hello@sujaykumarh.com>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.


<br>

#### Why?

Was asked by recruiter, for my interest in a position for Backend Developer - Node JS
