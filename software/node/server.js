/*jshint esversion: 6 */

//  Main server for irrigate-control

let http = require('http');
let fs = require('fs');
let base = './../html';
 // let wsServer = require('./websocketserver');

let server = http.createServer(function(req, res) {
    //let pathname = base + req.url;
    //console.log(`The url from the request is ${pathname}.`);
    
    //  Respond to the request:
//    res.setHeader('Content-type', 'text/html');
    //  Create and pipe a readable stream:
    //let file = fs.createReadStream(pathname);
/*    file.on('open', function() {
        // 200 status found, no errors.
        res.statusCode = 200;
    //    file.pipe(res);
    });
    file.on('error', function(err) {
        res.writeHead(403);
        res.write('file missing, or permission problem');
        console.log(err);
    });*/
    
}).listen(8080);

// Websockets server
//  wsServer.listen(server);

console.log('Server is running at port 8080.');