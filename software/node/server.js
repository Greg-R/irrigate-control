//    Software for Irrigation Control Project
//    Copyright (C) 2017  Gregory Raven
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*jshint esversion: 6 */

//  Main server for irrigate-control

let http = require('http');
let fs = require('fs');
let mime =require('mime');

let base = '../html';
//let base = '/home/debian/irrigate-control/software/html';
let wsServer = require('./websocketserver');

let server = http.createServer(function (req, res) {
    let pathname = __dirname + "/" + base + req.url;
    console.log(`The url from the request is ${pathname}.`);

    //  Respond to the request.  Need to detect request for css
    //  and respond appropriately.
    let type = mime.lookup(req.url);
    console.log(`The type of the request is ${type}.`);
    res.setHeader('Content-type', type);
    //  Create and pipe a readable stream:
    let file = fs.createReadStream(pathname);
    file.on('open', function () {
        // 200 status found, no errors.
        res.statusCode = 200;
        file.pipe(res);
    });
    file.on('error', function (err) {
        res.writeHead(403);
        res.write('file missing, or permission problem');
        console.log(err);
    });

}).listen(8089);

//Websockets server
wsServer.listen(server);

console.log('Server is running at port 8089.');
