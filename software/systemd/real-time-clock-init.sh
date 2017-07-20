#!/bin/bash

echo 'pcf85063 0x51' > /sys/class/i2c-adapter/i2c-2/new_device
hwclock -s --rtc /dev/rtc1 --debug
hwclock --adjust --rtc /dev/rtc1
