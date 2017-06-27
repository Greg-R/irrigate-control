#!/bin/bash

sleep 15
echo ds1307 0x68 > /sys/class/i2c-adapter/i2c-2/new_device
hwclock -s -f /dev/rtc1
hwclock -w
