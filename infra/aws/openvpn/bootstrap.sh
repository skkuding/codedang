#!/bin/bash

# Update and upgrade the system
apt update && apt upgrade -y

# Install OpenVPN
export ENDPOINT="${ip_address}"
export AUTO_INSTALL=y
curl -fsSL https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh | bash
echo "OpenVPN installed."

# Push the client.ovpn file to AWS Secrets Manager
aws secretsmanager put-secret-value --secret-id "${secret_id}" --secret-string "file://root/client.ovpn"
echo "Client configuration pushed to AWS Secrets Manager."

# Associate Elastic IP with the instance
INSTANCE_ID=$(ec2-metadata -i | cut -d ' ' -f 2)
while true; do
  # Try to associate the Elastic IP until it succeeds
  aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id "${eip_allocation_id}" && break
  echo "Retrying to associate Elastic IP..."
  sleep 5
done

echo "Elastic IP associated with the instance."
echo "✅ Bootstrap script completed."
