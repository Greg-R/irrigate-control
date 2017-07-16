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

//  This is the irrigation scheduling class.

const cron = require('node-cron');
const moment = require('moment');

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
        let halfTime = stop.diff(start, 'm') / 2; //  This is difference in minutes /2.
        console.log(`The difference in minutes is ${halfTime}.`);
        this.start = moment(data.startDate + ' ' + data.startTime).format('s m H D M d');
        this.stop = moment(data.startDate + ' ' + data.stopTime).format('s m H D M d');
        console.log(`The start is ${this.start} and the stop is ${this.stop}`);
        //  Calculate the mid-time so the zones can be switched.
        //  Clone start;  Moments get mutated by their methods!
        let startClone = start.clone();
        this.halfTime = startClone.add(halfTime, 'm'); // Compute half time.
        let halfTimeClone = this.halfTime.clone();
        this.halfTimePlus = halfTimeClone.add(10, 's').format('s m H D M d'); //  Add 10 seconds to half time.
        //  Send the Web Page the computed schedule.
        this.emit('schedule', JSON.stringify({
            "messageType": "schedule",
            "scheduleDate": start.format("dddd, MMMM Do YYYY"),
            "scheduleStart": start.format("h:mm:ss A"),
            "scheduleStop": stop.format("h:mm:ss A")
        }));
        this.startCrons(this.start, this.stop, this.halfTime.format('s m H D M d'), this.halfTimePlus);
    }

    startCrons(start, stop, halfTime, halfTimePlus) {
        console.log(`From startCrons, the start is ${start} and the stop is ${stop} and half Time is ${halfTime}`);
        cron.schedule(start, () => {
            this.emit('scheduleControl', ["zone1", 1]); // Start zone1 irrigation.
        });
        cron.schedule(halfTime, () => {
            this.emit('scheduleControl', ["zone1", 0]); // Stop zone1 irrigation.
        });
        cron.schedule(halfTimePlus, () => {
            this.emit('scheduleControl', ["zone2", 1]); // Start zone2 irrigation.
        });
        cron.schedule(stop, () => {
            this.emit('scheduleControl', ["zone2", 0]); // Stop zone2 irrigation.
        });
    }

    //  This function sends a JSON object with the current server time to the HTML client.
    //  This allows the actual server time to be displayed, rather than the local time of the client.
    //  This is important in the case of when a server gets time from a real time clock.
    timeDisplayUpdate() {
        console.log(`Time display update function started.`);
        setInterval(() => {
            let serverTime = moment().format("dddd, MMMM Do YYYY, h:mm:ss A");
            let jsonTimeUpdate = `{"messageType":"serverTime", "serverTime":${serverTime}}`;
            this.emit('timeDisplayUpdate', jsonTimeUpdate);
        }, 30 * 1000); //  Every 30 seconds.
    }

};
