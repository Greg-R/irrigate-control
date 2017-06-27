#!/bin/bash

sleep 15
echo pcf85063 0x51 > /sys/class/i2c-adapter/i2c-2/new_device
hwclock -s -f /dev/rtc1
hwclock -w
