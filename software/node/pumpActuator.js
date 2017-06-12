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

//  Pump Control Actuator Object

let EventEmitter = require('events').EventEmitter;

module.exports = class pumpActuator extends EventEmitter {

    constructor() {
        super();
        this.pumpMap = new Map([['pumpmotor', 0],
                              ['zone1', 0],
                              ['zone2', 0]]);
        this.pumpMapProxy = new Proxy(this.pumpMap, this.pumpObserver());
        //  Using header pins 9.14 (gpio50), 9.15 (gpio48), 9.16 (gpio51).
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
                target.set(property, value);
                this.pumpControl(property, value);
                return true;
            }
        };
    }

    //  This method does system calls on /sys to control the LEDs.
    pumpControl(pumpgpio, command) {
        const exec = require('child_process').exec;
        exec(`echo ${command} > ${this.pumpGpioMap.get(pumpgpio)}`, (error, stdout, stderr) => {
            // If error, do not update the status of the controls.
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            } else {
                console.log(`Status message emitted from pumpActuator: ${pumpgpio} is set to ${command}.`);
                //  Send a JSON object with the value being an array.
                //     this.emit('statusmessage', `["${pumpgpio}",${command}]`);
                this.emit('pumpStatusMessage', JSON.stringify({
                    "messageType": "pumpControl",
                    "pumpmotor": this.pumpMap.get('pumpmotor'),
                    "zone1": this.pumpMap.get('zone1'),
                    "zone2": this.pumpMap.get("zone2")
                }));
            }
        });
    }
};
