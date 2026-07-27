#!/bin/bash

set -e

exec > >(tee /var/log/user-data.log | logger -t user-data ) 2>&1

echo "========== BlueBoard EC2 Bootstrap Started =========="

apt-get update -y
apt-get upgrade -y

echo "Installing required packages..."

apt-get install -y \
docker.io \
docker-compose-v2 \
git \
curl \
wget \
unzip \
nginx

echo "Enabling Docker..."

systemctl enable docker
systemctl start docker

echo "Adding ubuntu user to docker group..."

usermod -aG docker ubuntu

echo "Enabling Nginx..."

systemctl enable nginx
systemctl start nginx

echo "Creating project directory..."

mkdir -p /opt/blueboard

chown -R ubuntu:ubuntu /opt/blueboard

echo "Cleaning apt cache..."

apt-get autoremove -y
apt-get clean

echo "========== BlueBoard EC2 Bootstrap Completed =========="