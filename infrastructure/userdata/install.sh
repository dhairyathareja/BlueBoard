#!/bin/bash
set -e

exec > >(tee /var/log/user-data.log | logger -t user-data) 2>&1

echo "========== BlueBoard Bootstrap =========="

apt-get update -y
apt-get upgrade -y

apt-get install -y \
docker.io \
docker-compose \
git \
curl \
wget \
unzip \
nginx

systemctl enable docker
systemctl start docker

systemctl enable nginx
systemctl start nginx

usermod -aG docker ubuntu

mkdir -p /opt/blueboard/backend
mkdir -p /opt/blueboard/deployment
mkdir -p /opt/blueboard/logs

chown -R ubuntu:ubuntu /opt/blueboard

echo "========== Bootstrap Complete =========="