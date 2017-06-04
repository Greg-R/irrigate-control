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
this.midTime = "";
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
        let start = moment(data.startDate + ' ' + data.startTime);       
        let stop = moment(data.startDate + ' ' + data.stopTime);
        let halfTime = stop.diff(start, 'm')/2;  //  This is difference in minutes /2.
        console.log(`The difference in minutes is ${halfTime}.`);
        this.start = moment(data.startDate + ' ' + data.startTime).format('s m H D M d');
        this.stop = moment(data.startDate + ' ' + data.stopTime).format('s m H D M d');
        console.log(`The start is ${this.start} and the stop is ${this.stop}`);
        //  Calculate the mid-time so the zones can be switched.
        //  Clone start;  Moments get mutated by their methods!
        let startClone = start.clone();
        this.halfTime = startClone.add(halfTime, 'm').format('s m H D M d');  // Compute half time.
        this.startCrons(this.start, this.stop, this.halfTime);
    }

    startCrons(start, stop, halfTime) {
        console.log(`From startCrons, the start is ${start} and the stop is ${stop} and half Time is ${halfTime}`);
        cron.schedule(start, () => {
            console.log(`System start at ${start}.`);
            let currentDate = new Date();
            let currentMomentDate = moment();
            console.log(`Javascript date: ${currentDate}`);
            console.log(`Moment date: ${currentMomentDate}`);
            this.emit('scheduleControl', ["zone2", 1]);
        });
        cron.schedule(stop, () => {
            console.log(`System shutdown at ${stop}.`);
            let currentDate = new Date();
            let currentMomentDate = moment();
            console.log(`Javascript date: ${currentDate}`);
            console.log(`Moment date: ${currentMomentDate}`);
            this.emit('scheduleControl', ["zone2", 0]);
        });
    }
    
    //  The following function calculates the mid-time between start and stop so the zones can be switched.
    // midTime(start,)
    
};
