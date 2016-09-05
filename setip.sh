#!/bin/sh
LOCALIP=`cat atem.txt| grep localip|cut -d'=' -f2`
echo "localip: $LOCALIP"
sudo ifconfig eth0 $LOCALIP
