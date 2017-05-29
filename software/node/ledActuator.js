/*jshint esversion: 6 */

//  Pump Control Actuator Object

let EventEmitter = require('events').EventEmitter;
const exec = require('child_process').exec;

module.exports = class pumpActuator extends EventEmitter {

    constructor() {
        super();
/*        this.ledHash = {
            'pumpmotor': 0,
            'zone1': 0,
            'zone2': 0
        };*/
        
        this.pumpMap = new Map([['pumpmotor', 0],
                              ['zone1', 0],
                              ['zone2', 0]]);
        
      //  this.ledHashProxy = new Proxy(this.ledHash, this.ledObserver());
        this.pumpHashProxy = new Proxy(this.pumpMap, this.pumpObserver());
        //  Using pins 8.7 (gpio66), 8.8 (gpio67), and 8.10 (gpio68).
        //  Revised to pins 9.14 (gpio50), 9.15 (gpio48), 9.16 (gpio51).
        //  This moves to more convenient physical location for permanent wiring.
        this.pumpGpioMap = new Map([['pumpmotor', '/sys/class/gpio/gpio50/value'],
                                   ['zone1', '/sys/class/gpio/gpio48/value'],
                                   ['zone2', '/sys/class/gpio/gpio51/value']]);
        //  Set the appropriate header pins to GPIO mode:
        this.setGpio('P9.14');
        this.setGpio('P9.15');
        this.setGpio('P9.16');
    }

    //  This function sets the header pin to GPIO mode, state=low and with pull-down.
    setGpio(headerPin) {
        const exec = require('child_process').exec;
        console.log(`Setting header pin ${headerPin} to GPIO mode.`);
        exec(`config-pin ${headerPin} low_pd`);
    }

    pumpObserver() {
        return {
            set: (target, property, value, receiver) => {
                console.log(`Setting ${property} to ${value}.`);
                this.pumpControl(property, value);
                target[property] = value;
                return true;
            }
        };
    }

    //  This method does system calls on /sys to control the LEDs.
    pumpControl(pumpgpio, command) {
        //       console.log('ledControl method was called!');
        const exec = require('child_process').exec;
        //       console.log(`ledgpio = ${ledgpio} and this.ledGpioMap[ledgpio] = ${this.ledGpioMap.get(ledgpio)}`);
        //       console.log(`echoing this command: echo ${command} > ${this.ledGpioMap.get(ledgpio)}`);
        exec(`echo ${command} > ${this.pumpGpioMap.get(pumpgpio)}`, (error, stdout, stderr) => {
            // If error, do not update the status of the controls.
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            } else {
                console.log(`Status message emitted from ledActuator: ${pumpgpio} is set to ${command}.`);
                //  Send a JSON object with the value being an array.
                this.emit('statusmessage', `["${pumpgpio}",${command}]`);
            }
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
        });
    }
};
