/*jshint esversion: 6 */

//  This is the WebSockets server for the Irrigation control.

//  Get the class:
let WebSocketServer = require('ws').Server;
let ledActuator = require('./ledActuator');

let ledObject = new ledActuator();

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
            let controlObject = JSON.parse(data);
            //  Modify the ledHash Proxy.  This will actuate the LEDs!
            //  Object.assign updates the ledHash in the ledActuator.
            Object.assign(ledObject.ledHashProxy, controlObject);
        });
        //  Send messages to the web page indicating control status.
        ledObject.on('statusmessage', function (message) {
            console.log(`Status message received by websocketserver and is: ${message}`);
            ws.send(message);
        });
    });

};
