#!/bin/bash
set -e

apt-get update -y

# Install Docker
apt-get install -y docker.io

systemctl enable docker
systemctl start docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Docker Compose v2 Plugin
mkdir -p /usr/local/lib/docker/cli-plugins

curl -SL \
https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
-o /usr/local/lib/docker/cli-plugins/docker-compose

chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify installation
docker --version
docker compose version

# Install Git
apt-get install -y git

# Install Nginx
apt-get install -y nginx

systemctl enable nginx
systemctl start nginx

# Deployment directories
mkdir -p /opt/blueboard/backend
mkdir -p /opt/blueboard/deployment
mkdir -p /opt/blueboard/logs

chown -R ubuntu:ubuntu /opt/blueboard