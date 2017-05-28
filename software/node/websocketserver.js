/*jshint esversion: 6 */

//  This is the WebSockets server for the Irrigation control.

//  Get the class:
const WebSocketServer = require('ws').Server;
let ledActuator = require('./ledActuator');

//  Create an ledActuator Object.
let ledObject = new ledActuator();

exports.listen = function (server) {
    const wss = new WebSocketServer({
        server: server
    });
    
    function heartbeat() {
        this.isAlive = true;
    }
    
    console.info('WebSocket server started...');
    wss.on('connection', function (ws) {
        ws.isAlive = true;
        ws.on('pong', heartbeat);

        let url = ws.upgradeReq.url;
        console.info(url);
        console.log(`The connection is open and request is from ${url}.`);

        //  Scan the connected sockets and write to the console.
        //  The clients property is a set.
        //        wss.clients.forEach(function each(client) {
        //           console.log("Printing size of set of WebSocket clients.");
        //      console.log(client);
        //       });

        console.log(`The number of clients is ${wss.clients.size}`);

        //console.log(`The WebSocket clients are ${wss.clients}.`);

        //  Handle message sent from Web Browser controller page.
        ws.on('message', function (data, flags) {
            console.log(`Received data from client: ${data}.`);
            let controlObject = JSON.parse(data);
            //  Modify the ledHash Proxy.  This will actuate the LEDs!
            //  Object.assign updates the ledHash in the ledActuator.
            Object.assign(ledObject.ledHashProxy, controlObject);
        });
        //  Send messages to the web page indicating control status.
        ledObject.on('statusmessage', function (message) {
            console.log(`Status message received by websocketserver and is: ${message}`);

            //  Ping sockets and kill the dead ones.
            if (ws.readyState === 1) {
                console.log("WebSocket is ready and sending status to Web Page.");
                ws.send(message);
                console.log("Sending status message to web page.");
            } else {
                (console.log(`Websocket was not ready and readyState is ${ws.readyState}.`));
                // Kill unready the WebSocket.
                console.log("Killing a defective websocket.");
                ws.terminate();
                //  Also, remove the Event Listener.
                ledObject.removeListener('statusmessage', () => {
                    console.log("statusmessage event removed from ledObject.");
                });
            }
        });

        //  Close the server if the WebSocket closes.
        //    ws.on('close', () => {
        //        console.log("Closing the WebSocket server.")
        //        wss.close();
        //   });
    });

    //  Close the server if the 'close' event is sent.
    wss.on('close', function () {
        wss.close(() => {
            console.log("Closing WebSocketServer.");
        });
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping('', false, true);
        });
    }, 1000);

};
