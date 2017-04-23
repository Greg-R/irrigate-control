/*jshint esversion: 6 */

//  Led Control Actuator Object

let EventEmitter = require('events').EventEmitter;
const exec = require('child_process').exec;

module.exports = class ledActuator extends EventEmitter {
    
    constructor() {
        super();
        this.ledHash = {
            'pumpmotor': "off",
            'zone1': "off",
            'zone2': "off"
        };
        this.ledHashProxy = new Proxy(this.ledHash, this.ledObserver);
        //  Using pins 8.7 (gpio66), 8.8 (gpio67), and 8.10 (gpio68).
        this.ledGpioMap = new Map([['pumpmotor', '/sys/class/gpio/gpio66/value'], 
                                   ['zone1', '/sys/class/gpio/gpio67/value'], 
                                   ['zone2', '/sys/class/gpio/gpio66/value']]);
    }

    ledObserver() {
        return {
            set: function (target, property, value, receiver) {
                console.log(`Setting the LED value to ${value}.`);
                this.ledControl(property, value);
            }
        };
    }

    //  This method does system calls on /sys to control the LEDs.
    ledControl(ledgpio, command) {
        console.log('ledControl method was called!');
        const exec = require('child_process').exec;
        exec(`echo ${command} > ${this.ledGpioMap[ledgpio]}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
    }


};
