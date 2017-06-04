/*jshint esversion: 6 */

//  This is the irrigation scheduling class.

const cron = require('node-cron');
const moment = require('moment');

/*
let startTime = new Date();

let cronString = moment().format('s m H D M d');
let cronStringPlus5 = moment().add(5, 'm').format('s m H D M d');
let cronStringPlus10 = moment().add(10, 'm').format('s m H D M d');

console.log(cronString);
console.log(cronStringPlus5);
console.log(cronStringPlus10);

cron.schedule(cronStringPlus5, () => {
    console.log('Firing at plus 5 minutes');
    let currentDate = new Date();
    let currentMomentDate = moment();
    console.log(`Javascript date: ${currentDate}`);
    console.log(`Moment date: ${currentMomentDate}`);
});

cron.schedule(cronStringPlus10, () => {
    console.log('Firing at plus 10 minutes');
    let currentDate = new Date();
    let currentMomentDate = moment();
    console.log(`Javascript date: ${currentDate}`);
    console.log(`Moment date: ${currentMomentDate}`);
});

console.log("This message after cron jobs.");pump
*/

let EventEmitter = require('events').EventEmitter;

module.exports = class Scheduler extends EventEmitter {

    constructor() {
        super();
        this.scheduleMap = new Map([['date', ""],
                              ['timeOn', ""],
                              ['timeOff', ""]]);
        this.scheduleProxy = new Proxy(this.scheduleMap, this.scheduleObserver());
        this.pumpGpioMap = new Map([['pumpmotor', '/sys/class/gpio/gpio50/value'],
                                   ['zone1', '/sys/class/gpio/gpio48/value'],
                                   ['zone2', '/sys/class/gpio/gpio51/value']]);
        //  Set the appropriate header pins to GPIO mode:
        
    }

    scheduleObserver() {
        return {
            set: (target, property, value, receiver) => {
                console.log(`Setting ${property} to ${value}.`);
                this.pumpControl(property, value);
                target[property] = value;
                return true;
            }
        };
    }
    
    //  This function takes an incoming object with schedule data and creates usable dates.
    scheduleInterpreter(data){
        let start = moment(data.startDate + ' ' + data.startTime).format('s m H D M d');
        let stop  = moment(data.startDate + ' ' + data.stopTime).format('s m H D M d');
     //   let start = data.startDate + ' ' + data.startTime;
     //   let stop  = data.startDate + ' ' + data.stopTime;
        
        console.log(`The start is ${start} and the stop is ${stop}`);
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
                console.log(`Status message emitted from ledActuator: ${pumpgpio} is set to ${command}.`);
                //  Send a JSON object with the value being an array.
                this.emit('statusmessage', `["${pumpgpio}",${command}]`);
            }
        });
    }
};
