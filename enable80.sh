#!/bin/sh

npath=$(whereis node | cut -d ' ' -f 2)
echo $npath
# enable nodejs to run on port 80
setcap cap_net_bind_service=+ep $npath
