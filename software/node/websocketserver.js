/*jshint esversion: 6 */
//  This is the WebSockets server for the Irrigation control.

//  Get the WebSocket class:
const WebSocketServer = require('ws').Server;
let pumpActuator = require('./pumpActuator');
let Scheduler = require('./scheduler');

exports.listen = function (server) {
    const wss = new WebSocketServer({
        server: server
    });

    console.info('WebSocket server started...');
    wss.on('connection', function (ws) {
        //  Note the use of let for ledObject; the Object will be destroyed if the wss is destroyed.
        let pumpObject = new pumpActuator();
        let scheduler = new Scheduler();

        let url = ws.upgradeReq.url;
        console.info(url);
        console.log(`The connection is open and request is from ${url}.`);
        console.log(`The number of clients is ${wss.clients.size}`);
//  Received messages from the web page and process.
        ws.on('message', (data, flags) => {
            console.log(`Received data from client: ${data}.`);
            let dataObject = JSON.parse(data);
            //  Determine the type of incoming data and dispatch to
            //  either the actuator or scheduling object.
            //  Modify the ledHash Proxy.  This will actuate the LEDs!
            //  Object.assign updates the ledHash in the ledActuator.
            if(dataObject.messageType === "pumpControl") {
            Object.assign(pumpObject.pumpMapProxy, dataObject.control);
        } else if(dataObject.messageType === "schedule") {
            console.log("Schedule message received");
            scheduler.scheduleInterpreter(dataObject);
        }
        });
        //  Handle automatic irrigation from scheduler.
        scheduler.on('scheduleControl', (controlArray) => {
            pumpObject.pumpMapProxy[controlArray[0]] = controlArray[1];
            pumpObject.pumpMapProxy.pumpmotor = controlArray[1];            
        });
 //       scheduler.on('zone1off', (controlArray) => {
 //           pumpObject.pumpMapProxy.controlArray[0] = 0;
 //           pumpObject.pumpMapProxy.pumpmotor = 0;            
 //       });
        
        
        //  Send messages to the web page indicating control status.
        pumpObject.on('statusmessage', function (message) {
            console.log(`Status message received by websocketserver and is: ${message}`);
            //  Send status message if the WebSocket is ready.  Terminate defective WebSockets.
            if (ws.readyState === 1) {
                console.log("WebSocket is ready and sending status to Web Page.");
                ws.send(message);
            } else {
                console.log("Killing a defective websocket.");
                ws.terminate();
            }
        });
    });

    //  Close the server if the 'close' event is sent.
    wss.on('close', function () {
        wss.close(() => {
            console.log("Closing WebSocketServer.");
        });
    });

};
