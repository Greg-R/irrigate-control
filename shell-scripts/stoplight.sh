#!/bin/bash
#  The solid-state relays are active low,
#  so set the GPIOs to high upon start-up.

config-pin P9.14 high_pd
config-pin P9.15 high_pd
config-pin P9.16 high_pd
