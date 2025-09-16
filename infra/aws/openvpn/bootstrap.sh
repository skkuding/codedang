#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install OpenVPN
export ENDPOINT="${ip_address}"
export AUTO_INSTALL=y
curl -fsSL https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh | sudo -E bash

# Push the client.ovpn file to AWS Secrets Manager
sudo cp /root/client.ovpn $HOME/client.ovpn
aws secretsmanager put-secret-value --secret-id "${secret_id}" --secret-string "file://$HOME/client.ovpn"
