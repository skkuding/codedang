#!/bin/bash

# Update and upgrade the system
apt update && apt upgrade -y

# Install OpenVPN
export ENDPOINT="${ip_address}"
export AUTO_INSTALL=y
curl -fsSL https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh | bash

# Push the client.ovpn file to AWS Secrets Manager
aws secretsmanager put-secret-value --secret-id "${secret_id}" --secret-string "file://root/client.ovpn"
