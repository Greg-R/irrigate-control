/*jshint esversion: 6 */

//  This is the WebSockets server for the Irrigation control.

//  Get the class:
let WebSocketServer = require('ws').Server;

exports.listen = function (server) {
    var wss = new WebSocketServer({
        server: server
    }); //#B
    console.info('WebSocket server started...');
    wss.on('connection', function (ws) { //#C
        var url = ws.upgradeReq.url;
        console.info(url);
        console.log(`The connection is open and request is from ${url}.`);
        ws.on('message', function (data, flags) { //#D subscribe to event.
            console.log(`Received data from client: ${data}.`);
        });
    });

};
