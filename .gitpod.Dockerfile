FROM gitpod/workspace-full:latest

# Install Node.js
RUN nvm install v22.14.0

# Install sandbox
# FIXME: we don't need 777 permission
RUN sudo mkdir -p /app/sandbox/policy /app/sandbox/results \
  && sudo mkdir -p /app/sandbox/logs/run /app/sandbox/logs/compile
RUN sudo chmod -R 777 /app/sandbox

RUN architecture=$(dpkg --print-architecture) && if [ "$architecture" = "arm64" ]; then \
  curl -L "https://github.com/skkuding/codedang/releases/download/alpha/libjudger-arm.so" -o "/app/sandbox/libjudger.so"; \
  else \
  curl -L "https://github.com/skkuding/codedang/releases/download/alpha/libjudger-x64.so" -o "/app/sandbox/libjudger.so"; \
  fi
RUN chmod 755 /app/sandbox/libjudger.so

# Install dependencies
RUN sudo apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && sudo apt-get -y install --no-install-recommends netcat

# Add go binaries to secure path
RUN sudo bash -c 'echo "Defaults secure_path=\"/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/gitpod/go/bin\"" > /etc/sudoers.d/secure_path'
RUN sudo chmod 440 /etc/sudoers.d/secure_path

# Install RabbitMQ CLI tool
RUN sudo curl https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/main/deps/rabbitmq_management/bin/rabbitmqadmin -o /usr/local/bin/rabbitmqadmin
RUN sudo chmod 755 /usr/local/bin/rabbitmqadmin
