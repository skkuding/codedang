#!/bin/bash
if [[ -n "$APP_ENV" && $APP_ENV = "production" ]]
    then ECS_CONTAINER_ID=$(head -1 /proc/self/cgroup | cut -d/ -f4)
    ./iris $ECS_CONTAINER_ID
else
    ./iris
fi