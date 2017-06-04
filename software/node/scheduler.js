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
        this.start = "";
        this.stop = "";

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

    //  This function takes an incoming object with schedule data and creates usable format for node-cron.
    scheduleInterpreter(data) {
        this.start = moment(data.startDate + ' ' + data.startTime).format('s m H D M d');
        this.stop = moment(data.startDate + ' ' + data.stopTime).format('s m H D M d');
        console.log(`The start is ${this.start} and the stop is ${this.stop}`);
        this.startCrons();
    }

    startCrons() {
        cron.schedule(this.start, () => {
            console.log('Firing at plus 5 minutes');
            let currentDate = new Date();
            let currentMomentDate = moment();
            console.log(`Javascript date: ${currentDate}`);
            console.log(`Moment date: ${currentMomentDate}`);
        });

        cron.schedule(this.stop, () => {
            console.log('Firing at plus 10 minutes');
            let currentDate = new Date();
            let currentMomentDate = moment();
            console.log(`Javascript date: ${currentDate}`);
            console.log(`Moment date: ${currentMomentDate}`);
        });
    }
};
