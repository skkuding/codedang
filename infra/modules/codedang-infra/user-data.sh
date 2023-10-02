#!/bin/bash
echo ECS_CLUSTER="${cluster_name}" >> /etc/ecs/ecs.config
echo ECS_ENABLE_TASK_IAM_ROLE=true >> /etc/ecs/ecs.config
echo ECS_ENABLE_CONTAINER_METADATA=true >> /etc/ecs/ecs.config
echo ECS_CONTAINER_INSTANCE_PROPAGATE_TAGS_FROM=ec2_instance >> /etc/ecs/ecs.config
