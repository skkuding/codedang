#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install OpenVPN
export ENDPOINT=$(curl ifconfig.me)
export AUTO_INSTALL=y
curl -fsSL https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh | sudo -E bash

### NOTE: After the installation, client.ovpn file will be created in the /root directory.
### You need to download it to your local machine to connect to the VPN server.
